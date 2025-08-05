package handlers_test

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"soso/internal/handlers"
	"soso/internal/repository"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestCalenderMembershipCreate_OK(t *testing.T) {
	dbm := NewSQLMock(t)
	defer dbm.Close()

	repo := repository.NewCalenderMembershipRepository(dbm.DB)
	h := handlers.NewCalenderMembershipHandler(repo)
	e := NewEcho()

	dbm.Mock.ExpectQuery(SQLFindByCalenderIDAndUserID).
		WithArgs("cu1", "uu1").
		WillReturnRows(sqlmock.NewRows([]string{}))
	dbm.Mock.ExpectQuery(SQLFindByCalenderID).
		WithArgs("cu1").
		WillReturnRows(sqlmock.NewRows([]string{}))
	dbm.Mock.ExpectExec(SQLCreateCalenderMembership).
		WithArgs("cu1", "uu1", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))

	req := httptest.NewRequest(http.MethodPost, "/calenders/cu1/join",
		bytes.NewBufferString("{}"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	c.SetParamNames("calender_id")
	c.SetParamValues("cu1")

	SetJWTUser(c, "uu1")

	err := h.Create(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.NoError(t, dbm.Mock.ExpectationsWereMet())
}
