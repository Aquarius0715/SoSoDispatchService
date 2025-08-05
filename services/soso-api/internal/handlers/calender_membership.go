package handlers

import (
	"net/http"
	"soso/internal/model"
	"soso/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type CalenderMembershipHandler struct {
	CalenderMembershipRepo *repository.CalenderMembershipRepository
}

func NewCalenderMembershipHandler(r *repository.CalenderMembershipRepository) *CalenderMembershipHandler {
	return &CalenderMembershipHandler{CalenderMembershipRepo: r}
}

type CalenderMembershipRequest struct {
	CalenderID string `json:"calenderId"`
}

func (h *CalenderMembershipHandler) Create(c echo.Context) error {
	var req CalenderMembershipRequest

	tok, ok := c.Get("user").(*jwt.Token)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	claims, ok := tok.Claims.(*jwt.RegisteredClaims)
	if !ok || claims.Subject == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	userId := claims.Subject

	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}
	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	ctx := c.Request().Context()

	if exist, err := h.CalenderMembershipRepo.FindByCalenderIDAndUserID(ctx, req.CalenderID, userId); err != nil {
		return err
	} else if exist != nil {
		return echo.NewHTTPError(http.StatusConflict, "You already join this calender")
	}
	cm := &model.CalenderMembership{
		CalenderID: req.CalenderID,
		UserID:     userId,
	}
}
