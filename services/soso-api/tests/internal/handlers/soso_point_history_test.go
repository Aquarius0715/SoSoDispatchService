package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"

	"soso/internal/handlers"
	"soso/internal/repository"
)

/* ---------------------------------------------------------------
   Helpers
--------------------------------------------------------------- */

type noopValidator struct{}

func (v *noopValidator) Validate(i interface{}) error { return nil }

func newEcho() *echo.Echo {
	e := echo.New()
	e.Validator = &noopValidator{}
	return e
}

func newSQLMock(t *testing.T) (*repository.SosoPointRepository, sqlmock.Sqlmock, func()) {
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherRegexp))
	assert.NoError(t, err)
	return repository.NewSosoPointRepository(db), mock, func() { _ = db.Close() }
}

func jwtToken(sub string) *jwt.Token {
	return &jwt.Token{Claims: &jwt.RegisteredClaims{Subject: sub}}
}

/*
	---------------------------------------------------------------
	  DTO for response decode

---------------------------------------------------------------
*/
type SosoPointHistoryResponse struct {
	ID         int64     `json:"id"`
	CalenderID string    `json:"calenderId"`
	UserID     string    `json:"userId"`
	ChangedAt  time.Time `json:"changedAt"`
	ChangedBy  *string   `json:"changedBy"`
	EventID    *string   `json:"eventId"`
	OldPoint   int       `json:"oldPoint"`
	NewPoint   int       `json:"newPoint"`
	PointDelta int       `json:"pointDelta"`
	Reason     string    `json:"reason"`
}

/* ---------------------------------------------------------------
   Update
--------------------------------------------------------------- */

