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
	calRepo := &repository.CalenderRepository{DB: db}
	calMRepo := &repository.CalenderMembershipRepository{DB: db}
	eveRepo := &repository.EventRepository{DB: db}
	evePRepo := &repository.EventParticipantRepository{DB: db}
	sosoPRepo := &repository.SosoPointRepository{DB: db}

	cookieCfg := handlers.CookieConf{
		Name:     cfg.CookieNameRT,
		Domain:   cfg.CookieDomain,
		Path:     cfg.CookiePath,
		Secure:   cfg.CookieSecure,
		SameSite: cfg.CookieSameSite,
	}
	authH := handlers.NewAuthHandler(userRepo, rtRepo, cfg.JWTSigningKey, cfg.AccessTokenTTLMin, cfg.RefreshTokenTTLH, cookieCfg)
	userH := handlers.NewUserHandler(userRepo)
	calenderH := handlers.NewCalenderHandler(calRepo)
	calenderMembershipH := handlers.NewCalenderMembershipHandler(calMRepo)
	eventH := handlers.NewEventHandler(eveRepo, evePRepo)
	sosoPH := handlers.NewSosoPointHandler(sosoPRepo)

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
	e.GET("/auth/csrf", func(c echo.Context) error {
		if !cfg.CSRFEnabled {
			return c.NoContent(http.StatusNoContent)
		}
		token := c.Get("csrf_token").(string)
		return c.JSON(http.StatusOK, map[string]string{"csrf_token": token})
	}, csrfMW)

	// JWT認証
	jwtCfg := echojwt.Config{
		SigningKey: []byte(cfg.JWTSigningKey),
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return new(jwt.RegisteredClaims)
		},
		ErrorHandler: func(c echo.Context, err error) error {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
		},
	}

	// /auth
	authG := e.Group("/auth", csrfMW)
	authG.POST("/login", authH.Login)
	authG.POST("/refresh", authH.Refresh)
	authG.POST("/logout", authH.Logout, echojwt.WithConfig(jwtCfg))

	// /users 公開
	usersG := e.Group("/users", csrfMW)
	usersG.POST("/register", userH.Register)

	// Users
	usersPriv := usersG.Group("", echojwt.WithConfig(jwtCfg)) // 同じ /users 配下
	usersPriv.GET("/me", userH.Me)
	// usersPriv.GET("/me", userH.Me) の下に追加
	usersPriv.PATCH("/me", userH.UpdateMe) // userH.UpdateMeは新しく作る関数

	// Calenders
	calG := e.Group("/calenders", csrfMW, echojwt.WithConfig(jwtCfg))
	calG.POST("/create", calenderH.Create)
	calG.POST("/:calender_id/join", calenderMembershipH.Create)
	calG.GET("/my", calenderH.FindMyCalenders)
	calG.GET("/:calender_id/members", calenderMembershipH.List)
	calG.PUT("/:calender_id/members/:user_id/point", sosoPH.Update)
	calG.POST("/:calender_id/events", eventH.Create)
	calG.GET("/:calender_id/events", eventH.ListByCalender)
	calG.GET("/:calender_id/soso_history", sosoPH.ListByCalender)

	eveG := e.Group("/events", csrfMW, echojwt.WithConfig(jwtCfg))
	eveG.GET("/:event_id", eventH.FindById)
	eveG.POST("/:event_id/pickup", eventH.RegisterPickUp)
	eveG.POST("/:event_id/return", eventH.RegisterReturn)
	eveG.GET("/:event_id/detail", eventH.Detail)
	eveG.GET("/:event_id/members", eventH.Members)
	eveG.GET("/dispatch/me", calenderH.FindMyTransportEvents)
	eveG.GET("/:event_id/soso_history", sosoPH.ListByEvent)

	// シャットダウン時クローズ
	e.Server.RegisterOnShutdown(func() { _ = db.Close() })
	return e
}
