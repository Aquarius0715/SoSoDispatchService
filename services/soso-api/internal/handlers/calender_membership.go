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

	if exist, err := h.CalenderMembershipRepo.FindByCalenderIDAndUserID(ctx, c.Param("calenderId"), userId); err != nil {
		return err
	} else if exist != nil {
		return echo.NewHTTPError(http.StatusConflict, "You already join this calender")
	}
	if exist, err := h.CalenderMembershipRepo.FindByCalenderID(ctx, c.Param("calenderId")); err != nil {
		return err
	} else if exist != nil {
		cm := &model.CalenderMembership{
			CalenderID: c.Param("calenderId"),
			UserID:     userId,
			Role:       model.ADMIN,
		}
		if err := h.CalenderMembershipRepo.Create(ctx, cm); err != nil {
			return err
		}
		return c.NoContent(http.StatusAccepted)
	} else {
		cm := &model.CalenderMembership{
			CalenderID: c.Param("calenderId"),
			UserID:     userId,
			Role:       model.MEMBER,
		}
		if err := h.CalenderMembershipRepo.Create(ctx, cm); err != nil {
			return err
		}
		return c.NoContent(http.StatusAccepted)
	}
}