func TestSosoPointHandler_Update_OK(t *testing.T) {
	repo, mock, close := newSQLMock(t)
	defer close()

	h := handlers.NewSosoPointHandler(repo)
	e := newEcho()

	calID := "calA"
	userID := "u1"
	body := `{"newPoint":15,"reason":"bonus","eventId":"ev1"}`

	req := httptest.NewRequest(http.MethodPut, "/calenders/"+calID+"/members/"+userID+"/point", bytes.NewBufferString(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/calenders/:calender_id/members/:user_id/point")
	c.SetParamNames("calender_id", "user_id")
	c.SetParamValues(calID, userID)
	c.Set("user", jwtToken("admin"))

	// SQL expectations
	oldPt, newPt := 10, 15
	mock.ExpectBegin()
	mock.ExpectQuery(`SELECT\s+soso_point\s+FROM\s+calender_memberships`).
		WithArgs(calID, userID).
		WillReturnRows(sqlmock.NewRows([]string{"soso_point"}).AddRow(oldPt))
	mock.ExpectExec(`UPDATE\s+calender_memberships\s+SET\s+soso_point`).
		WithArgs(newPt, calID, userID).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(`INSERT\s+INTO\s+soso_point_histories`).
		WithArgs(calID, userID, sqlmock.AnyArg(), sqlmock.AnyArg(), oldPt, newPt, newPt-oldPt, "bonus").
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectCommit()

	err := h.Update(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestSosoPointHandler_Update_InvalidJSON(t *testing.T) {
	// Bind で失敗させる（バリデータは通さない）
	repo := repository.NewSosoPointRepository(nil)
	h := handlers.NewSosoPointHandler(repo)
	e := newEcho()

	req := httptest.NewRequest(http.MethodPut, "/calenders/c/members/u/point", bytes.NewBufferString(`{"newPoint":"oops"}`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/calenders/:calender_id/members/:user_id/point")
	c.SetParamNames("calender_id", "user_id")
	c.SetParamValues("c", "u")

	err := h.Update(c)
	if assert.Error(t, err) {
		if he, ok := err.(*echo.HTTPError); ok {
			assert.Equal(t, http.StatusBadRequest, he.Code)
		} else {
			t.Fatalf("want HTTPError")
		}
	}
}

/* ---------------------------------------------------------------
   ListByCalender
--------------------------------------------------------------- */

func TestSosoPointHandler_ListByCalender_OK(t *testing.T) {
	repo, mock, close := newSQLMock(t)
	defer close()

	h := handlers.NewSosoPointHandler(repo)
	e := newEcho()

	calID := "calA"
	t1 := time.Now().Add(-time.Hour).Truncate(time.Microsecond)
	t2 := time.Now().Truncate(time.Microsecond)

	rows := sqlmock.NewRows([]string{
		"id", "calender_id", "user_id", "changed_at", "changed_by", "event_id",
		"old_point", "new_point", "point_delta", "reason",
	}).AddRow(
		int64(2), calID, "u1", t2, "admin", "ev1", 10, 15, 5, "bonus",
	).AddRow(
		int64(1), calID, "u2", t1, nil, nil, 20, 18, -2, nil,
	)

	mock.ExpectQuery(regexp.QuoteMeta(repository.SQLSosoPointHistoryFindByCalenderID)).
		WithArgs(calID).
		WillReturnRows(rows)

	req := httptest.NewRequest(http.MethodGet, "/calenders/"+calID+"/soso_point_history", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/calenders/:calender_id/soso_point_history")
	c.SetParamNames("calender_id")
	c.SetParamValues(calID)
	c.Set("user", jwtToken("whoever"))

	err := h.ListByCalender(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)

	var got []SosoPointHistoryResponse
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &got))
	assert.Len(t, got, 2)

	assert.EqualValues(t, 2, got[0].ID)
	assert.Equal(t, calID, got[0].CalenderID)
	assert.Equal(t, "u1", got[0].UserID)
	assert.True(t, got[0].ChangedAt.Equal(t2))
	if assert.NotNil(t, got[0].ChangedBy) {
		assert.Equal(t, "admin", *got[0].ChangedBy)
	}
	if assert.NotNil(t, got[0].EventID) {
		assert.Equal(t, "ev1", *got[0].EventID)
	}
	assert.Equal(t, "bonus", got[0].Reason)

	assert.Nil(t, got[1].ChangedBy)
	assert.Nil(t, got[1].EventID)
	assert.Equal(t, "", got[1].Reason)

	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestSosoPointHandler_ListByCalender_Unauthorized(t *testing.T) {
	repo := repository.NewSosoPointRepository(nil)
	h := handlers.NewSosoPointHandler(repo)
	e := newEcho()

	req := httptest.NewRequest(http.MethodGet, "/calenders/calA/soso_point_history", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/calenders/:calender_id/soso_point_history")
	c.SetParamNames("calender_id")
	c.SetParamValues("calA")

	err := h.ListByCalender(c)
	if assert.Error(t, err) {
		if he, ok := err.(*echo.HTTPError); ok {
			assert.Equal(t, http.StatusUnauthorized, he.Code)
		} else {
			t.Fatalf("want HTTPError")
		}
	}
}

/* ---------------------------------------------------------------
   ListByEvent
--------------------------------------------------------------- */

func TestSosoPointHandler_ListByEvent_OK(t *testing.T) {
	repo, mock, close := newSQLMock(t)
	defer close()

	h := handlers.NewSosoPointHandler(repo)
	e := newEcho()

	eventID := "ev1"
	t1 := time.Now().Add(-2 * time.Hour).Truncate(time.Microsecond)
	t2 := time.Now().Add(-time.Hour).Truncate(time.Microsecond)

	rows := sqlmock.NewRows([]string{
		"id", "calender_id", "user_id", "changed_at", "changed_by", "event_id",
		"old_point", "new_point", "point_delta", "reason",
	}).AddRow(
		int64(5), "calA", "u1", t2, nil, eventID, 5, 8, 3, "ride",
	).AddRow(
		int64(4), "calB", "u2", t1, "owner", eventID, 8, 6, -2, "adjust",
	)

	mock.ExpectQuery(regexp.QuoteMeta(repository.SQLSosoPointHistoryFindByEventID)).
		WithArgs(eventID).
		WillReturnRows(rows)

	req := httptest.NewRequest(http.MethodGet, "/events/"+eventID+"/soso_point_history", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/events/:event_id/soso_point_history")
	c.SetParamNames("event_id")
	c.SetParamValues(eventID)
	c.Set("user", jwtToken("u-op"))

	err := h.ListByEvent(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)

	var got []SosoPointHistoryResponse
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &got))
	assert.Len(t, got, 2)
	assert.EqualValues(t, 5, got[0].ID)
	assert.Nil(t, got[0].ChangedBy)
	assert.NotNil(t, got[0].EventID)
	assert.Equal(t, "ride", got[0].Reason)

	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestSosoPointHandler_ListByEvent_QueryError(t *testing.T) {
	repo, mock, close := newSQLMock(t)
	defer close()

	h := handlers.NewSosoPointHandler(repo)
	e := newEcho()

	eventID := "evX"
	mock.ExpectQuery(regexp.QuoteMeta(repository.SQLSosoPointHistoryFindByEventID)).
		WithArgs(eventID).
		WillReturnError(assert.AnError)

	req := httptest.NewRequest(http.MethodGet, "/events/"+eventID+"/soso_point_history", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/events/:event_id/soso_point_history")
	c.SetParamNames("event_id")
	c.SetParamValues(eventID)
	c.Set("user", jwtToken("u-op"))

	err := h.ListByEvent(c)
	assert.Error(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

/* ---------------------------------------------------------------
   Update: repository error propagation
--------------------------------------------------------------- */

func TestSosoPointHandler_Update_RepoError(t *testing.T) {
	repo, mock, close := newSQLMock(t)
	defer close()

	h := handlers.NewSosoPointHandler(repo)
	e := newEcho()

	calID := "calA"
	userID := "u1"
	body := `{"newPoint":99,"reason":"x"}`

	req := httptest.NewRequest(http.MethodPut, "/calenders/"+calID+"/members/"+userID+"/point", bytes.NewBufferString(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/calenders/:calender_id/members/:user_id/point")
	c.SetParamNames("calender_id", "user_id")
	c.SetParamValues(calID, userID)

	// cause error at SELECT step
	mock.ExpectBegin()
	mock.ExpectQuery(`SELECT\s+soso_point\s+FROM\s+calender_memberships`).
		WithArgs(calID, userID).
		WillReturnError(assert.AnError)
	mock.ExpectRollback()

	err := h.Update(c)
	assert.Error(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}
