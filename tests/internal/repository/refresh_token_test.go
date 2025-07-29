// internal/repository/refresh_token_repository_test.go
package repository_test

import (
	"context"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"

	"soso/internal/model"
	"soso/internal/repository"
)

// ===== helpers =====
func newRTRepoMock(t *testing.T) (*repository.RefreshTokenRepository, sqlmock.Sqlmock, func()) {
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	assert.NoError(t, err)
	return repository.NewRefreshTokenRepository(db), mock, func() { _ = db.Close() }
}

// ===== tests =====

func TestRefreshTokenRepository_Insert_OK(t *testing.T) {
	repo, mock, close := newRTRepoMock(t)
	defer close()

	rt := &model.RefreshToken{
		ID:        "rt1",
		UserID:    "u1",
		TokenHash: "hash123",
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	mock.ExpectExec(SQLInsertRT).
		WithArgs(rt.ID, rt.UserID, rt.TokenHash, rt.ExpiresAt).
		WillReturnResult(sqlmock.NewResult(1, 1))

	err := repo.Insert(context.Background(), rt)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestRefreshTokenRepository_FindActiveByHash_Hit(t *testing.T) {
	repo, mock, close := newRTRepoMock(t)
	defer close()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "user_id", "token_hash", "expires_at", "revoked_at", "created_at",
	}).AddRow("rt1", "u1", "hash123", now.Add(time.Hour), nil, now)

	mock.ExpectQuery(SQLSelectRTByHashActive).
		WithArgs("hash123").
		WillReturnRows(rows)

	rt, err := repo.FindActiveByHash(context.Background(), "hash123")
	assert.NoError(t, err)
	assert.NotNil(t, rt)
	assert.Equal(t, "u1", rt.UserID)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestRefreshTokenRepository_FindActiveByHash_NotFound(t *testing.T) {
	repo, mock, close := newRTRepoMock(t)
	defer close()

	mock.ExpectQuery(SQLSelectRTByHashActive).
		WithArgs("nope").
		WillReturnRows(sqlmock.NewRows([]string{}))

	rt, err := repo.FindActiveByHash(context.Background(), "nope")
	assert.NoError(t, err)
	assert.Nil(t, rt)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestRefreshTokenRepository_Revoke_OK(t *testing.T) {
	repo, mock, close := newRTRepoMock(t)
	defer close()

	mock.ExpectExec(SQLRevokeRT).
		WithArgs(sqlmock.AnyArg(), "rt1").
		WillReturnResult(sqlmock.NewResult(0, 1)) // 1 row affected

	err := repo.Revoke(context.Background(), "rt1")
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestRefreshTokenRepository_Revoke_NoRows(t *testing.T) {
	repo, mock, close := newRTRepoMock(t)
	defer close()

	// 既にrevoke済みなどで0件でもエラーにはしない実装
	mock.ExpectExec(SQLRevokeRT).
		WithArgs(sqlmock.AnyArg(), "rtX").
		WillReturnResult(sqlmock.NewResult(0, 0)) // 0 rows affected

	err := repo.Revoke(context.Background(), "rtX")
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}
