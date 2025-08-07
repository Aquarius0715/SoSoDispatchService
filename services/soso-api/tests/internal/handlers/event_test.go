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

/* ----------------------------------------------------------------
   モック生成ヘルパ
   ---------------------------------------------------------------- */

func newEventHandler(t *testing.T) (*handlers.EventHandler, sqlmock.Sqlmock, func(), *echo.Echo) {
	dbm := NewSQLMock(t)

	er := repository.NewEventRepository(dbm.DB)
	epr := repository.NewEventParticipantRepository(dbm.DB)

	h := handlers.NewEventHandler(er, epr)
	return h, dbm.Mock, dbm.Close, NewEcho()
}

/* ----------------------------------------------------------------
   Create
   ---------------------------------------------------------------- */

func TestEventCreate_OK(t *testing.T) {
	h, mock, closeFn, e := newEventHandler(t)
	defer closeFn()

	mock.ExpectExec(SQLEventCreate).
		WithArgs(sqlmock.AnyArg(), "cal1", "u1", "Event 1", "desc",
			sqlmock.AnyArg(), sqlmock.AnyArg(), "A", "B", 2, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// 参加者を空配列にすると BulkInsert は呼ばれず SQL モック不要
	body := `{
		"title":"Event 1",
		"description":"desc",
		"startTime":"2025-08-08T10:00:00Z",
		"endTime":"2025-08-08T11:00:00Z",
		"originLocation":"A",
		"destinationLocation":"B",
		"seatsRequiredGo":2,
		"seatsRequiredReturn":1,
		"participantUserIds":[]
	}`

	req := httptest.NewRequest(http.MethodPost, "/calenders/cal1/events", bytes.NewBufferString(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/calenders/:calender_id/events")
	c.SetParamNames("calender_id")
	c.SetParamValues("cal1")
	SetJWTUser(c, "u1")

	err := h.Create(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestEventCreate_InvalidPayload(t *testing.T) {
	h, _, closeFn, e := newEventHandler(t)
	defer closeFn()

	req := httptest.NewRequest(http.MethodPost, "/calenders/cal1/events", bytes.NewBufferString(`{`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/calenders/:calender_id/events")
	c.SetParamNames("calender_id")
	c.SetParamValues("cal1")
	SetJWTUser(c, "u1")

	err := h.Create(c)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusBadRequest, he.Code)
}

func TestEventCreate_Unauthorized(t *testing.T) {
	h, _, closeFn, e := newEventHandler(t)
	defer closeFn()

	req := httptest.NewRequest(http.MethodPost, "/calenders/cal1/events", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/calenders/:calender_id/events")
	c.SetParamNames("calender_id")
	c.SetParamValues("cal1")

	err := h.Create(c)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusUnauthorized, he.Code)
}

/* ----------------------------------------------------------------
   ListByCalender
   ---------------------------------------------------------------- */

func TestEventListByCalender_OK(t *testing.T) {
	h, mock, closeFn, e := newEventHandler(t)
	defer closeFn()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "calender_id", "creator_id", "title", "description",
		"start_time", "end_time", "origin_location", "destination_location",
		"seats_required_go", "seats_required_return",
		"created_at", "updated_at",
	}).AddRow("ev1", "cal1", "u1", "Event 1", "desc1",
		now, now.Add(time.Hour), "A1", "B1", 1, 0, now, now,
	).AddRow("ev2", "cal1", "u2", "Event 2", "desc2",
		now.Add(2*time.Hour), now.Add(3*time.Hour), "A2", "B2", 3, 3, now, now,
	)

	mock.ExpectQuery(SQLEventFindByCalenderID).
		WithArgs("cal1").
		WillReturnRows(rows)

	req := httptest.NewRequest(http.MethodGet, "/calenders/cal1/events", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/calenders/:calender_id/events")
	c.SetParamNames("calender_id")
	c.SetParamValues("cal1")

	err := h.ListByCalender(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)

	var got []map[string]any
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &got))
	assert.Len(t, got, 2)
	assert.Equal(t, float64(1), got[0]["seatsRequiredGo"])
	assert.Equal(t, float64(3), got[1]["seatsRequiredReturn"])
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestEventListByCalender_NotFound(t *testing.T) {
	h, mock, closeFn, e := newEventHandler(t)
	defer closeFn()

	empty := sqlmock.NewRows([]string{
		"id", "calender_id", "creator_id", "title", "description",
		"start_time", "end_time", "origin_location", "destination_location",
		"seats_required_go", "seats_required_return",
		"created_at", "updated_at",
	})
	mock.ExpectQuery(SQLEventFindByCalenderID).
		WithArgs("cal1").
		WillReturnRows(empty)

	req := httptest.NewRequest(http.MethodGet, "/calenders/cal1/events", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/calenders/:calender_id/events")
	c.SetParamNames("calender_id")
	c.SetParamValues("cal1")

	err := h.ListByCalender(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)

	var got []map[string]any
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &got))
	assert.Len(t, got, 0)
	assert.NoError(t, mock.ExpectationsWereMet())
}

/* ----------------------------------------------------------------
   FindById
   ---------------------------------------------------------------- */

// 参加者クエリ用定数
const SQLEventParticipantsByEventID = `
SELECT event_id, user_id, status, type, registered_at
FROM event_participants
WHERE event_id = ? AND type = ?`

func TestEventFindById_OK(t *testing.T) {
	h, mock, closeFn, e := newEventHandler(t)
	defer closeFn()

	now := time.Now()
	eventRows := sqlmock.NewRows([]string{
		"id", "calender_id", "creator_id", "title", "description",
		"start_time", "end_time", "origin_location", "destination_location",
		"seats_required_go", "seats_required_return",
		"created_at", "updated_at",
	}).AddRow("ev1", "cal1", "u1", "Event 1", "desc1",
		now, now.Add(time.Hour), "A", "B", 2, 1, now, now,
	)
	mock.ExpectQuery(SQLEventFindById).
		WithArgs("ev1").
		WillReturnRows(eventRows)

	// 参加者 2 名
	partRows := sqlmock.NewRows([]string{
		"event_id", "user_id", "status", "type", "registered_at",
	}).AddRow("ev1", "user123", "registered", "participants", now).
		AddRow("ev1", "user456", "registered", "participants", now)
	mock.ExpectQuery(SQLEventParticipantsByEventID).
		WithArgs("ev1", "participants").
		WillReturnRows(partRows)

	req := httptest.NewRequest(http.MethodGet, "/events/ev1", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/events/:event_id")
	c.SetParamNames("event_id")
	c.SetParamValues("ev1")

	err := h.FindById(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)

	var got map[string]any
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &got))
	assert.Equal(t, []any{"user123", "user456"}, got["participantUserIds"])
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestEventFindById_NotFound(t *testing.T) {
	h, mock, closeFn, e := newEventHandler(t)
	defer closeFn()

	mock.ExpectQuery(SQLEventFindById).
		WithArgs("ev1").
		WillReturnRows(sqlmock.NewRows([]string{}))

	req := httptest.NewRequest(http.MethodGet, "/events/ev1", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/events/:event_id")
	c.SetParamNames("event_id")
	c.SetParamValues("ev1")

	err := h.FindById(c)
	he := err.(*echo.HTTPError)
	assert.Equal(t, http.StatusNotFound, he.Code)
	assert.NoError(t, mock.ExpectationsWereMet())
}
