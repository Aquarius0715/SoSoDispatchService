package model

import "time"

// Event corresponds to the `events` table.
type Event struct {
	ID                  string    `db:"id"`
	CalenderId          string    `db:"calender_id"`
	CreatorId           string    `db:"creator_id"`
	Title               string    `db:"title"`
	Description         string    `db:"description"`
	StartTime           time.Time `db:"start_time"`
	EndTime             time.Time `db:"end_time"`
	OriginLocation      string    `db:"origin_location"`
	DestinationLocation string    `db:"destination_location"`
	SeatsRequired       int       `db:"seats_required"`
	CreatedAt           time.Time `db:"created_at"`
	UpdatedAt           time.Time `db:"updated_at"`
}
