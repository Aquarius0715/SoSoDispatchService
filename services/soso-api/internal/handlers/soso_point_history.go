package handlers

import (
	"net/http"

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
