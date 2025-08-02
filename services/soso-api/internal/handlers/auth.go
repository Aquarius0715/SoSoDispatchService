// internal/handlers/auth.go
package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"soso/internal/model"
	"soso/internal/repository"
	"soso/pkg/auth"
)

type CookieConf struct {
	Name     string
	Domain   string
	Path     string
	Secure   bool
	SameSite http.SameSite
}

type AuthHandler struct {
	UserRepo   *repository.UserRepository
	RTRepo     *repository.RefreshTokenRepository
	SigningKey string
	AccessTTL  int // minutes
	RefreshTTL int // hours
	Cookie     CookieConf
}

func NewAuthHandler(u *repository.UserRepository, r *repository.RefreshTokenRepository,
	signKey string, atMin, rtHour int, ck CookieConf) *AuthHandler {
	return &AuthHandler{
		UserRepo:   u,
		RTRepo:     r,
		SigningKey: signKey,
		AccessTTL:  atMin,
		RefreshTTL: rtHour,
		Cookie:     ck,
	}
}

type LoginRequest struct {
	MailAddress string `json:"mailAddress" validate:"required"`
	Password    string `json:"password" validate:"required"`
}

type TokenResponse struct {
	AccessToken string    `json:"access_token"`
	AccessExp   time.Time `json:"access_expires_at"`
}

// POST /auth/login
func (h *AuthHandler) Login(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}
	if err := c.Validate(&req); err != nil { // EchoのValidator利用
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	ctx := c.Request().Context()
	u, err := h.UserRepo.FindByMailAddress(ctx, req.MailAddress)
	if err != nil {
		return err
	}
	if u == nil || auth.CheckPassword(u.PasswordHash, req.Password) != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
	}

	access, aexp, err := auth.GenerateAccessToken(u.ID, h.SigningKey, h.AccessTTL)
	if err != nil {
		return err
	}
	rawRT, rexp, err := h.generateRefreshToken(ctx, u.ID)
	if err != nil {
		return err
	}
	h.setRefreshCookie(c, rawRT, rexp)

	return c.JSON(http.StatusOK, TokenResponse{
		AccessToken: access,
		AccessExp:   aexp,
	})
}

// POST /auth/refresh
func (h *AuthHandler) Refresh(c echo.Context) error {
	ck, err := c.Cookie(h.Cookie.Name)
	if err != nil || ck.Value == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "missing refresh cookie")
	}

	ctx := c.Request().Context()
	hash := auth.HashToken(ck.Value)
	rt, err := h.RTRepo.FindActiveByHash(ctx, hash)
	if err != nil {
		return err
	}
	if rt == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid refresh token")
	}

	// rotate
	if err := h.RTRepo.Revoke(ctx, rt.ID); err != nil {
		return err
	}
	access, aexp, err := auth.GenerateAccessToken(rt.UserID, h.SigningKey, h.AccessTTL)
	if err != nil {
		return err
	}
	newRaw, nexp, err := h.generateRefreshToken(ctx, rt.UserID)
	if err != nil {
		return err
	}
	h.setRefreshCookie(c, newRaw, nexp)

	return c.JSON(http.StatusOK, TokenResponse{
		AccessToken: access,
		AccessExp:   aexp,
	})
}

// POST /auth/logout
func (h *AuthHandler) Logout(c echo.Context) error {
	ctx := c.Request().Context()
	if ck, err := c.Cookie(h.Cookie.Name); err == nil && ck.Value != "" {
		hash := auth.HashToken(ck.Value)
		if rt, _ := h.RTRepo.FindActiveByHash(ctx, hash); rt != nil {
			_ = h.RTRepo.Revoke(ctx, rt.ID)
		}
	}
	h.clearRefreshCookie(c)
	return c.NoContent(http.StatusOK)
}

// -------- helpers --------

func (h *AuthHandler) generateRefreshToken(ctx context.Context, userID string) (string, time.Time, error) {
	raw := randomString(64)
	hash := auth.HashToken(raw)
	exp := time.Now().Add(time.Duration(h.RefreshTTL) * time.Hour)

	rt := &model.RefreshToken{
		ID:        uuid.NewString(),
		UserID:    userID,
		TokenHash: hash,
		ExpiresAt: exp,
	}
	if err := h.RTRepo.Insert(ctx, rt); err != nil {
		return "", time.Time{}, err
	}
	return raw, exp, nil
}

func randomString(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)[:n]
}

func (h *AuthHandler) setRefreshCookie(c echo.Context, token string, exp time.Time) {
	cookie := &http.Cookie{
		Name:     h.Cookie.Name,
		Value:    token,
		Path:     h.Cookie.Path,
		Domain:   h.Cookie.Domain,
		Expires:  exp,
		MaxAge:   int(time.Until(exp).Seconds()),
		HttpOnly: true,
		Secure:   h.Cookie.Secure,
		SameSite: h.Cookie.SameSite,
	}
	c.SetCookie(cookie)
}

func (h *AuthHandler) clearRefreshCookie(c echo.Context) {
	cookie := &http.Cookie{
		Name:     h.Cookie.Name,
		Value:    "",
		Path:     h.Cookie.Path,
		Domain:   h.Cookie.Domain,
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   h.Cookie.Secure,
		SameSite: h.Cookie.SameSite,
	}
	c.SetCookie(cookie)
}
