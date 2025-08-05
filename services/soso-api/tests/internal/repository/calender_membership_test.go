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
