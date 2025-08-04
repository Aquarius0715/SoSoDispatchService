// internal/repository/helpers_test.go
package repository_test

import (
	"context"
	"database/sql"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
)

// ---- sqlmock ----
type DBMock struct {
	DB    *sql.DB
	Mock  sqlmock.Sqlmock
	Close func()
}

func NewSQLMock(t *testing.T) DBMock {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatalf("sqlmock.New: %v", err)
	}
	return DBMock{
		DB:   db,
		Mock: mock,
		Close: func() {
			_ = db.Close()
		},
	}
}

func Ctx() context.Context { return context.Background() }

// ---- SQL constants (repository 用) ----
const (
	SQLInsertUser = `
		INSERT INTO users (
			id, username, mail_address, password_hash, has_car, capacity
		) VALUES (?,?,?,?,?,?)
	`

	SQLSelectUserByName = `
		SELECT
			id,
			username,
			mail_address,
			password_hash,
			has_car,
			capacity,
			created_at,
			updated_at
		FROM users
		WHERE username = ?
		LIMIT 1
	`

	SQLSelectUserByMailAddress = `
		SELECT
			id,
			username,
			mail_address,
			password_hash,
			has_car,
			capacity,
			created_at,
			updated_at
		FROM users
		WHERE mail_address = ?
		LIMIT 1
	`

	SQLSelectUserByID = `
		SELECT
			id,
			username,
			mail_address,
			password_hash,
			has_car,
			capacity,
			created_at,
			updated_at
		FROM users
		WHERE id = ?
		LIMIT 1
	`

	SQLInsertRT = `
		INSERT INTO refresh_tokens (
			id, user_id, token_hash, expires_at
		) VALUES (?,?,?,?)
	`

	SQLSelectRTByHashActive = `
		SELECT
			id,
			user_id,
			token_hash,
			expires_at,
			revoked_at,
			created_at
		FROM refresh_tokens
		WHERE token_hash = ?
		  AND revoked_at IS NULL
		  AND expires_at > NOW()
		LIMIT 1
	`

	SQLRevokeRT = `
		UPDATE refresh_tokens
		   SET revoked_at = ?
		 WHERE id = ?
		   AND revoked_at IS NULL
	`

	SQLCalenderCreate = `
		INSERT INTO calenders (
			id, name, description, owner_id
		VALUES(?, ?, ?, ?)
		)
	`

	SQLCalenderFindByName = `
		SELECT
			id,
			name,
			description,
			owner_id,
			created_at,
			updated_at
		FROM calenders
		WHERE name = ?
		LIMIT 1
	`
)
