package model

import "time"

// SoSoPointHistory corresponds to `soso_point_histories`.
type SoSoPointHistory struct {
	ID         int64     `db:"id"`
	CalenderID string    `db:"calender_id"`
	UserID     string    `db:"user_id"`
	ChangedAt  time.Time `db:"changed_at"`
	ChangedBy  *string   `db:"changed_by"` // NULL = system
	EventID    *string   `db:"event_id"`
	OldPoint   int       `db:"old_point"`
	NewPoint   int       `db:"new_point"`
	PointDelta int       `db:"point_delta"`
	Reason     string    `db:"reason"`
}
