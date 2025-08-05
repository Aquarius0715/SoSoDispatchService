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

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func newHandlerWithMock(t *testing.T) (*handlers.CalenderMembershipHandler, sqlmock.Sqlmock, func()) {
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherRegexp))
	assert.NoError(t, err)

	repo := repository.NewCalenderMembershipRepository(db)
	h := handlers.NewCalenderMembershipHandler(repo)

	return h, mock, func() { _ = db.Close() }
}

func TestCalenderMembershipList_OK(t *testing.T) {
	h, mock, closeFn := newHandlerWithMock(t)
	defer closeFn()

	calID := "cu1"
	userID := "uu1"
	now := time.Now()

	mock.ExpectQuery(`SELECT\s+\*\s+FROM calender_memberships`).
		WithArgs(calID, userID).
		WillReturnRows(sqlmock.NewRows([]string{
			"calender_id", "user_id", "role", "soso_point", "joined_at",
		}).AddRow(calID, userID, "member", 0, now))

	mock.ExpectQuery(`SELECT\s+cm\.user_id`).
		WithArgs(calID).
		WillReturnRows(sqlmock.NewRows([]string{
			"user_id", "username", "has_car", "capacity", "soso_point",
		}).AddRow("uu1", "alice", true, 4, 10).
			AddRow("uu2", "bob", false, 2, 3))

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/calenders/"+calID+"/members", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("calender_id")
	c.SetParamValues(calID)
	SetJWTUser(c, userID)

	err := h.List(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)

	var got []handlers.CalenderMemberResponse
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &got))
	assert.Len(t, got, 2)
	assert.Equal(t, "uu1", got[0].UserID)
	assert.Equal(t, "alice", got[0].Username)

	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCalenderMembershipList_Forbidden(t *testing.T) {
	h, mock, closeFn := newHandlerWithMock(t)
	defer closeFn()

	calID := "cu1"
	userID := "uuX"

	mock.ExpectQuery(`SELECT\s+\*\s+FROM calender_memberships`).
		WithArgs(calID, userID).
		WillReturnRows(sqlmock.NewRows([]string{}))

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/calenders/"+calID+"/members", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("calender_id")
	c.SetParamValues(calID)
	SetJWTUser(c, userID)

	err := h.List(c)
	assert.Error(t, err)
	he, ok := err.(*echo.HTTPError)
	assert.True(t, ok)
	assert.Equal(t, http.StatusForbidden, he.Code)

	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCalenderMembershipCreate_OK(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewCalenderMembershipRepository(dbm.DB)
	h := handlers.NewCalenderMembershipHandler(repo)
	e := NewEcho()

	dbm.Mock.ExpectQuery(SQLFindByCalenderIDAndUserID).
		WithArgs("cu1", "uu1").
		WillReturnRows(sqlmock.NewRows([]string{}))
	dbm.Mock.ExpectQuery(SQLFindByCalenderID).
		WithArgs("cu1").
		WillReturnRows(sqlmock.NewRows([]string{}))
	dbm.Mock.ExpectExec(SQLCreateCalenderMembership).
		WithArgs("cu1", "uu1", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))

	req := httptest.NewRequest(http.MethodPost, "/calenders/cu1/join",
		bytes.NewBufferString("{}"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	c.SetParamNames("calender_id")
	c.SetParamValues("cu1")

	SetJWTUser(c, "uu1")

	err := h.Create(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.NoError(t, dbm.Mock.ExpectationsWereMet())
}

func TestCalenderMembershipCreate_Already(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewCalenderMembershipRepository(dbm.DB)
	h := handlers.NewCalenderMembershipHandler(repo)
	e := NewEcho()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"calender_id", "user_id", "role", "soso_point", "joined_at",
	}).AddRow("cu1", "uu1", "admin", 0, now)

	dbm.Mock.ExpectQuery(SQLFindByCalenderIDAndUserID).
		WithArgs("cu1", "uu1").
		WillReturnRows(rows)

	req := httptest.NewRequest(http.MethodPost, "/calenders/cu1/join",
		bytes.NewBufferString("{}"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	c.SetParamNames("calender_id")
	c.SetParamValues("cu1")

	SetJWTUser(c, "uu1")

	err := h.Create(c)
	assert.Error(t, err)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusConflict, he.Code)
	assert.NoError(t, dbm.Mock.ExpectationsWereMet())
}
