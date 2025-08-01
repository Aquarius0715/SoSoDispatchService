// internal/handlers/auth_test.go
package handlers_test

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"

	"soso/internal/handlers"
	"soso/internal/repository"
	"soso/pkg/auth"
)

// ---- helper ----
func newAuthHandler(t *testing.T) (*handlers.AuthHandler, sqlmock.Sqlmock, func()) {
	dbm := NewSQLMock(t)
	userRepo := repository.NewUserRepository(dbm.DB)
	rtRepo := repository.NewRefreshTokenRepository(dbm.DB)

	h := handlers.NewAuthHandler(
		userRepo,
		rtRepo,
		"test-signing-key",
		15,   // access ttl min
		24*7, // refresh ttl hour
		handlers.CookieConf{
			Name:     "rt",
			Path:     "/auth",
			Domain:   "",
			Secure:   false,
			SameSite: http.SameSiteStrictMode,
		},
	)
	return h, dbm.Mock, dbm.Close
}

// ------------------- Login -------------------

func TestAuthHandler_Login_OK(t *testing.T) {
	h, mock, close := newAuthHandler(t)
	defer close()

	pwHash, _ := auth.HashPassword("password123")
	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "username", "password_hash", "has_car", "capacity", "soso_points", "created_at", "updated_at",
	}).AddRow("u1", "alice", pwHash, false, 0, 0, now, now)
	mock.ExpectQuery(SQLSelectUserByName).WithArgs("alice").WillReturnRows(rows)

	mock.ExpectExec(SQLInsertRT).
		WithArgs(sqlmock.AnyArg(), "u1", sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))

	e := NewEcho()
	req := httptest.NewRequest(http.MethodPost, "/auth/login",
		bytes.NewBufferString(`{"username":"alice","password":"password123"}`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Login(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Header().Get("Set-Cookie"), "rt=")
	assert.Contains(t, rec.Body.String(), `"access_token"`)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestAuthHandler_Login_InvalidPayload(t *testing.T) {
	h, _, close := newAuthHandler(t)
	defer close()

	e := NewEcho()
	req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewBufferString(`{`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Login(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusBadRequest, he.Code)
}

func TestAuthHandler_Login_UserNotFound(t *testing.T) {
	h, mock, close := newAuthHandler(t)
	defer close()

	mock.ExpectQuery(SQLSelectUserByName).
		WithArgs("alice").
		WillReturnRows(sqlmock.NewRows([]string{}))

	e := NewEcho()
	req := httptest.NewRequest(http.MethodPost, "/auth/login",
		bytes.NewBufferString(`{"username":"alice","password":"password123"}`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Login(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusUnauthorized, he.Code)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestAuthHandler_Login_InvalidPassword(t *testing.T) {
	h, mock, close := newAuthHandler(t)
	defer close()

	wrongHash, _ := auth.HashPassword("otherpass")
	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "username", "password_hash", "has_car", "capacity", "soso_points", "created_at", "updated_at",
	}).AddRow("u1", "alice", wrongHash, false, 0, 0, now, now)
	mock.ExpectQuery(SQLSelectUserByName).
		WithArgs("alice").
		WillReturnRows(rows)

	e := NewEcho()
	req := httptest.NewRequest(http.MethodPost, "/auth/login",
		bytes.NewBufferString(`{"username":"alice","password":"password123"}`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Login(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusUnauthorized, he.Code)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// ------------------- Refresh -------------------

func TestAuthHandler_Refresh_OK(t *testing.T) {
	h, mock, close := newAuthHandler(t)
	defer close()

	rawRT := "raw-refresh-token"
	hash := auth.HashToken(rawRT)
	now := time.Now()

	rows := sqlmock.NewRows([]string{
		"id", "user_id", "token_hash", "expires_at", "revoked_at", "created_at",
	}).AddRow("rt1", "u1", hash, now.Add(time.Hour), nil, now)
	mock.ExpectQuery(SQLSelectRTByHashActive).WithArgs(hash).WillReturnRows(rows)

	mock.ExpectExec(SQLRevokeRT).
		WithArgs(sqlmock.AnyArg(), "rt1").
		WillReturnResult(sqlmock.NewResult(0, 1))

	mock.ExpectExec(SQLInsertRT).
		WithArgs(sqlmock.AnyArg(), "u1", sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))

	e := NewEcho()
	req := httptest.NewRequest(http.MethodPost, "/auth/refresh", nil)
	req.AddCookie(&http.Cookie{Name: "rt", Value: rawRT, Path: "/auth"})
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Refresh(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), `"access_token"`)
	assert.Contains(t, rec.Header().Get("Set-Cookie"), "rt=")
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestAuthHandler_Refresh_MissingCookie(t *testing.T) {
	h, _, close := newAuthHandler(t)
	defer close()

	e := NewEcho()
	req := httptest.NewRequest(http.MethodPost, "/auth/refresh", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Refresh(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusUnauthorized, he.Code)
}

func TestAuthHandler_Refresh_InvalidToken(t *testing.T) {
	h, mock, close := newAuthHandler(t)
	defer close()

	raw := "badtoken"
	hash := auth.HashToken(raw)

	mock.ExpectQuery(SQLSelectRTByHashActive).
		WithArgs(hash).
		WillReturnRows(sqlmock.NewRows([]string{}))

	e := NewEcho()
	req := httptest.NewRequest(http.MethodPost, "/auth/refresh", nil)
	req.AddCookie(&http.Cookie{Name: "rt", Value: raw, Path: "/auth"})
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Refresh(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusUnauthorized, he.Code)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// ------------------- Logout -------------------

func TestAuthHandler_Logout_OK(t *testing.T) {
	h, mock, close := newAuthHandler(t)
	defer close()

	raw := "logout-rt"
	hash := auth.HashToken(raw)
	now := time.Now()

	rows := sqlmock.NewRows([]string{
		"id", "user_id", "token_hash", "expires_at", "revoked_at", "created_at",
	}).AddRow("rt1", "u1", hash, now.Add(time.Hour), nil, now)
	mock.ExpectQuery(SQLSelectRTByHashActive).
		WithArgs(hash).
		WillReturnRows(rows)

	mock.ExpectExec(SQLRevokeRT).
		WithArgs(sqlmock.AnyArg(), "rt1").
		WillReturnResult(sqlmock.NewResult(0, 1))

	e := NewEcho()
	req := httptest.NewRequest(http.MethodPost, "/auth/logout", nil)
	req.AddCookie(&http.Cookie{Name: "rt", Value: raw, Path: "/auth"})
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Logout(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Header().Get("Set-Cookie"), "rt=;")
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestAuthHandler_Logout_NoCookie(t *testing.T) {
	h, _, close := newAuthHandler(t)
	defer close()

	e := NewEcho()
	req := httptest.NewRequest(http.MethodPost, "/auth/logout", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Logout(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
}
