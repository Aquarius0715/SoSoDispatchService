// internal/handlers/user_test.go
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
)

func TestUserHandler_Register_OK(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewUserRepository(dbm.DB)
	h := handlers.NewUserHandler(repo)
	e := NewEcho()

	// username 重複なし
	dbm.Mock.ExpectQuery(SQLSelectUserByName).
		WithArgs("alice").
		WillReturnRows(sqlmock.NewRows([]string{}))
	dbm.Mock.ExpectQuery(SQLSelectUserByEmailAddress).
		WithArgs("hoge@example.com").
		WillReturnRows(sqlmock.NewRows([]string{}))
	// INSERT
	dbm.Mock.ExpectExec(SQLInsertUser).
		WithArgs(sqlmock.AnyArg(), "alice", "hoge@example.com", sqlmock.AnyArg(), false, 0).
		WillReturnResult(sqlmock.NewResult(1, 1))

	req := httptest.NewRequest(http.MethodPost, "/users/register",
		bytes.NewBufferString(`{"username":"alice", "mailAddress":"hoge@example.com", "password":"password123"}`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Register(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.NoError(t, dbm.Mock.ExpectationsWereMet())
}

func TestUserHandler_Register_Conflict(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewUserRepository(dbm.DB)
	h := handlers.NewUserHandler(repo)
	e := NewEcho()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "username", "mail_address", "password_hash", "has_car", "capacity", "created_at", "updated_at",
	}).AddRow("u1", "alice", "hoge@example.com", "hash", false, 0, now, now)

	dbm.Mock.ExpectQuery(SQLSelectUserByName).
		WithArgs("alice").
		WillReturnRows(rows)

	req := httptest.NewRequest(http.MethodPost, "/users/register",
		bytes.NewBufferString(`{"username":"alice", "mailAddress":"hoge@example.com", "password":"password123"}`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Register(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusConflict, he.Code)
	assert.NoError(t, dbm.Mock.ExpectationsWereMet())
}

func TestUserHandler_Register_InvalidPayload(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewUserRepository(dbm.DB)
	h := handlers.NewUserHandler(repo)
	e := NewEcho()

	req := httptest.NewRequest(http.MethodPost, "/users/register",
		bytes.NewBufferString(`{`)) // 壊れたJSON
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Register(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusBadRequest, he.Code)
}

func TestUserHandler_Register_CapacityRequired(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewUserRepository(dbm.DB)
	h := handlers.NewUserHandler(repo)
	e := NewEcho()

	dbm.Mock.ExpectQuery(SQLSelectUserByName).
		WithArgs("alice").
		WillReturnRows(sqlmock.NewRows([]string{}))
	dbm.Mock.ExpectQuery(SQLSelectUserByEmailAddress).
		WithArgs("hoge@example.com").
		WillReturnRows(sqlmock.NewRows([]string{}))
	dbm.Mock.ExpectExec(SQLInsertUser).
		WithArgs(sqlmock.AnyArg(), "alice", "hoge@example.com", sqlmock.AnyArg(), true, 0).
		WillReturnResult(sqlmock.NewResult(1, 1))

	req := httptest.NewRequest(http.MethodPost, "/users/register",
		bytes.NewBufferString(`{"username":"alice","mailAddress":"hoge@example.com","password":"password123","hasCar":true,"capacity":0}`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	c := e.NewContext(req, rec)

	err := h.Register(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusBadRequest, he.Code)
}

func TestUserHandler_Me_OK(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewUserRepository(dbm.DB)
	h := handlers.NewUserHandler(repo)
	e := NewEcho()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "username", "mail_address", "password_hash", "has_car", "capacity", "created_at", "updated_at",
	}).AddRow("u1", "alice", "hoge@example.com", "hash", false, 0, now, now)

	dbm.Mock.ExpectQuery(SQLSelectUserByID).
		WithArgs("u1").
		WillReturnRows(rows)

	req := httptest.NewRequest(http.MethodGet, "/users/me", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	SetJWTUser(c, "u1")

	err := h.Me(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), `"username":"alice"`)
	assert.NoError(t, dbm.Mock.ExpectationsWereMet())
}

func TestUserHandler_Me_NotFound(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewUserRepository(dbm.DB)
	h := handlers.NewUserHandler(repo)
	e := NewEcho()

	dbm.Mock.ExpectQuery(SQLSelectUserByID).
		WithArgs("u1").
		WillReturnRows(sqlmock.NewRows([]string{}))

	req := httptest.NewRequest(http.MethodGet, "/users/me", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	SetJWTUser(c, "u1")

	err := h.Me(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusNotFound, he.Code)
	assert.NoError(t, dbm.Mock.ExpectationsWereMet())
}

func TestUserHandler_Me_Unauthorized(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewUserRepository(dbm.DB)
	h := handlers.NewUserHandler(repo)
	e := NewEcho()

	req := httptest.NewRequest(http.MethodGet, "/users/me", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// JWT未セット
	err := h.Me(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusUnauthorized, he.Code)
}
