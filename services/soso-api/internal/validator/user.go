// internal/validator/team.go
package validator

import (
	"regexp"

	"github.com/go-playground/validator/v10"
)

func RegisterUser(v *validator.Validate) {
	_ = v.RegisterValidation("username", func(fl validator.FieldLevel) bool {
		return regexp.MustCompile(`^[a-zA-Z0-9_]{3,30}$`).MatchString(fl.Field().String())
	})
	_ = v.RegisterValidation("password", func(fl validator.FieldLevel) bool {
		l := len(fl.Field().String())
		return l >= 8 && l <= 72
	})
	_ = v.RegisterValidation("capacity", func(fl validator.FieldLevel) bool {
		return fl.Field().Int() >= 0
	})
}
