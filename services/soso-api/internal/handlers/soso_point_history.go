package handlers

import (
	"net/http"
	"time"

	"soso/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type SosoPointHandler struct {
	Repo *repository.SosoPointRepository
}

func NewSosoPointHandler(r *repository.SosoPointRepository) *SosoPointHandler {
	return &SosoPointHandler{Repo: r}
}

/* ---------- DTO ---------- */

type SosoPointUpdateRequest struct {
	NewPoint int    `json:"newPoint" validate:"required,min=0"`
	Reason   string `json:"reason"`
	EventID  string `json:"eventId"` // 空 = 予約に紐付かない手動調整
}

type SosoPointHistoryResponse struct {
	ID         int64     `json:"id"`
	CalenderID string    `json:"calenderId"`
	UserID     string    `json:"userId"`
	ChangedAt  time.Time `json:"changedAt"`
	ChangedBy  *string   `json:"changedBy,omitempty"`
	EventID    *string   `json:"eventId,omitempty"`
	OldPoint   int       `json:"oldPoint"`
	NewPoint   int       `json:"newPoint"`
	PointDelta int       `json:"pointDelta"`
	Reason     string    `json:"reason"`
}

// PUT /calenders/:calender_id/members/:user_id/point
func (h *SosoPointHandler) Update(c echo.Context) error {
	calID := c.Param("calender_id")
	targetUID := c.Param("user_id")

	var req SosoPointUpdateRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}
	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	// 操作者（JWT から取得・NULL 可）
	var changedBy *string
	if tok, ok := c.Get("user").(*jwt.Token); ok {
		if claims, _ := tok.Claims.(*jwt.RegisteredClaims); claims != nil && claims.Subject != "" {
			changedBy = &claims.Subject
		}
	}

	// eventId は空文字なら NULL 扱い
	var eventID *string
	if req.EventID != "" {
		eventID = &req.EventID
	}

	if err := h.Repo.UpdatePointWithLog(
		c.Request().Context(),
		calID, targetUID,
		req.NewPoint,
		changedBy,
		eventID,
		req.Reason,
	); err != nil {
		return err
	}

	return c.NoContent(http.StatusOK)
}

func requireJWT(c echo.Context) (sub string, ok bool) {
	if tok, has := c.Get("user").(*jwt.Token); has && tok != nil {
		if claims, _ := tok.Claims.(*jwt.RegisteredClaims); claims != nil {
			return claims.Subject, true
		}
	}
	return "", false
}

func toHistoryResponses(src []repository.SosoPointHistory) []SosoPointHistoryResponse {
	out := make([]SosoPointHistoryResponse, 0, len(src))
	for _, h := range src {
		out = append(out, SosoPointHistoryResponse{
			ID:         h.ID,
			CalenderID: h.CalenderID,
			UserID:     h.UserID,
			ChangedAt:  h.ChangedAt,
			ChangedBy:  h.ChangedBy,
			EventID:    h.EventID,
			OldPoint:   h.OldPoint,
			NewPoint:   h.NewPoint,
			PointDelta: h.PointDelta,
			Reason:     h.Reason,
		})
	}
	return out
}

/* ---------- handlers ---------- */

// GET /calenders/:calender_id/soso_point_history
func (h *SosoPointHandler) ListByCalender(c echo.Context) error {
	if _, ok := requireJWT(c); !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	calID := c.Param("calender_id")
	histories, err := h.Repo.FindHistoriesByCalenderID(c.Request().Context(), calID)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, toHistoryResponses(histories))
}

// GET /events/:event_id/soso_point_history
func (h *SosoPointHandler) ListByEvent(c echo.Context) error {
	if _, ok := requireJWT(c); !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	eventID := c.Param("event_id")
	histories, err := h.Repo.FindHistoriesByEventID(c.Request().Context(), eventID)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, toHistoryResponses(histories))
}
