package model

import (
	"time"
)

type User struct {
	ID           string    `db:"id"`
	Username     string    `db:"username"`
	MailAddress  string    `db:"mail_address"`
	PasswordHash string    `db:"password_hash"`
	HasCar       bool      `db:"has_car"`
	Capacity     int       `db:"capacity"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}
