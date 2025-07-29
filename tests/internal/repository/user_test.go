// internal/repository/user_repository_test.go
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

// ===== helpers =====
func newUserRepoMock(t *testing.T) (*repository.UserRepository, sqlmock.Sqlmock, func()) {
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	assert.NoError(t, err)
	return repository.NewUserRepository(db), mock, func() { _ = db.Close() }
}

// ===== tests =====

// 正常系: Create
func TestUserRepository_Create_OK(t *testing.T) {
	repo, mock, close := newUserRepoMock(t)
	defer close()

	u := &model.User{
		ID:           "u1",
		Username:     "alice",
		PasswordHash: "hash",
		HasCar:       true,
		Capacity:     2,
		SoSoPoints:   0,
	}

	mock.ExpectExec(SQLInsertUser).
		WithArgs(u.ID, u.Username, u.PasswordHash, u.HasCar, u.Capacity, u.SoSoPoints).
		WillReturnResult(sqlmock.NewResult(1, 1))

	err := repo.Create(context.Background(), u)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// DB制約エラー（例: ユニーク制約違反）
func TestUserRepository_Create_DuplicateUsername(t *testing.T) {
	repo, mock, close := newUserRepoMock(t)
	defer close()

	u := &model.User{
		ID:           "u2",
		Username:     "alice",
		PasswordHash: "hash2",
	}

	mock.ExpectExec(SQLInsertUser).
		WithArgs(u.ID, u.Username, u.PasswordHash, u.HasCar, u.Capacity, u.SoSoPoints).
		WillReturnError(&mysql.MySQLError{
			Number:  1062,
			Message: "Duplicate entry 'alice' for key 'users.username'",
		})

	err := repo.Create(context.Background(), u)
	assert.Error(t, err)
	// 好みでエラー番号チェック
	var me *mysql.MySQLError
	if assert.ErrorAs(t, err, &me) {
		assert.Equal(t, uint16(1062), me.Number)
	}
	assert.NoError(t, mock.ExpectationsWereMet())
}

// FindByUsername ヒット
func TestUserRepository_FindByUsername_Hit(t *testing.T) {
	repo, mock, close := newUserRepoMock(t)
	defer close()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "username", "password_hash", "has_car", "capacity", "soso_points", "created_at", "updated_at",
	}).AddRow("u1", "alice", "hash", true, 3, 10, now, now)

	mock.ExpectQuery(SQLSelectUserByName).
		WithArgs("alice").
		WillReturnRows(rows)

	u, err := repo.FindByUsername(context.Background(), "alice")
	assert.NoError(t, err)
	assert.NotNil(t, u)
	assert.Equal(t, "alice", u.Username)
	assert.True(t, u.HasCar)
	assert.Equal(t, 3, u.Capacity)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// FindByUsername 見つからない
func TestUserRepository_FindByUsername_NotFound(t *testing.T) {
	repo, mock, close := newUserRepoMock(t)
	defer close()

	mock.ExpectQuery(SQLSelectUserByName).
		WithArgs("bob").
		WillReturnRows(sqlmock.NewRows([]string{}))

	u, err := repo.FindByUsername(context.Background(), "bob")
	assert.NoError(t, err)
	assert.Nil(t, u)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// FindByID ヒット
func TestUserRepository_FindByID_Hit(t *testing.T) {
	repo, mock, close := newUserRepoMock(t)
	defer close()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "username", "password_hash", "has_car", "capacity", "soso_points", "created_at", "updated_at",
	}).AddRow("u1", "alice", "hash", false, 0, 0, now, now)

	mock.ExpectQuery(SQLSelectUserByID).
		WithArgs("u1").
		WillReturnRows(rows)

	u, err := repo.FindByID(context.Background(), "u1")
	assert.NoError(t, err)
	assert.NotNil(t, u)
	assert.Equal(t, "u1", u.ID)
	assert.Equal(t, "alice", u.Username)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// FindByID 見つからない
func TestUserRepository_FindByID_NotFound(t *testing.T) {
	repo, mock, close := newUserRepoMock(t)
	defer close()

	mock.ExpectQuery(SQLSelectUserByID).
		WithArgs("nope").
		WillReturnRows(sqlmock.NewRows([]string{}))

	u, err := repo.FindByID(context.Background(), "nope")
	assert.NoError(t, err)
	assert.Nil(t, u)
	assert.NoError(t, mock.ExpectationsWereMet())
}
