package repository

import (
	"soso/internal/repository"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
)

func newCalenderRepoMock(t *testing.T) (*repository.CalenderRepository, sqlmock.Sqlmock, func()) {
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	assert.NoError(t, err)
	return repository.NewCalenderRepository(db), mock, func() { _ = db.Close() }
}
