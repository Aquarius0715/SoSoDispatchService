package handlers

import (
	"net/http"
	"soso/internal/model"
	"soso/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type CalenderHandler struct {
	CalenderRepo *repository.CalenderRepository
}

func NewCalenderHandler(r *repository.CalenderRepository) *CalenderHandler {
	return &CalenderHandler{CalenderRepo: r}
}

type CalenderCreateRequest struct {
	Name        string `json:"name" validate:"required,name"`
	Description string `json:"description" validate:"description"`
}

func (h *CalenderHandler) Create(c echo.Context) error {
	var req CalenderCreateRequest

	tok, ok := c.Get("user").(*jwt.Token)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	claims, ok := tok.Claims.(*jwt.RegisteredClaims)
	if !ok || claims.Subject == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	ownerId := claims.Subject

	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}
	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	ctx := c.Request().Context()
	if exist, err := h.CalenderRepo.FindByName(ctx, req.Name); err != nil {
		return err
	} else if exist != nil {
		return echo.NewHTTPError(http.StatusConflict, "Calender name already exists")
	}

	ca := &model.Calender{
		ID:          uuid.NewString(),
		Name:        req.Name,
		Description: req.Description,
		OwnerId:     ownerId,
	}

	if err := h.CalenderRepo.Create(ctx, ca); err != nil {
		return err
	}
	return c.NoContent(http.StatusCreated)
}
