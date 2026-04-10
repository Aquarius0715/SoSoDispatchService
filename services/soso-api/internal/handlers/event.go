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

type DriverDTO struct {
	UserId   string `json:"userId"`
	Username string `json:"username"`
	Capacity int    `json:"capacity"`
}

type EventDetailResponse struct {
	Title                string      `json:"title"`
	StartTime            time.Time   `json:"startTime"`
	EndTime              time.Time   `json:"endTime"`
	Description          string      `json:"description"`
	OriginLocation       string      `json:"originLocation"`
	DestinationLocation  string      `json:"destinationLocation"`
	SeatsRequiredGo      int         `json:"seatsRequiredGo"`
	SeatsRequiredReturn  int         `json:"seatsRequiredReturn"`
	RemainingGoSeats     int         `json:"remainingGoSeats"`
	RemainingReturnSeats int         `json:"remainingReturnSeats"`
	Participants         []string    `json:"participants"`
	GoDrivers            []DriverDTO `json:"goDrivers"`
	ReturnDrivers        []DriverDTO `json:"returnDrivers"`
	GoCapacityTotal      int         `json:"goCapacityTotal"`
	ReturnCapacityTotal  int         `json:"returnCapacityTotal"`
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
		userNames     []string
		goCapSum      int
		returnCapSum  int
		goDrivers     []DriverDTO
		returnDrivers []DriverDTO
	)
	for _, inf := range infos {
		switch inf.Type {
		case model.Participants:
			userNames = append(userNames, inf.UserName)
		case model.Go:
			goCapSum += inf.Capacity
			goDrivers = append(goDrivers, DriverDTO{UserId: inf.UserID, Username: inf.UserName, Capacity: inf.Capacity})
		case model.Return:
			returnCapSum += inf.Capacity
			returnDrivers = append(returnDrivers, DriverDTO{UserId: inf.UserID, Username: inf.UserName, Capacity: inf.Capacity})
		}
	}

	remainGo := max(ev.SeatsRequiredGo-goCapSum, 0)
	remainReturn := max(ev.SeatsRequiredReturn-returnCapSum, 0)

	resp := EventDetailResponse{
		Title:                ev.Title,
		StartTime:            ev.StartTime,
		EndTime:              ev.EndTime,
		Description:          ev.Description,
		OriginLocation:       ev.OriginLocation,
		DestinationLocation:  ev.DestinationLocation,
		SeatsRequiredGo:      ev.SeatsRequiredGo,
		SeatsRequiredReturn:  ev.SeatsRequiredReturn,
		RemainingGoSeats:     remainGo,
		RemainingReturnSeats: remainReturn,
		Participants:         userNames,
		GoDrivers:            goDrivers,
		ReturnDrivers:        returnDrivers,
		GoCapacityTotal:      goCapSum,
		ReturnCapacityTotal:  returnCapSum,
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
