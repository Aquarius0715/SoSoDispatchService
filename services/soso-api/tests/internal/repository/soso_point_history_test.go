package repository_test

import (
	"context"
	"regexp"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"

	"soso/internal/repository"
)

/* ---------------------------------------------------------------
   Helper
--------------------------------------------------------------- */

func newSosoPointRepoMock(t *testing.T) (*repository.SosoPointRepository, sqlmock.Sqlmock, func()) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherRegexp))
	assert.NoError(t, err)
	return repository.NewSosoPointRepository(db), mock, func() { _ = db.Close() }
}

/* ---------------------------------------------------------------
   FindHistoriesByEventID
--------------------------------------------------------------- */

func TestFindHistoriesByEventID_OK(t *testing.T) {
	repo, mock, close := newSosoPointRepoMock(t)
	defer close()

	evID := "ev1"
	t1 := time.Now().Add(-time.Hour).Truncate(time.Microsecond)
	t2 := time.Now().Truncate(time.Microsecond)

	rows := sqlmock.NewRows([]string{
		"id", "calender_id", "user_id", "changed_at", "changed_by", "event_id",
		"old_point", "new_point", "point_delta", "reason",
	}).AddRow(
		int64(2), "calA", "u1", t2, "admin", evID, 10, 15, 5, "bonus",
	).AddRow(
		int64(1), "calA", "u2", t1, nil, evID, 20, 18, -2, nil, // changed_by, reason が NULL
	)

	mock.ExpectQuery(regexp.QuoteMeta(repository.SQLSosoPointHistoryFindByEventID)).
		WithArgs(evID).
		WillReturnRows(rows)

	got, err := repo.FindHistoriesByEventID(context.Background(), evID)
	assert.NoError(t, err)
	assert.Len(t, got, 2)

	// 1行目
	assert.EqualValues(t, 2, got[0].ID)
	assert.Equal(t, "calA", got[0].CalenderID)
	assert.Equal(t, "u1", got[0].UserID)
	assert.True(t, got[0].ChangedAt.Equal(t2))
	if assert.NotNil(t, got[0].ChangedBy) {
		assert.Equal(t, "admin", *got[0].ChangedBy)
	}
	if assert.NotNil(t, got[0].EventID) {
		assert.Equal(t, evID, *got[0].EventID)
	}
	assert.Equal(t, 10, got[0].OldPoint)
	assert.Equal(t, 15, got[0].NewPoint)
	assert.Equal(t, 5, got[0].PointDelta)
	assert.Equal(t, "bonus", got[0].Reason)

	// 2行目（NULLの扱い）
	assert.Nil(t, got[1].ChangedBy)
	assert.NotNil(t, got[1].EventID)
	assert.Equal(t, "", got[1].Reason)

	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestFindHistoriesByEventID_QueryError(t *testing.T) {
	repo, mock, close := newSosoPointRepoMock(t)
	defer close()

	evID := "evX"
	mock.ExpectQuery(regexp.QuoteMeta(repository.SQLSosoPointHistoryFindByEventID)).
		WithArgs(evID).
		WillReturnError(assert.AnError)

	_, err := repo.FindHistoriesByEventID(context.Background(), evID)
	assert.Error(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

/* ---------------------------------------------------------------
   FindHistoriesByCalenderID
--------------------------------------------------------------- */

func TestFindHistoriesByCalenderID_OK_WithNullEventID(t *testing.T) {
	repo, mock, close := newSosoPointRepoMock(t)
	defer close()

	calID := "calA"
	t1 := time.Now().Add(-2 * time.Hour).Truncate(time.Microsecond)
	t2 := time.Now().Add(-time.Hour).Truncate(time.Microsecond)

	rows := sqlmock.NewRows([]string{
		"id", "calender_id", "user_id", "changed_at", "changed_by", "event_id",
		"old_point", "new_point", "point_delta", "reason",
	}).AddRow(
		int64(3), calID, "u1", t2, "admin", nil, 50, 55, 5, "manual adjust", // event_id = NULL
	).AddRow(
		int64(2), calID, "u2", t1, nil, "ev2", 30, 20, -10, "penalty",
	)

	mock.ExpectQuery(regexp.QuoteMeta(repository.SQLSosoPointHistoryFindByCalenderID)).
		WithArgs(calID).
		WillReturnRows(rows)

	got, err := repo.FindHistoriesByCalenderID(context.Background(), calID)
	assert.NoError(t, err)
	assert.Len(t, got, 2)

	// 1行目: event_id が NULL → ポインタ nil
	assert.Nil(t, got[0].EventID)
	assert.NotNil(t, got[0].ChangedBy)
	assert.Equal(t, "manual adjust", got[0].Reason)

	// 2行目: changed_by が NULL
	assert.Nil(t, got[1].ChangedBy)
	if assert.NotNil(t, got[1].EventID) {
		assert.Equal(t, "ev2", *got[1].EventID)
	}

	assert.NoError(t, mock.ExpectationsWereMet())
}

/* ---------------------------------------------------------------
   UpdatePointWithLog（トランザクション）
--------------------------------------------------------------- */

func TestUpdatePointWithLog_OK_WithChangedByAndEventID(t *testing.T) {
	repo, mock, close := newSosoPointRepoMock(t)
	defer close()

	calID := "calA"
	userID := "u1"
	oldPt := 10
	newPt := 15
	cb := "admin"
	ev := "ev1"
	reason := "bonus"

	// tx begin
	mock.ExpectBegin()

	// SELECT ... FOR UPDATE
	mock.ExpectQuery(`SELECT\s+soso_point\s+FROM\s+calender_memberships`).
		WithArgs(calID, userID).
		WillReturnRows(sqlmock.NewRows([]string{"soso_point"}).AddRow(oldPt))

	// UPDATE
	mock.ExpectExec(`UPDATE\s+calender_memberships\s+SET\s+soso_point`).
		WithArgs(newPt, calID, userID).
		WillReturnResult(sqlmock.NewResult(0, 1))

	// INSERT history
	mock.ExpectExec(`INSERT\s+INTO\s+soso_point_histories`).
		WithArgs(calID, userID, &cb, &ev, oldPt, newPt, newPt-oldPt, reason).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// commit
	mock.ExpectCommit()

	err := repo.UpdatePointWithLog(context.Background(), calID, userID, newPt, &cb, &ev, reason)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdatePointWithLog_OK_WithNilChangedByAndEventID(t *testing.T) {
	repo, mock, close := newSosoPointRepoMock(t)
	defer close()

	calID := "calA"
	userID := "u1"
	oldPt := 7
	newPt := 9
	var cb *string
	var ev *string
	reason := "system adjust"

	mock.ExpectBegin()
	mock.ExpectQuery(`SELECT\s+soso_point\s+FROM\s+calender_memberships`).
		WithArgs(calID, userID).
		WillReturnRows(sqlmock.NewRows([]string{"soso_point"}).AddRow(oldPt))
	mock.ExpectExec(`UPDATE\s+calender_memberships\s+SET\s+soso_point`).
		WithArgs(newPt, calID, userID).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(`INSERT\s+INTO\s+soso_point_histories`).
		WithArgs(calID, userID, cb, ev, oldPt, newPt, newPt-oldPt, reason).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectCommit()

	err := repo.UpdatePointWithLog(context.Background(), calID, userID, newPt, cb, ev, reason)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdatePointWithLog_SelectError_Rollback(t *testing.T) {
	repo, mock, close := newSosoPointRepoMock(t)
	defer close()

	calID := "calA"
	userID := "uX"

	mock.ExpectBegin()
	mock.ExpectQuery(`SELECT\s+soso_point\s+FROM\s+calender_memberships`).
		WithArgs(calID, userID).
		WillReturnError(assert.AnError)
	mock.ExpectRollback()

	err := repo.UpdatePointWithLog(context.Background(), calID, userID, 99, nil, nil, "x")
	assert.Error(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdatePointWithLog_UpdateError_Rollback(t *testing.T) {
	repo, mock, close := newSosoPointRepoMock(t)
	defer close()

	calID := "calA"
	userID := "u1"

	mock.ExpectBegin()
	mock.ExpectQuery(`SELECT\s+soso_point\s+FROM\s+calender_memberships`).
		WithArgs(calID, userID).
		WillReturnRows(sqlmock.NewRows([]string{"soso_point"}).AddRow(1))
	mock.ExpectExec(`UPDATE\s+calender_memberships\s+SET\s+soso_point`).
		WithArgs(5, calID, userID).
		WillReturnError(assert.AnError)
	mock.ExpectRollback()

	err := repo.UpdatePointWithLog(context.Background(), calID, userID, 5, nil, nil, "x")
	assert.Error(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}
