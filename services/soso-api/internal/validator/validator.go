// internal/validator/validator.go
package validator

import "github.com/go-playground/validator/v10"

type CustomValidator struct{ v *validator.Validate }

func New() *CustomValidator {
	v := validator.New()

	RegisterUser(v)

	return &CustomValidator{v: v}
}

func (cv *CustomValidator) Validate(i any) error { return cv.v.Struct(i) }
