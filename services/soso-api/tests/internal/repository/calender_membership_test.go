package repository_test

import (
	"context"
	"soso/internal/model"
	"soso/internal/repository"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
)

func newCalenderMembershipRepoMock(t *testing.T) (*repository.CalenderMembershipRepository, sqlmock.Sqlmock, func()) {
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	assert.NoError(t, err)
	return repository.NewCalenderMembershipRepository(db), mock, func() { _ = db.Close() }
}

// Create 成功
func TestCalenderMembershipRepository_Create_OK(t *testing.T) {
	repo, mock, close := newCalenderMembershipRepoMock(t)
	defer close()

	cm := &model.CalenderMembership{
		CalenderID: "cu1",
		UserID:     "uu1",
		Role:       model.ADMIN,
	}

	mock.ExpectExec(SQLCreateCalenderMembership).
		WithArgs(cm.CalenderID, cm.UserID, cm.Role).
		WillReturnResult(sqlmock.NewResult(1, 1))

	err := repo.Create(context.Background(), cm)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCalenderMembershipRepository_FindByCalenderIDAndUserID(t *testing.T) {
	repo, mock, close := newCalenderMembershipRepoMock(t)
	defer close()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"calender_id", "user_id", "role", "soso_point", "joind_at",
	}).AddRow("cu1", "uu1", "admin", 0, now)

	mock.ExpectQuery(SQLFindByCalenderIDAndUserID).
		WithArgs("cu1", "uu1").
		WillReturnRows(rows)

	c, err := repo.FindByCalenderIDAndUserID(context.Background(), "cu1", "uu1")
	assert.NoError(t, err)
	assert.NotNil(t, c)
	assert.Equal(t, "cu1", c.CalenderID)
	assert.Equal(t, "uu1", c.UserID)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCalenderMembershipRepository_FindByCalenderID_OK(t *testing.T) {
	repo, mock, close := newCalenderMembershipRepoMock(t)
	defer close()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"calender_id", "user_id", "role", "soso_point", "joind_at",
	}).AddRow("cu1", "uu1", "admin", 0, now)

	mock.ExpectQuery(SQLFindByCalenderID).
		WithArgs("cu1").
		WillReturnRows(rows)

	c, err := repo.FindByCalenderID(context.Background(), "cu1")
	assert.NoError(t, err)
	assert.NotNil(t, c)
	assert.Equal(t, "cu1", c.CalenderID)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCalenderMembershipRepository_FindMembersByCalenderID_OK(t *testing.T) {
	repo, mock, close := newCalenderMembershipRepoMock(t)
	defer close()

	calenderID := "cu1"
	rows := sqlmock.NewRows([]string{
		"user_id", "username", "has_car", "capacity", "soso_point",
	}).
		AddRow("uu1", "alice", 1, 4, 10).
		AddRow("uu2", "bob", 0, 2, 3)

	mock.ExpectQuery(SQLFindMembersByCalenderID).
		WithArgs(calenderID).
		WillReturnRows(rows)

	members, err := repo.FindMembersByCalenderID(context.Background(), calenderID)
	assert.NoError(t, err)
	assert.Len(t, members, 2)

	want0 := &model.CalenderMember{
		UserID:    "uu1",
		Username:  "alice",
		HasCar:    true,
		Capacity:  4,
		SoSoPoint: 10,
	}
	want1 := &model.CalenderMember{
		UserID:    "uu2",
		Username:  "bob",
		HasCar:    false,
		Capacity:  2,
		SoSoPoint: 3,
	}

	assert.Equal(t, want0, members[0])
	assert.Equal(t, want1, members[1])
	assert.NoError(t, mock.ExpectationsWereMet())
}
