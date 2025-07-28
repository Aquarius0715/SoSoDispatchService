package router

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"soso/src/handlers"
)

func Register(e *echo.Echo) {
	// ルート直下（動作確認用）
	e.GET("/", handlers.Hello)
}
