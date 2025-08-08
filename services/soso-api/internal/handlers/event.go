// internal/handlers/event.go
package handlers

import (
	"net/http"
	"time"

	"soso/internal/model"
	"soso/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type EventHandler struct {
	EventRepo *repository.EventRepository
}

func NewEventHandler(r *repository.EventRepository) *EventHandler {
	return &EventHandler{EventRepo: r}
}

/* ----------------------------------------------------------------
   Request / Response DTO
   ---------------------------------------------------------------- */

type EventCreateRequest struct {
	Title               string    `json:"title"                validate:"required,max=128"`
	Description         string    `json:"description"`
	StartTime           time.Time `json:"startTime"            validate:"required"`
	EndTime             time.Time `json:"endTime"              validate:"required"`
	OriginLocation      string    `json:"originLocation"       validate:"max=255"`
	DestinationLocation string    `json:"destinationLocation"  validate:"max=255"`
	SeatsRequiredGo     int       `json:"seatsRequiredGo"      validate:"min=0"`
	SeatsRequiredReturn int       `json:"seatsRequiredReturn"  validate:"min=0"`
}

func toEventResponse(e *model.Event) map[string]any {
	return map[string]any{
		"id":                  e.ID,
		"calenderId":          e.CalenderID,
		"creatorId":           e.CreatorID,
		"title":               e.Title,
		"description":         e.Description,
		"startTime":           e.StartTime,
		"endTime":             e.EndTime,
		"originLocation":      e.OriginLocation,
		"destinationLocation": e.DestinationLocation,
		"seatsRequiredGo":     e.SeatsRequiredGo,
		"seatsRequiredReturn": e.SeatsRequiredReturn,
	}
}

/* ----------------------------------------------------------------
   Handlers
   ---------------------------------------------------------------- */

// POST /calenders/:calender_id/events
func (h *EventHandler) Create(c echo.Context) error {
	calenderID := c.Param("calender_id")

	// 認証ユーザID取得
	tok, ok := c.Get("user").(*jwt.Token)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	claims, ok := tok.Claims.(*jwt.RegisteredClaims)
	if !ok || claims.Subject == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	creatorID := claims.Subject

	// リクエストパース & バリデーション
	var req EventCreateRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}
	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if !req.EndTime.After(req.StartTime) {
		return echo.NewHTTPError(http.StatusBadRequest, "endTime must be after startTime")
	}
	if req.SeatsRequiredGo == 0 && req.SeatsRequiredReturn == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "at least one of seatsRequiredGo or seatsRequiredReturn must be > 0")
	}

	// 登録用エンティティ
	ev := &model.Event{
		ID:                  uuid.NewString(),
		CalenderID:          calenderID,
		CreatorID:           creatorID,
		Title:               req.Title,
		Description:         req.Description,
		StartTime:           req.StartTime,
		EndTime:             req.EndTime,
		OriginLocation:      req.OriginLocation,
		DestinationLocation: req.DestinationLocation,
		SeatsRequiredGo:     req.SeatsRequiredGo,
		SeatsRequiredReturn: req.SeatsRequiredReturn,
	}

	if err := h.EventRepo.Create(c.Request().Context(), ev); err != nil {
		return err
	}
	return c.JSON(http.StatusCreated, toEventResponse(ev))
}

// GET /calenders/:calender_id/events
func (h *EventHandler) ListByCalender(c echo.Context) error {
	calenderID := c.Param("calender_id")

	events, err := h.EventRepo.FindEventsByCalenderId(c.Request().Context(), calenderID)
	if err != nil {
		return err
	}

	resp := make([]map[string]any, len(events))
	for i, ev := range events {
		resp[i] = toEventResponse(ev)
	}
	return c.JSON(http.StatusOK, resp)
}

// GET /events/:event_id
func (h *EventHandler) FindById(c echo.Context) error {
	eventID := c.Param("event_id")

	ev, err := h.EventRepo.FindById(c.Request().Context(), eventID)
	if err != nil {
		return err
	}
	if ev == nil {
		return echo.NewHTTPError(http.StatusNotFound, "event not found")
	}
	return c.JSON(http.StatusOK, toEventResponse(ev))
}
