// internal/handlers/helpers_test.go
package handlers_test

import (
	"context"
	"database/sql"
	"encoding/json"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"

	"soso/internal/validator"
)

// NewEcho returns an *echo.Echo with validator set.
func NewEcho() *echo.Echo {
	e := echo.New()
	e.Validator = validator.New()
	return e
}

// SetJWTUser sets a dummy jwt token into echo.Context for /me tests.
func SetJWTUser(c echo.Context, userID string) {
	tok := &jwt.Token{Claims: &jwt.RegisteredClaims{Subject: userID}}
	c.Set("user", tok)
}

// ---- sqlmock helpers ----
type DBMock struct {
	DB    *sql.DB
	Mock  sqlmock.Sqlmock
	Close func()
}

// NewSQLMock returns a sqlmock-backed *sql.DB and a closer.
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

func logJSON(t *testing.T, label string, v any) {
	j, _ := json.MarshalIndent(v, "", "  ")
	t.Logf("%s:\n%s\n", label, string(j))
}

// Ctx は context.Background() のショートカット（必要なら）
func Ctx() context.Context { return context.Background() }

// ---- SQL constants (handlers テストで使うぶんだけ) ----
const (
	SQLInsertUser = `
		INSERT INTO users (
			id, username, mail_address, password_hash, has_car, capacity
		) VALUES (?,?,?,?,?,?)
	`

	SQLSelectUserByEmailAddress = `
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
			c.owner_id AS owner_id
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
			seats_required_go,
			seats_required_return
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

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
			seats_required_go,
			seats_required_return,
			created_at,
			updated_at
		FROM events
		WHERE calender_id = ?`

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
			seats_required_go,
			seats_required_return,
			created_at,
			updated_at
		FROM events
		WHERE id = ?
		LIMIT 1`

	SQLFindMyTransportEvents = `
		SELECT
			e.id                             AS event_id,
			ep.user_id                       AS user_id,
			ep.type                          AS type,
			c.name                           AS calender_name,
			e.title                          AS event_title,
			e.start_time                     AS start_time,
			CASE
				WHEN ep.type = 'go'     THEN e.seats_required_go
				WHEN ep.type = 'return' THEN e.seats_required_return
				ELSE 0
			END                              AS seats_required
		FROM event_participants AS ep
		INNER JOIN events     AS e ON e.id = ep.event_id
		INNER JOIN calenders  AS c ON c.id = e.calender_id
		WHERE
			ep.user_id = ?
			AND ep.status = 'registered'
			AND ep.type IN ('go', 'return')
		ORDER BY e.start_time ASC`
)
