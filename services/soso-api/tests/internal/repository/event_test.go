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

/*
----------------------------------------------------------------

	モック生成ヘルパ
	----------------------------------------------------------------
*/
func newEventRepoMock(t *testing.T) (*repository.EventRepository, sqlmock.Sqlmock, func()) {
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	assert.NoError(t, err)
	return repository.NewEventRepository(db), mock, func() { _ = db.Close() }
}

/*
----------------------------------------------------------------

	Create
	----------------------------------------------------------------
*/
func TestEventRepository_Create_OK(t *testing.T) {
	repo, mock, closeFn := newEventRepoMock(t)
	defer closeFn()

	e := &model.Event{
		ID:                  "ev1",
		CalenderId:          "cal1",
		CreatorId:           "u1",
		Title:               "Event 1",
		Description:         "desc",
		StartTime:           time.Now(),
		EndTime:             time.Now().Add(time.Hour),
		OriginLocation:      "A",
		DestinationLocation: "B",
		SeatsRequired:       2,
	}

	mock.ExpectExec(SQLEventCreate).
		WithArgs(e.ID, e.CalenderId, e.CreatorId, e.Title, e.Description,
			e.StartTime, e.EndTime, e.OriginLocation, e.DestinationLocation, e.SeatsRequired).
		WillReturnResult(sqlmock.NewResult(1, 1))

	err := repo.Create(context.Background(), e)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestEventRepository_Create_DuplicateID(t *testing.T) {
	repo, mock, closeFn := newEventRepoMock(t)
	defer closeFn()

	e := &model.Event{
		ID:                  "ev1",
		CalenderId:          "cal1",
		CreatorId:           "u1",
		Title:               "Event 1",
		Description:         "desc",
		StartTime:           time.Now(),
		EndTime:             time.Now().Add(time.Hour),
		OriginLocation:      "A",
		DestinationLocation: "B",
		SeatsRequired:       2,
	}

	mock.ExpectExec(SQLEventCreate).
		WithArgs(e.ID, e.CalenderId, e.CreatorId, e.Title, e.Description,
			e.StartTime, e.EndTime, e.OriginLocation, e.DestinationLocation, e.SeatsRequired).
		WillReturnError(&mysql.MySQLError{
			Number:  1062,
			Message: "Duplicate entry 'ev1' for key 'events.PRIMARY'",
		})

	err := repo.Create(context.Background(), e)
	assert.Error(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

/*
----------------------------------------------------------------

	FindById
	----------------------------------------------------------------
*/
func TestEventRepository_FindById_Hit(t *testing.T) {
	repo, mock, closeFn := newEventRepoMock(t)
	defer closeFn()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "calender_id", "creator_id", "title", "description",
		"start_time", "end_time", "origin_location", "destination_location",
		"seats_required", "created_at", "updated_at",
	}).AddRow(
		"ev1", "cal1", "u1", "Event 1", "desc",
		now, now.Add(time.Hour), "A", "B",
		2, now, now,
	)

	mock.ExpectQuery(SQLEventFindById).
		WithArgs("ev1").
		WillReturnRows(rows)

	ev, err := repo.FindById(context.Background(), "ev1")
	assert.NoError(t, err)
	assert.NotNil(t, ev)
	assert.Equal(t, "Event 1", ev.Title)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestEventRepository_FindById_NotFound(t *testing.T) {
	repo, mock, closeFn := newEventRepoMock(t)
	defer closeFn()

	mock.ExpectQuery(SQLEventFindById).
		WithArgs("ev1").
		WillReturnRows(sqlmock.NewRows([]string{}))

	ev, err := repo.FindById(context.Background(), "ev1")
	assert.NoError(t, err)
	assert.Nil(t, ev)
	assert.NoError(t, mock.ExpectationsWereMet())
}

/*
----------------------------------------------------------------

	FindEventsByCalenderId
	----------------------------------------------------------------
*/
func TestEventRepository_FindEventsByCalenderId_Hit(t *testing.T) {
	repo, mock, closeFn := newEventRepoMock(t)
	defer closeFn()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "calender_id", "creator_id", "title", "description",
		"start_time", "end_time", "origin_location", "destination_location",
		"seats_required", "created_at", "updated_at",
	}).AddRow(
		"ev1", "cal1", "u1", "Event 1", "desc1",
		now, now.Add(time.Hour), "A1", "B1",
		1, now, now,
	).AddRow(
		"ev2", "cal1", "u2", "Event 2", "desc2",
		now.Add(2*time.Hour), now.Add(3*time.Hour), "A2", "B2",
		3, now, now,
	)

	mock.ExpectQuery(SQLEventFindByCalenderID).
		WithArgs("cal1").
		WillReturnRows(rows)

	list, err := repo.FindEventsByCalenderId(context.Background(), "cal1")
	assert.NoError(t, err)
	assert.Len(t, list, 2)
	assert.Equal(t, "ev1", list[0].ID)
	assert.Equal(t, "Event 2", list[1].Title)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestEventRepository_FindEventsByCalenderId_NotFound(t *testing.T) {
	repo, mock, closeFn := newEventRepoMock(t)
	defer closeFn()

	emptyRows := sqlmock.NewRows([]string{
		"id", "calender_id", "creator_id", "title", "description",
		"start_time", "end_time", "origin_location", "destination_location",
		"seats_required", "created_at", "updated_at",
	})

	mock.ExpectQuery(SQLEventFindByCalenderID).
		WithArgs("cal1").
		WillReturnRows(emptyRows)

	list, err := repo.FindEventsByCalenderId(context.Background(), "cal1")
	assert.NoError(t, err)
	assert.Len(t, list, 0)
	assert.NoError(t, mock.ExpectationsWereMet())
}
