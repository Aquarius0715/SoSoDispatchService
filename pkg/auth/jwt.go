// pkg/auth/jwt.go
package auth

import (
	"crypto/sha256"
	"encoding/hex"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims はアクセストークン用の標準クレームだけ使う薄いラッパー。
// 必要になれば独自フィールドをここに足してください。
type Claims struct {
	jwt.RegisteredClaims
}

// GenerateAccessToken は uid を Subject に入れた JWT を発行します。
// ttl は分指定でも time.Duration でも扱いやすいように Duration で受けます。
func GenerateAccessToken(uid string, key string, ttlMin int) (string, time.Time, error) {
	exp := time.Now().Add(time.Duration(ttlMin) * time.Minute)
	claims := &Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   uid,
			ExpiresAt: jwt.NewNumericDate(exp),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := t.SignedString([]byte(key))
	return signed, exp, err
}

// ParseAndValidate は与えられたトークン文字列を検証し、Claims を返します。
// echo-jwt を使わない場面（テストやCLI）用のヘルパー。
func ParseAndValidate(tokenStr string, key string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (any, error) {
		return []byte(key), nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	return token.Claims.(*Claims), nil
}

// HashToken はリフレッシュトークンのハッシュ化に使います。
func HashToken(tok string) string {
	sum := sha256.Sum256([]byte(tok))
	return hex.EncodeToString(sum[:])
}
