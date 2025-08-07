package repository_test

import (
	"context"
	"testing"
	"time"

	"soso/internal/model"
	"soso/internal/repository"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
)

// モック付きリポジトリを返すヘルパ
func newEventParticipantRepoMock(t *testing.T) (*repository.EventParticipantRepository, sqlmock.Sqlmock, func()) {
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherRegexp))
	assert.NoError(t, err)
	return repository.NewEventParticipantRepository(db), mock, func() { _ = db.Close() }
}

// -------------------------
// 1. BulkInsert 正常系
// -------------------------
func TestEventParticipantRepository_BulkInsert_OK(t *testing.T) {
	repo, mock, closeFn := newEventParticipantRepoMock(t)
	defer closeFn()

	// テストデータを 2 件用意
	ts := time.Date(2025, 8, 8, 10, 0, 0, 0, time.UTC)
	in := []model.EventParticipant{
		{
			EventID:      "ev1",
			UserID:       "u1",
			Status:       model.Registered,
			Type:         model.Participants,
			RegisteredAt: ts,
		},
		{
			EventID:      "ev1",
			UserID:       "u2",
			Status:       model.Registered,
			Type:         model.Go,
			RegisteredAt: ts,
		},
	}

	// 期待されるトランザクションの流れ
	mock.ExpectBegin()
	mock.
		ExpectExec(`INSERT INTO event_participants`).
		WithArgs(
			in[0].EventID, in[0].UserID, string(in[0].Status), string(in[0].Type), sqlmock.AnyArg(),
			in[1].EventID, in[1].UserID, string(in[1].Status), string(in[1].Type), sqlmock.AnyArg(),
		).
		WillReturnResult(sqlmock.NewResult(1, int64(len(in))))
	mock.ExpectCommit()

	err := repo.BulkInsert(context.Background(), in)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// -------------------------
// 2. BulkInsert 空スライス
// -------------------------
func TestEventParticipantRepository_BulkInsert_Empty(t *testing.T) {
	repo, mock, closeFn := newEventParticipantRepoMock(t)
	defer closeFn()

	err := repo.BulkInsert(context.Background(), nil) // or []model.EventParticipant{}
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet()) // 何も実行されないことを確認
}

