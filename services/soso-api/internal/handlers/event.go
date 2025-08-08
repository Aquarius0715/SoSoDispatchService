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
	EventRepo            *repository.EventRepository
	EventParticipantRepo *repository.EventParticipantRepository
}

func NewEventHandler(er *repository.EventRepository, epr *repository.EventParticipantRepository) *EventHandler {
	return &EventHandler{EventRepo: er, EventParticipantRepo: epr}
}

/* ---------- DTO ---------- */

type EventCreateRequest struct {
	Title               string    `json:"title"                 validate:"required,max=128"`
	Description         string    `json:"description"` // 任意
	StartTime           time.Time `json:"startTime"             validate:"required"`
	EndTime             time.Time `json:"endTime"               validate:"required"`
	OriginLocation      string    `json:"originLocation"        validate:"max=255"`
	DestinationLocation string    `json:"destinationLocation"   validate:"max=255"`
	SeatsRequiredGo     int       `json:"seatsRequiredGo"       validate:"min=0"`
	SeatsRequiredReturn int       `json:"seatsRequiredReturn"   validate:"min=0"`
	ParticipantUserIDs  []string  `json:"participantUserIds"    validate:"dive,required"`
}

func baseEventResponse(ev *model.Event) map[string]any {
	return map[string]any{
		"id":                  ev.ID,
		"calenderId":          ev.CalenderID,
		"creatorId":           ev.CreatorID,
		"title":               ev.Title,
		"description":         ev.Description,
		"startTime":           ev.StartTime,
		"endTime":             ev.EndTime,
		"originLocation":      ev.OriginLocation,
		"destinationLocation": ev.DestinationLocation,
		"seatsRequiredGo":     ev.SeatsRequiredGo,
		"seatsRequiredReturn": ev.SeatsRequiredReturn,
	}
}

/* ---------- Handlers ---------- */

// POST /calenders/:calender_id/events
func (h *EventHandler) Create(c echo.Context) error {
	calID := c.Param("calender_id")

	// 認証ユーザ
	tok, ok := c.Get("user").(*jwt.Token)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	claims := tok.Claims.(*jwt.RegisteredClaims)
	creatorID := claims.Subject

	// リクエスト
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
		return echo.NewHTTPError(http.StatusBadRequest, "either seatsRequiredGo or seatsRequiredReturn must be > 0")
	}

	ev := &model.Event{
		ID:                  uuid.NewString(),
		CalenderID:          calID,
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

	// 参加者
	registered := time.Now()
	parts := make([]model.EventParticipant, len(req.ParticipantUserIDs))
	for i, uid := range req.ParticipantUserIDs {
		parts[i] = model.EventParticipant{
			EventID:      ev.ID,
			UserID:       uid,
			Status:       model.Registered,
			Type:         model.Participants,
			RegisteredAt: registered,
		}
	}
	if err := h.EventParticipantRepo.BulkInsert(c.Request().Context(), parts); err != nil {
		return err
	}

	resp := baseEventResponse(ev)
	resp["participantUserIds"] = req.ParticipantUserIDs
	return c.JSON(http.StatusCreated, resp)
}

// GET /events/:event_id
func (h *EventHandler) FindById(c echo.Context) error {
	eid := c.Param("event_id")

	ev, err := h.EventRepo.FindById(c.Request().Context(), eid)
	if err != nil {
		return err
	}
	if ev == nil {
		return echo.NewHTTPError(http.StatusNotFound, "event not found")
	}
	// 参加者
	ps, err := h.EventParticipantRepo.FindByEventIDAndType(c.Request().Context(), eid, model.Participants)
	if err != nil {
		return err
	}
	ids := make([]string, len(ps))
	for i, p := range ps {
		ids[i] = p.UserID
	}
	resp := baseEventResponse(ev)
	resp["participantUserIds"] = ids
	return c.JSON(http.StatusOK, resp)
}

// GET /calenders/:calender_id/events
func (h *EventHandler) ListByCalender(c echo.Context) error {
	calID := c.Param("calender_id")
	list, err := h.EventRepo.FindEventsByCalenderId(c.Request().Context(), calID)
	if err != nil {
		return err
	}
	resp := make([]map[string]any, len(list))
	for i, ev := range list {
		resp[i] = baseEventResponse(ev) // 一覧では参加者 ID を含めない
	}
	return c.JSON(http.StatusOK, resp)
}

