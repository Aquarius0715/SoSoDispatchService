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
		) VALUES (?, ?, ?, ?)
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

	SQLFindByCalenderIDAndUserID = `
		SELECT
			*
		FROM calender_memberships
		WHERE calender_id = ?
		AND user_id = ?
		LIMIT 1
	`

	SQLCreateCalenderMembership = `
		INSERT INTO calender_memberships (
			calender_id, user_id, role
		) VALUES (?, ?, ?)
	`

	SQLFindByCalenderID = `
		SELECT
			*
		FROM calender_memberships
		WHERE calender_id = ?
		LIMIT 1
	`
	SQLFindCalendersByUserID = `
		SELECT
			c.id	AS id,
			c.name	AS name,
			c.description AS description,
			c.owner_id AS owner_id,
		FROM
			calender_memberships AS cm
			INNER JOIN calenders AS c
				ON c.id = cm.calender_id
		WHERE
			cm.user_id = ?
	`
	SQLFindMembersByCalenderID = `
		SELECT
			cm.user_id,
			u.username,
			u.has_car,
			u.capacity,
			cm.soso_point
		FROM calender_memberships AS cm
		INNER JOIN users AS u ON u.id = cm.user_id
		WHERE cm.calender_id = ?
	`
	SQLEventCreate = `
		INSERT INTO events (
			id,
			calender_id,
			creator_id,
			title,
			description,
			start_time,
			end_time,
			origin_location,
			destination_location,
			seats_required
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	SQLEventFindById = `
		SELECT
			id,
			calender_id,
			creator_id,
			title,
			description,
			start_time,
			end_time,
			origin_location,
			destination_location,
			seats_required,
			created_at,
			updated_at
		FROM events
		WHERE id = ?
		LIMIT 1`

	SQLEventFindByCalenderID = `
		SELECT
			id,
			calender_id,
			creator_id,
			title,
			description,
			start_time,
			end_time,
			origin_location,
			destination_location,
			seats_required,
			created_at,
			updated_at
		FROM events
		WHERE calender_id = ?`
)
