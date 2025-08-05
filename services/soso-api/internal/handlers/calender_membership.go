package handlers

import (
	"net/http"
	"soso/internal/model"
	"soso/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type CalenderMemberResponse struct {
	UserID    string `json:"userId"`
	Username  string `json:"username"`
	HasCar    bool   `json:"hasCar"`
	Capacity  int    `json:"capacity"`
	SoSoPoint int    `json:"sosoPoint"`
}

type CalenderMembershipHandler struct {
	CalenderMembershipRepo *repository.CalenderMembershipRepository
}

func NewCalenderMembershipHandler(r *repository.CalenderMembershipRepository) *CalenderMembershipHandler {
	return &CalenderMembershipHandler{CalenderMembershipRepo: r}
}

type CalenderMembershipRequest struct {
}

func (h *CalenderMembershipHandler) MemberList(c echo.Context) error {
	tok, ok := c.Get("user").(*jwt.Token)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	claims, ok := tok.Claims.(*jwt.RegisteredClaims)
	if !ok || claims.Subject == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	userID := claims.Subject

	calenderID := c.Param("calender_id")
	if calenderID == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "calender_id is required")
	}

	ctx := c.Request().Context()

	member, err := h.CalenderMembershipRepo.FindByCalenderIDAndUserID(ctx, calenderID, userID)
	if err != nil {
		return err
	}
	if member == nil {
		return echo.NewHTTPError(http.StatusForbidden, "forbidden")
	}

	members, err := h.CalenderMembershipRepo.FindMembersByCalenderID(ctx, calenderID)
	if err != nil {
		return err
	}

	res := make([]*CalenderMemberResponse, 0, len(members))
	for _, m := range members {
		res = append(res, &CalenderMemberResponse{
			UserID:    m.UserID,
			Username:  m.Username,
			HasCar:    m.HasCar,
			Capacity:  m.Capacity,
			SoSoPoint: m.SoSoPoint,
		})
	}

	return c.JSON(http.StatusOK, res)
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
	if c.Param("calender_id") == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "calender_id is required")
	}
	ctx := c.Request().Context()

	if exist, err := h.CalenderMembershipRepo.FindByCalenderIDAndUserID(ctx, c.Param("calender_id"), userId); err != nil {
		return err
	} else if exist != nil {
		return echo.NewHTTPError(http.StatusConflict, "You already join this calender")
	}
	if exist, err := h.CalenderMembershipRepo.FindByCalenderID(ctx, c.Param("calender_id")); err != nil {
		return err
	} else if exist == nil {
		cm := &model.CalenderMembership{
			CalenderID: c.Param("calender_id"),
			UserID:     userId,
			Role:       model.ADMIN,
		}
		if err := h.CalenderMembershipRepo.Create(ctx, cm); err != nil {
			return err
		}
		return c.NoContent(http.StatusCreated)
	} else {
		cm := &model.CalenderMembership{
			CalenderID: c.Param("calender_id"),
			UserID:     userId,
			Role:       model.MEMBER,
		}
		if err := h.CalenderMembershipRepo.Create(ctx, cm); err != nil {
			return err
		}
		return c.NoContent(http.StatusCreated)
	}
}
