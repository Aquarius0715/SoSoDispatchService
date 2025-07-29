package config

import (
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	echoMW "github.com/labstack/echo/v4/middleware"

	"soso/internal/handlers"
	"soso/internal/repository"
	"soso/internal/validator"
)

func SetupRouter(cfg *Config) *echo.Echo {

	e := echo.New()

	e.Validator = validator.New()

	// --- DB & DI ---
	db, err := repository.Open(
		cfg.DBDSN,
		cfg.DBMaxOpenConns,
		cfg.DBMaxIdleConns,
		cfg.DBConnMaxLifeDur,
	)
	if err != nil {
		e.Logger.Fatalf("db open error: %v", err)
	}

	userRepo := &repository.UserRepository{DB: db}
	rtRepo := &repository.RefreshTokenRepository{DB: db}

	cookieCfg := handlers.CookieConf{
		Name:     cfg.CookieNameRT,
		Domain:   cfg.CookieDomain,
		Path:     cfg.CookiePath,
		Secure:   cfg.CookieSecure,
		SameSite: cfg.CookieSameSite,
	}
	authH := handlers.NewAuthHandler(userRepo, rtRepo, cfg.JWTSigningKey, cfg.AccessTokenTTLMin, cfg.RefreshTokenTTLH, cookieCfg)
	userH := handlers.NewUserHandler(userRepo)

	// Echo標準ミドルウェア
	e.Use(echoMW.Logger())
	e.Use(echoMW.Recover())

	// CORS
	e.Use(echoMW.CORSWithConfig(echoMW.CORSConfig{
		AllowOrigins:     cfg.CORSAllowOrigins,
		AllowMethods:     cfg.CORSAllowMethods,
		AllowHeaders:     cfg.CORSAllowHeaders,
		AllowCredentials: cfg.CORSAllowCredentials,
		MaxAge:           86400,
	}))

	// CSRF
	var csrfMW echo.MiddlewareFunc
	if cfg.CSRFEnabled {
		csrfMW = echoMW.CSRFWithConfig(echoMW.CSRFConfig{
			TokenLookup:    "header:" + cfg.CSRFHeader(),
			CookieName:     cfg.CSRFCookieName,
			CookiePath:     "/",
			CookieHTTPOnly: false,
			CookieSecure:   cfg.CookieSecure,
			CookieSameSite: cfg.CookieSameSite,
			ContextKey:     "csrf_token",
		})
	} else {
		// no‑op ミドルウェア
		csrfMW = func(next echo.HandlerFunc) echo.HandlerFunc {
			return func(c echo.Context) error { return next(c) }
		}
	}

	// CSRFトークン配布
	e.GET("/csrf", func(c echo.Context) error {
		if !cfg.CSRFEnabled {
			return c.NoContent(http.StatusNoContent)
		}
		token := c.Get("csrf_token").(string)
		return c.JSON(http.StatusOK, map[string]string{"csrf_token": token})
	}, csrfMW)

	// /auth
	authG := e.Group("/auth", csrfMW)
	authG.POST("/login", authH.Login)
	authG.POST("/refresh", authH.Refresh)
	authG.POST("/logout", authH.Logout)

	// /users 公開
	usersG := e.Group("/users", csrfMW)
	usersG.POST("/register", userH.Register)

	// /users 認証必須
	jwtCfg := echojwt.Config{
		SigningKey: []byte(cfg.JWTSigningKey),
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return new(jwt.RegisteredClaims)
		},
		ErrorHandler: func(c echo.Context, err error) error {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
		},
	}
	usersPriv := usersG.Group("", echojwt.WithConfig(jwtCfg)) // 同じ /users 配下
	usersPriv.GET("/me", userH.Me)

	// シャットダウン時クローズ
	e.Server.RegisterOnShutdown(func() { _ = db.Close() })
	return e
}
