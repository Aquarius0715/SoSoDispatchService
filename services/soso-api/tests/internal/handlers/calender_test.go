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
	mrepo := repository.NewCalenderMembershipRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo, mrepo)
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
	mrepo := repository.NewCalenderMembershipRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo, mrepo)
	e := NewEcho()

	dbm.Mock.ExpectQuery(SQLCalenderFindByName).
		WithArgs("jouhoukyoku").
		WillReturnRows(sqlmock.NewRows([]string{}))

	// transaction begin
	dbm.Mock.ExpectBegin()
	dbm.Mock.ExpectExec(SQLCalenderCreate).
		WithArgs(sqlmock.AnyArg(), "jouhoukyoku", "jouhoukyoku", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))

	dbm.Mock.ExpectExec(SQLCreateCalenderMembership).
		WithArgs(sqlmock.AnyArg(), "u1", "admin").
		WillReturnResult(sqlmock.NewResult(1, 1))

	dbm.Mock.ExpectCommit()

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
	mrepo := repository.NewCalenderMembershipRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo, mrepo)
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
	mrepo := repository.NewCalenderMembershipRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo, mrepo)
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
	mrepo := repository.NewCalenderMembershipRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo, mrepo)
	e := NewEcho()

	req := httptest.NewRequest(http.MethodPost, "/calenders/create", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := h.Create(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusUnauthorized, he.Code)
}

func TestCalenderFindMyTransportEvents_OK(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewCalenderRepository(dbm.DB)
	mrepo := repository.NewCalenderMembershipRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo, mrepo)
	e := NewEcho()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"event_id", "user_id", "type", "calender_name", "event_title", "start_time", "seats_required",
	}).AddRow(
		"e1", "u1", "go", "情報局", "朝送迎", now, 2,
	).AddRow(
		"e2", "u1", "return", "情報局", "夕方送迎", now.Add(30*time.Minute), 3,
	)

	dbm.Mock.ExpectQuery(SQLFindMyTransportEvents).
		WithArgs("u1").
		WillReturnRows(rows)

	req := httptest.NewRequest(http.MethodGet, "/events/dispatch/me", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	SetJWTUser(c, "u1")

	err := h.FindMyTransportEvents(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)

	var got []map[string]any
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &got))
	assert.Len(t, got, 2)

	// 1件目
	assert.Equal(t, "e1", got[0]["eventId"])
	assert.Equal(t, "u1", got[0]["userId"])
	assert.Equal(t, "go", got[0]["type"])
	assert.Equal(t, "情報局", got[0]["calenderName"])
	assert.Equal(t, "朝送迎", got[0]["eventTitle"])
	// JSONの数値はfloat64になる
	if v, ok := got[0]["seatsRequired"].(float64); assert.True(t, ok) {
		assert.Equal(t, float64(2), v)
	}
	// 2件目（昇順で返ることを eventId で間接確認）
	assert.Equal(t, "e2", got[1]["eventId"])
	assert.Equal(t, "return", got[1]["type"])
	if v, ok := got[1]["seatsRequired"].(float64); assert.True(t, ok) {
		assert.Equal(t, float64(3), v)
	}

	assert.NoError(t, dbm.Mock.ExpectationsWereMet())
}

func TestCalenderFindMyTransportEvents_Empty(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewCalenderRepository(dbm.DB)
	mrepo := repository.NewCalenderMembershipRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo, mrepo)
	e := NewEcho()

	empty := sqlmock.NewRows([]string{
		"event_id", "user_id", "type", "calender_name", "event_title", "start_time", "seats_required",
	})

	dbm.Mock.ExpectQuery(SQLFindMyTransportEvents).
		WithArgs("u1").
		WillReturnRows(empty)

	req := httptest.NewRequest(http.MethodGet, "/events/dispatch/me", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	SetJWTUser(c, "u1")

	err := h.FindMyTransportEvents(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)

	var got []map[string]any
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &got))
	assert.Len(t, got, 0)

	assert.NoError(t, dbm.Mock.ExpectationsWereMet())
}

func TestCalenderFindMyTransportEvents_Unauthorized(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewCalenderRepository(dbm.DB)
	mrepo := repository.NewCalenderMembershipRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo, mrepo)
	e := NewEcho()

	req := httptest.NewRequest(http.MethodGet, "/events/dispatch/me", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	// JWT をセットしない

	err := h.FindMyTransportEvents(c)
	if assert.Error(t, err) {
		he := err.(*echo.HTTPError)
		assert.Equal(t, http.StatusUnauthorized, he.Code)
	}
}
