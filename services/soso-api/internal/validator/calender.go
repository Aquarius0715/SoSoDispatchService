package validator

import "github.com/go-playground/validator/v10"

func ResisterCalender(v *validator.Validate) {
	_ = v.RegisterValidation("name", func(fl validator.FieldLevel) bool {
		l := len(fl.Field().String())
		return l < 128
	})
	_ = v.RegisterValidation("description", func(fl validator.FieldLevel) bool {
		l := len(fl.Field().String())
		return l < 1024
	})
}
