package model

import "time"

type Role string

const (
	ADMIN  Role = "admin"
	MEMBER Role = "member"
)

type CalenderMembership struct {
	CalenderID string `db:"calender_id"`
	UserID     string `db:"user_id"`
	Role       Role   `db:"role"`
	SoSoPoint  int    `db:"soso_point"`
	JoinedAt   time.Time
}
