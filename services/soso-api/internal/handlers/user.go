// internal/handlers/user.go
package handlers

import (
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"soso/internal/model"
	"soso/internal/repository"
	"soso/pkg/auth"
)

type UserHandler struct {
	UserRepo *repository.UserRepository
}

func NewUserHandler(r *repository.UserRepository) *UserHandler {
	return &UserHandler{UserRepo: r}
}

// 入力DTOに validator タグを付与
type RegisterRequest struct {
	Username    string `json:"username" validate:"required,username"`
	MailAddress string `json:"mailAddress" validate:"required,mailAddress"`
	Password    string `json:"password" validate:"required,password"`
	HasCar      bool   `json:"hasCar"`
	Capacity    int    `json:"capacity" validate:"capacity"` // HasCar=true の時は後段で追加チェック
}

// POST /users/register
func (h *UserHandler) Register(c echo.Context) error {
	var req RegisterRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}
	// Echo の Validator 実行
	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	// 相関バリデーション（HasCar=true の時 Capacity>0）
	if req.HasCar && req.Capacity <= 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "capacity required when has_car is true")
	}

	ctx := c.Request().Context()
	if exist, err := h.UserRepo.FindByUsername(ctx, req.Username); err != nil {
		return err
	} else if exist != nil {
		return echo.NewHTTPError(http.StatusConflict, "username already exists")
	}
	if exist, err := h.UserRepo.FindByMailAddress(ctx, req.MailAddress); err != nil {
		return err
	} else if exist != nil {
		return echo.NewHTTPError(http.StatusConflict, "mailAddress already exists")
	}

	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		return err
	}
	u := &model.User{
		ID:           uuid.NewString(),
		Username:     req.Username,
		MailAddress:  req.MailAddress,
		PasswordHash: hash,
		HasCar:       req.HasCar,
		Capacity:     req.Capacity,
	}
	if err := h.UserRepo.Create(ctx, u); err != nil {
		return err
	}
	return c.JSON(http.StatusCreated, map[string]any{
		"id":          u.ID,
		"username":    u.Username,
		"mailAddress": u.MailAddress,
		"hasCar":      u.HasCar,
		"capacity":    u.Capacity,
		"createdAt":   u.CreatedAt,
		"updatedAt":   u.UpdatedAt,
	})
}

// GET /users/me
func (h *UserHandler) Me(c echo.Context) error {
	tok, ok := c.Get("user").(*jwt.Token)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	claims, ok := tok.Claims.(*jwt.RegisteredClaims)
	if !ok || claims.Subject == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	uid := claims.Subject

	ctx := c.Request().Context()
	u, err := h.UserRepo.FindByID(ctx, uid)
	if err != nil {
		return err
	}
	if u == nil {
		return echo.NewHTTPError(http.StatusNotFound, "user not found")
	}
	return c.JSON(http.StatusOK, map[string]any{
		"id":          u.ID,
		"username":    u.Username,
		"mailAddress": u.MailAddress,
		"hasCar":      u.HasCar,
		"capacity":    u.Capacity,
		"createdAt":   u.CreatedAt,
		"updatedAt":   u.UpdatedAt,
	})
}
