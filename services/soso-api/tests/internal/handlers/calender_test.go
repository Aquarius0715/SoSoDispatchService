package handlers_test

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"soso/internal/handlers"
	"soso/internal/repository"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestCalenderCreate_OK(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewCalenderRepository(dbm.DB)
	h := handlers.NewCalenderHandler(repo)
	e := NewEcho()

	dbm.Mock.ExpectQuery(SQLCalenderFindByName).
		WithArgs("jouhoukyoku").
		WillReturnRows(sqlmock.NewRows([]string{}))
	dbm.Mock.ExpectExec(SQLCalenderCreate).
		WithArgs(sqlmock.AnyArg(), "jouhoukyoku", "jouhoukyoku", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))

	req := httptest.NewRequest(http.MethodPost, "/calenders/create",
		bytes.NewBufferString(`{"name":"jouhoukyoku","description":"jouhoukyoku"}`))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	SetJWTUser(c, "u1")

	err := h.Create(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.NoError(t, dbm.Mock.ExpectationsWereMet())
}
