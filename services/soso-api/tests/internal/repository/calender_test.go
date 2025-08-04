package repository_test

import (
	"context"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
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
