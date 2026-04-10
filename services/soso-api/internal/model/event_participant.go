package model

import "time"

type EventParticipant struct {
	EventID            string    `db:"event_id"             json:"eventId"`
	UserID             string    `db:"user_id"              json:"userId"`
	ParticipantStatus  bool      `db:"participant_status"   json:"participantStatus"`
	GoDriverStatus     bool      `db:"go_driver_status"     json:"goDriverStatus"`
	ReturnDriverStatus bool      `db:"return_driver_status" json:"returnDriverStatus"`
	GoRiderStatus      bool      `db:"go_rider_status"      json:"goRiderStatus"`
	ReturnRiderStatus  bool      `db:"return_rider_status"  json:"returnRiderStatus"`
	CreatedAt          time.Time `db:"created_at"           json:"createdAt"`
	UpdatedAt          time.Time `db:"updated_at"           json:"updatedAt"`
}
