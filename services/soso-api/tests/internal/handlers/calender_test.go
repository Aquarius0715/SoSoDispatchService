package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"soso/internal/handlers"
	"soso/internal/repository"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestCalenderFindMyCalenders_OK(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewCalenderRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo)
	e := NewEcho()

	rows := sqlmock.NewRows([]string{
		"id", "name", "description", "owner_id",
	}).AddRow("cal1", "Calendar 1", "desc1", "u1").
		AddRow("cal2", "Calendar 2", "desc2", "u1")

	dbm.Mock.ExpectQuery(SQLFindCalendersByUserID).
		WithArgs("u1").
		WillReturnRows(rows)

	req := httptest.NewRequest(http.MethodGet, "/calenders/my", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	SetJWTUser(c, "u1")

	err := h.FindMyCalenders(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)

	// レスポンスが JSON 配列で 2 要素あるか確認
	var got []map[string]any
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &got))
	assert.Len(t, got, 2)
	assert.Equal(t, "cal1", got[0]["id"])
	assert.Equal(t, "Calendar 2", got[1]["name"])

	assert.NoError(t, dbm.Mock.ExpectationsWereMet())
}

func TestCalenderCreate_OK(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewCalenderRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo)
	e := NewEcho()

	dbm.Mock.ExpectQuery(SQLCalenderFindByName).
		WithArgs("jouhoukyoku").
		WillReturnRows(sqlmock.NewRows([]string{}))
	dbm.Mock.ExpectExec(SQLCalenderCreate).
		WithArgs(sqlmock.AnyArg(), "jouhoukyoku", "jouhoukyoku", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))

	req := httptest.NewRequest(http.MethodPost, "/calenders/create",
		bytes.NewBufferString(`{"name":"jouhoukyoku","description":"jouhoukyoku"}`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	SetJWTUser(c, "u1")

	err := h.Create(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.NoError(t, dbm.Mock.ExpectationsWereMet())
}

func TestCalenderCreate_Conflict(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewCalenderRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo)
	e := NewEcho()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "name", "description", "owner_id", "created_at", "updated_at",
	}).AddRow("u1", "jouuhoukyoku", "jouhoukyoku", "u1", now, now)

	dbm.Mock.ExpectQuery(SQLCalenderFindByName).
		WithArgs("jouhoukyoku").
		WillReturnRows(rows)

	req := httptest.NewRequest(http.MethodPost, "/calenders/create",
		bytes.NewBufferString(`{"name":"jouhoukyoku","description":"jouhoukyoku"}`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	SetJWTUser(c, "u1")

	err := h.Create(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusConflict, he.Code)
	assert.NoError(t, dbm.Mock.ExpectationsWereMet())
}

func TestCalenderCreate_InvalidPayload(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewCalenderRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo)
	e := NewEcho()

	req := httptest.NewRequest(http.MethodPost, "/calenders/create",
		bytes.NewBufferString(`{`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	SetJWTUser(c, "u1")

	err := h.Create(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusBadRequest, he.Code)
}

func TestCalenderCreate_Unauthorized(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewCalenderRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo)
	e := NewEcho()

	req := httptest.NewRequest(http.MethodPost, "/calenders/create", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Create(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusUnauthorized, he.Code)
}
