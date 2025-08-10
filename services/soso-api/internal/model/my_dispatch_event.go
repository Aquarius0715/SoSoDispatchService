package model

import "time"

type TransportType string

const (
	TransportTypeGo     TransportType = "go"
	TransportTypeReturn TransportType = "return"
)

type MyTransportEvent struct {
	EventID       string        `json:"eventId"`
	UserID        string        `json:"userId"`
	Type          TransportType `json:"type"` // "go" or "return"
	CalenderName  string        `json:"calenderName"`
	EventTitle    string        `json:"eventTitle"`
	StartTime     time.Time     `json:"startTime"`
	SeatsRequired int           `json:"seatsRequired"`
}
