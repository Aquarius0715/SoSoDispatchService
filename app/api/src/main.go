package main

import (
	"github.com/labstack/echo/v4"
	"soso/src/config/router"
)

func main() {
	e := echo.New()
	router.Register(e)

	e.Logger.Fatal(e.Start(":8080"))
}