/*
	-------------------------------------------------------------
	  POST /events/:event_id/pickup   (迎え登録)

-------------------------------------------------------------
*/
func (h *EventHandler) RegisterPickUp(c echo.Context) error {
	return h.registerParticipant(c, model.Go) // Type.Go
}

/*
	-------------------------------------------------------------
	  POST /events/:event_id/return  (送り登録)

-------------------------------------------------------------
*/
func (h *EventHandler) RegisterReturn(c echo.Context) error {
	return h.registerParticipant(c, model.Return) // Type.Return
}

/*
=============================================================

	共通ロジック
	=============================================================
*/
func (h *EventHandler) registerParticipant(c echo.Context, tp model.Type) error {
	eventID := c.Param("event_id")

	/* ---- 認証ユーザ ID ---- */
	tok, ok := c.Get("user").(*jwt.Token)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	claims, ok := tok.Claims.(*jwt.RegisteredClaims)
	if !ok || claims.Subject == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	userID := claims.Subject

	/* ---- 1 行だけ Insert ---- */
	ep := model.EventParticipant{
		EventID:      eventID,
		UserID:       userID,
		Status:       model.Registered,
		Type:         tp,
		RegisteredAt: time.Now(),
	}

	if err := h.EventParticipantRepo.BulkInsert(
		c.Request().Context(),
		[]model.EventParticipant{ep},
	); err != nil {
		return err
	}
	return c.NoContent(http.StatusCreated)
}

/*
GET /events/:event_id/detail
レスポンス例:

	{
	  "title":"送迎イベント",
	  "startTime":"2025-09-01T09:00:00Z",
	  "description":"・・・",
	  "originLocation":"東京駅",
	  "destinationLocation":"箱根",
	  "seatsRequiredGo":3,
	  "seatsRequiredReturn":3,
	  "remainingGoSeats":1,
	  "remainingReturnSeats":0,
	  "participants":[ "alice","bob","charlie" ]
	}
*/
func (h *EventHandler) Detail(c echo.Context) error {
	eid := c.Param("event_id")

	// ----- event 本体 -----
	ev, err := h.EventRepo.FindById(c.Request().Context(), eid)
	if err != nil {
		return err
	}
	if ev == nil {
		return echo.NewHTTPError(http.StatusNotFound, "event not found")
	}

	// ----- 参加者情報 (ユーザ名 + capacity) -----
	infos, err := h.EventParticipantRepo.FetchUserInfos(c.Request().Context(), eid)
	if err != nil {
		return err
	}

	var (
		userNames    []string
		goCapSum     int
		returnCapSum int
	)
	for _, inf := range infos {
		switch inf.Type {
		case model.Participants:
			userNames = append(userNames, inf.UserName)
		case model.Go:
			goCapSum += inf.Capacity
		case model.Return:
			returnCapSum += inf.Capacity
		}
	}

	remainGo := max(ev.SeatsRequiredGo-goCapSum, 0)
	remainReturn := max(ev.SeatsRequiredReturn-returnCapSum, 0)

	resp := map[string]any{
		"title":                ev.Title,
		"startTime":            ev.StartTime,
		"description":          ev.Description,
		"originLocation":       ev.OriginLocation,
		"destinationLocation":  ev.DestinationLocation,
		"seatsRequiredGo":      ev.SeatsRequiredGo,
		"seatsRequiredReturn":  ev.SeatsRequiredReturn,
		"remainingGoSeats":     remainGo,
		"remainingReturnSeats": remainReturn,
		"participants":         userNames,
	}
	return c.JSON(http.StatusOK, resp)
}

/* 小さなヘルパ */
func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

/*
	-------------------------------------------------------------
	  GET /events/:event_id/members  ─ イベント参加メンバー一覧
	  -------------------------------------------------------------
	  レスポンス:
	  [
	    { "userId":"u1", "username":"alice",  "sosoPoint":10 },
	    { "userId":"u2", "username":"bob",    "sosoPoint": 7 }
	  ]

----------------------------------------------------------------
*/
func (h *EventHandler) Members(c echo.Context) error {
	eid := c.Param("event_id")

	members, err := h.EventParticipantRepo.FetchMemberInfos(
		c.Request().Context(), eid)
	if err != nil {
		return err
	}

	resp := make([]map[string]any, len(members))
	for i, m := range members {
		resp[i] = map[string]any{
			"userId":    m.UserID,
			"username":  m.UserName,
			"sosoPoint": m.SoSoPoint,
		}
	}
	return c.JSON(http.StatusOK, resp)
}
