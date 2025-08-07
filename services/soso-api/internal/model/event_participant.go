package model

import "time"

// -------------------------
// ENUM 型
// -------------------------

// status 列に対応
type Status string

const (
	Registered Status = "registered"
	Cancelled  Status = "cancelled"
)

// type 列に対応
type Type string

const (
	Participants Type = "participants"
	PickUp       Type = "pick_up"
	DropOff      Type = "drop_off"
)

// -------------------------
// テーブル対応モデル
// -------------------------

type EventParticipant struct {
	EventID      string    `db:"event_id"      json:"eventId"`
	UserID       string    `db:"user_id"       json:"userId"`
	Status       Status    `db:"status"        json:"status"`
	Type         Type      `db:"type"          json:"type"`
	RegisteredAt time.Time `db:"registered_at" json:"registeredAt"`
}
