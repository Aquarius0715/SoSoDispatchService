// internal/validator/team.go
package validator

import (
	"regexp"

	"github.com/go-playground/validator/v10"
)

func RegisterUser(v *validator.Validate) {
	_ = v.RegisterValidation("username", func(fl validator.FieldLevel) bool {
		// 日本語を含む「文字」 + 数字 + アンダースコア、3〜30文字
		return regexp.MustCompile(`^[\p{L}\p{N}_]{3,30}$`).MatchString(fl.Field().String())
	})
	_ = v.RegisterValidation("password", func(fl validator.FieldLevel) bool {
		l := len(fl.Field().String())
		return l >= 8 && l <= 72
	})
	_ = v.RegisterValidation("capacity", func(fl validator.FieldLevel) bool {
		return fl.Field().Int() >= 0
	})
	_ = v.RegisterValidation("mailAddress", func(fl validator.FieldLevel) bool {
		// 非常に基本的なメール形式の正規表現（完全ではありません）
		return regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`).MatchString(fl.Field().String())
	})
}
