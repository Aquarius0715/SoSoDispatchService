package repository_test

import (
	"context"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/go-sql-driver/mysql"
	"github.com/stretchr/testify/assert"

	"soso/internal/model"
	"soso/internal/repository"
)

func newCalenderRepoMock(t *testing.T) (*repository.CalenderRepository, sqlmock.Sqlmock, func()) {
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	assert.NoError(t, err)
	return repository.NewCalenderRepository(db), mock, func() { _ = db.Close() }
}

// Create成功
func TestCalenderRepository_Create_OK(t *testing.T) {
	repo, mock, close := newCalenderRepoMock(t)
	defer close()

	c := &model.Calender{
		ID:          "u1",
		Name:        "jouhoukyoku",
		Description: "jouhoukyoku",
		OwnerId:     "u2",
	}

	mock.ExpectExec(SQLCalenderCreate).
		WithArgs(c.ID, c.Name, c.Description, c.OwnerId).
		WillReturnResult(sqlmock.NewResult(1, 1))

	err := repo.Create(context.Background(), c)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// DB制約エラー
func TestCalenderRepository_Create_DuplicateCalenderName(t *testing.T) {
	repo, mock, close := newCalenderRepoMock(t)
	defer close()

	c := &model.Calender{
		ID:          "u2",
		Name:        "jouhoukyoku",
		Description: "jouhoukyoku",
		OwnerId:     "u3",
	}

	mock.ExpectExec(SQLCalenderCreate).
		WithArgs(c.ID, c.Name, c.Description, c.OwnerId).
		WillReturnError(&mysql.MySQLError{
			Number:  1062,
			Message: "Duplicate entry 'jouhoukyoku' for key 'calenders.name'",
		})

	err := repo.Create(context.Background(), c)
	assert.Error(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCalenderRepository_FindByName_Hit(t *testing.T) {
	repo, mock, close := newCalenderRepoMock(t)
	defer close()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "name", "descriptions", "owner_id", "created_at", "updated_at",
	}).AddRow("u1", "jouhoukyoku", "jouhoudescription", "u1", now, now)

	mock.ExpectQuery(SQLCalenderFindByName).
		WithArgs("jouhoukyoku").
		WillReturnRows(rows)

	c, err := repo.FindByName(context.Background(), "jouhoukyoku")
	assert.NoError(t, err)
	assert.NotNil(t, c)
	assert.Equal(t, "jouhoukyoku", c.Name)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCalenderRepository_FindByName_NotFound(t *testing.T) {
	repo, mock, close := newCalenderRepoMock(t)
	defer close()

	mock.ExpectQuery(SQLCalenderFindByName).
		WithArgs("jouhoukyoku").
		WillReturnRows(sqlmock.NewRows([]string{}))

	c, err := repo.FindByName(context.Background(), "jouhoukyoku")
	assert.NoError(t, err)
	assert.Nil(t, c)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCalenderRepository_FindCalendersByUserId_Hit(t *testing.T) {
	repo, mock, close := newCalenderRepoMock(t)
	defer close()

	rows := sqlmock.NewRows([]string{
		"id", "name", "description", "owner_id",
	}).AddRow("cal1", "Calendar 1", "desc1", "u1").
		AddRow("cal2", "Calendar 2", "desc2", "u1")

	mock.ExpectQuery(SQLFindCalendersByUserID).
		WithArgs("u1").
		WillReturnRows(rows)

	list, err := repo.FindCalendersByUserId(context.Background(), "u1")
	assert.NoError(t, err)
	assert.Len(t, list, 2)
	assert.Equal(t, "cal1", list[0].ID)
	assert.Equal(t, "Calendar 2", list[1].Name)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCalenderRepository_FindCalendersByUserId_NotFound(t *testing.T) {
	repo, mock, close := newCalenderRepoMock(t)
	defer close()

	emptyRows := sqlmock.NewRows([]string{
		"id", "name", "description", "owner_id",
	}) // カラムは必要。行は追加しない。

	mock.ExpectQuery(SQLFindCalendersByUserID).
		WithArgs("u1").
		WillReturnRows(emptyRows)

	list, err := repo.FindCalendersByUserId(context.Background(), "u1")
	assert.NoError(t, err)
	assert.Len(t, list, 0)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCalenderRepository_FindMyTransportEvents_Hit(t *testing.T) {
	repo, mock, close := newCalenderRepoMock(t)
	defer close()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"event_id", "user_id", "type", "calender_name", "event_title", "start_time", "seats_required",
	}).AddRow(
		"e1", "u1", "go", "情報局", "朝送迎", now, 2,
	).AddRow(
		"e2", "u1", "return", "情報局", "夕方送迎", now.Add(1*time.Hour), 3,
	)

	mock.ExpectQuery(SQLFindMyTransportEvents).
		WithArgs("u1").
		WillReturnRows(rows)

	list, err := repo.FindMyTransportEvents(context.Background(), "u1")
	assert.NoError(t, err)
	assert.Len(t, list, 2)

	assert.Equal(t, "e1", list[0].EventID)
	assert.Equal(t, model.TransportType("go"), list[0].Type)
	assert.Equal(t, 2, list[0].SeatsRequired)

	assert.Equal(t, "e2", list[1].EventID)
	assert.Equal(t, model.TransportType("return"), list[1].Type)
	assert.Equal(t, 3, list[1].SeatsRequired)

	assert.True(t, list[0].StartTime.Before(list[1].StartTime) || list[0].StartTime.Equal(list[1].StartTime))

	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCalenderRepository_FindMyTransportEvents_Empty(t *testing.T) {
	repo, mock, close := newCalenderRepoMock(t)
	defer close()

	empty := sqlmock.NewRows([]string{
		"event_id", "user_id", "type", "calender_name", "event_title", "start_time", "seats_required",
	})

	mock.ExpectQuery(SQLFindMyTransportEvents).
		WithArgs("u1").
		WillReturnRows(empty)

	list, err := repo.FindMyTransportEvents(context.Background(), "u1")
	assert.NoError(t, err)
	assert.Len(t, list, 0)
	assert.NoError(t, mock.ExpectationsWereMet())
}
