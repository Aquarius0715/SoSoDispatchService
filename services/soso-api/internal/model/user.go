package model

import (
	"time"
)

type User struct {
	ID           string    `db:"id"`
	Username     string    `db:"username"`
	PasswordHash string    `db:"password_hash"`
	HasCar       bool      `db:"has_car"`
	Capacity     int       `db:"capacity"`
	SoSoPoints   int       `db:"soso_points"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}
