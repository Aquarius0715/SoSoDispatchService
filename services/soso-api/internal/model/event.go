package model

import "time"

// Event corresponds to the `events` table.
type Event struct {
	ID                  string    `db:"id"`
	CalenderID          string    `db:"calender_id"`
	CreatorID           string    `db:"creator_id"`
	Title               string    `db:"title"`
	Description         string    `db:"description"` // NULL 可
	StartTime           time.Time `db:"start_time"`
	EndTime             time.Time `db:"end_time"`
	OriginLocation      string    `db:"origin_location"`      // NULL 可
	DestinationLocation string    `db:"destination_location"` // NULL 可
	SeatsRequiredGo     int       `db:"seats_required_go"`
	SeatsRequiredReturn int       `db:"seats_required_return"`
	CreatedAt           time.Time `db:"created_at"`
	UpdatedAt           time.Time `db:"updated_at"`
}