// -------------------------
// 3. BulkInsert 失敗 → Rollback
// -------------------------
func TestEventParticipantRepository_BulkInsert_Error(t *testing.T) {
	repo, mock, closeFn := newEventParticipantRepoMock(t)
	defer closeFn()

	in := []model.EventParticipant{
		{
			EventID: "ev1", UserID: "u1",
			Status: model.Registered, Type: model.Participants,
		},
	}

	mock.ExpectBegin()
	mock.
		ExpectExec(`INSERT INTO event_participants`).
		WithArgs(
			in[0].EventID, in[0].UserID, string(in[0].Status), string(in[0].Type), sqlmock.AnyArg(),
		).
		WillReturnError(assert.AnError)
	mock.ExpectRollback()

	err := repo.BulkInsert(context.Background(), in)
	assert.Error(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// -------------------------
// FindByEventIDAndType 正常系
// -------------------------
func TestEventParticipantRepository_FindByEventIDAndType_OK(t *testing.T) {
	repo, mock, closeFn := newEventParticipantRepoMock(t)
	defer closeFn()

	const (
		eventID = "ev1"
		pt      = model.Go
	)
	now := time.Now()

	rows := sqlmock.NewRows([]string{
		"event_id", "user_id", "status", "type", "registered_at",
	}).AddRow(eventID, "u1", "registered", string(pt), now).
		AddRow(eventID, "u2", "registered", string(pt), now)

	mock.ExpectQuery(`SELECT\s+event_id`).
		WithArgs(eventID, string(pt)).
		WillReturnRows(rows)

	got, err := repo.FindByEventIDAndType(context.Background(), eventID, pt)
	assert.NoError(t, err)
	assert.Len(t, got, 2)
	assert.Equal(t, "u1", got[0].UserID)
	assert.Equal(t, model.Go, got[0].Type)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// -------------------------
// FindByEventIDAndType 0 件
// -------------------------
func TestEventParticipantRepository_FindByEventIDAndType_Empty(t *testing.T) {
	repo, mock, closeFn := newEventParticipantRepoMock(t)
	defer closeFn()

	mock.ExpectQuery(`SELECT\s+event_id`).
		WithArgs("ev2", string(model.Go)).
		WillReturnRows(sqlmock.NewRows([]string{
			"event_id", "user_id", "status", "type", "registered_at",
		})) // 空

	got, err := repo.FindByEventIDAndType(context.Background(), "ev2", model.Go)
	assert.NoError(t, err)
	assert.Empty(t, got)
	assert.NoError(t, mock.ExpectationsWereMet())
}

/* ----------------------------------------------------------------
   4. FetchUserInfos
   ---------------------------------------------------------------- */

func TestEventParticipantRepository_FetchUserInfos_OK(t *testing.T) {
	repo, mock, closeFn := newEventParticipantRepoMock(t)
	defer closeFn()

	const eid = "ev1"

	rows := sqlmock.NewRows([]string{
		"username", "capacity", "type",
	}).AddRow("alice", 2, string(model.Participants)).
		AddRow("bob", 4, string(model.Go)).
		AddRow("carol", 3, string(model.Return))

	mock.ExpectQuery(`SELECT\s+u\.username`).
		WithArgs(eid).
		WillReturnRows(rows)

	got, err := repo.FetchUserInfos(context.Background(), eid)
	assert.NoError(t, err)
	assert.Len(t, got, 3)
	assert.Equal(t, "alice", got[0].UserName)
	assert.Equal(t, 4, got[1].Capacity)
	assert.Equal(t, model.Return, got[2].Type)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestEventParticipantRepository_FetchUserInfos_Empty(t *testing.T) {
	repo, mock, closeFn := newEventParticipantRepoMock(t)
	defer closeFn()

	mock.ExpectQuery(`SELECT\s+u\.username`).
		WithArgs("evX").
		WillReturnRows(sqlmock.NewRows([]string{"username", "capacity", "type"}))

	got, err := repo.FetchUserInfos(context.Background(), "evX")
	assert.NoError(t, err)
	assert.Empty(t, got)
	assert.NoError(t, mock.ExpectationsWereMet())
}

/* ----------------------------------------------------------------
   5. FetchMemberInfos
   ---------------------------------------------------------------- */

/*
----------------------------------------------------------------
 5. FetchMemberInfos
    ----------------------------------------------------------------
*/
const sqlFetchMemberInfos = `
		SELECT u\.id, u\.username, cm\.soso_point
		FROM event_participants AS ep
		INNER JOIN events   AS e  ON e\.id = ep\.event_id
		INNER JOIN calender_memberships AS cm
		     ON cm\.calender_id = e\.calender_id
		     AND cm\.user_id     = ep\.user_id
		INNER JOIN users AS u ON u\.id = ep\.user_id
		WHERE ep\.event_id = \? AND ep\.type = 'participants'`

// ---------- 正常系 ----------
func TestEventParticipantRepository_FetchMemberInfos_OK(t *testing.T) {
	repo, mock, closeFn := newEventParticipantRepoMock(t)
	defer closeFn()

	rows := sqlmock.NewRows([]string{
		"id", "username", "soso_point",
	}).AddRow("u1", "alice", 11).
		AddRow("u2", "bob", 7).
		AddRow("u3", "carol", 5)

	mock.ExpectQuery(sqlFetchMemberInfos).
		WithArgs("ev1").
		WillReturnRows(rows)

	got, err := repo.FetchMemberInfos(context.Background(), "ev1")
	assert.NoError(t, err)
	assert.Len(t, got, 3)
	assert.Equal(t, "u1", got[0].UserID)
	assert.Equal(t, "bob", got[1].UserName)
	assert.Equal(t, 5, got[2].SoSoPoint)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// ---------- 0 件 ----------
func TestEventParticipantRepository_FetchMemberInfos_Empty(t *testing.T) {
	repo, mock, closeFn := newEventParticipantRepoMock(t)
	defer closeFn()

	mock.ExpectQuery(sqlFetchMemberInfos).
		WithArgs("evX").
		WillReturnRows(sqlmock.NewRows([]string{
			"id", "username", "soso_point",
		}))

	got, err := repo.FetchMemberInfos(context.Background(), "evX")
	assert.NoError(t, err)
	assert.Empty(t, got)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// ---------- DB エラー ----------
func TestEventParticipantRepository_FetchMemberInfos_DBError(t *testing.T) {
	repo, mock, closeFn := newEventParticipantRepoMock(t)
	defer closeFn()

	mock.ExpectQuery(sqlFetchMemberInfos).
		WithArgs("evErr").
		WillReturnError(assert.AnError)

	got, err := repo.FetchMemberInfos(context.Background(), "evErr")
	assert.Error(t, err)
	assert.Nil(t, got)
	assert.NoError(t, mock.ExpectationsWereMet())
}
