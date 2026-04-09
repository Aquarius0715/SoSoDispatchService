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
	parts := make([]model.EventParticipant, len(req.ParticipantUserIDs))
	for i, uid := range req.ParticipantUserIDs {
		parts[i] = model.EventParticipant{
			EventID:           ev.ID,
			UserID:            uid,
			ParticipantStatus: true,
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
	ps, err := h.EventParticipantRepo.FindByEventID(c.Request().Context(), eid)
	if err != nil {
		return err
	}
	var ids []string
	for _, p := range ps {
		if p.ParticipantStatus {
			ids = append(ids, p.UserID)
		}
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
func (h *EventHandler) RegisterParticipant(c echo.Context) error {
	return h.registerDriver(c, func(ep *model.EventParticipant) {
		ep.ParticipantStatus = true
	})
}

func (h *EventHandler) RegisterGoDriver(c echo.Context) error {
	return h.registerDriver(c, func(ep *model.EventParticipant) {
		ep.GoDriverStatus = true
	})
}

func (h *EventHandler) RegisterReturnDriver(c echo.Context) error {
	return h.registerDriver(c, func(ep *model.EventParticipant) {
		ep.ReturnDriverStatus = true
	})
}

func (h *EventHandler) RegisterBothDriver(c echo.Context) error {
	return h.registerDriver(c, func(ep *model.EventParticipant) {
		ep.GoDriverStatus = true
		ep.ReturnDriverStatus = true
	})
}

func (h *EventHandler) RegisterGoRider(c echo.Context) error {
	return h.registerDriver(c, func(ep *model.EventParticipant) {
		ep.GoRiderStatus = true
	})
}

func (h *EventHandler) RegisterReturnRider(c echo.Context) error {
	return h.registerDriver(c, func(ep *model.EventParticipant) {
		ep.ReturnRiderStatus = true
	})
}

func (h *EventHandler) RegisterBothRider(c echo.Context) error {
	return h.registerDriver(c, func(ep *model.EventParticipant) {
		ep.GoRiderStatus = true
		ep.ReturnRiderStatus = true
	})
}

// registerDriver は認証→EventParticipant組み立て→Upsert の共通ロジック。
// setFields で呼び出し元がどの boolean を立てるか決める。
func (h *EventHandler) registerDriver(c echo.Context, setFields func(*model.EventParticipant)) error {
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

	/* ---- Upsert ---- */
	ep := model.EventParticipant{
		EventID: eventID,
		UserID:  userID,
	}
	setFields(&ep)

	if err := h.EventParticipantRepo.Upsert(c.Request().Context(), ep); err != nil {
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
		if inf.ParticipantStatus {
			userNames = append(userNames, inf.UserName)
		}
		if inf.GoDriverStatus {
			goCapSum += inf.Capacity
			goDrivers = append(goDrivers, DriverDTO{Username: inf.UserName, Capacity: inf.Capacity})
		}
		if inf.ReturnDriverStatus {
			returnCapSum += inf.Capacity
			returnDrivers = append(returnDrivers, DriverDTO{Username: inf.UserName, Capacity: inf.Capacity})
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
