// internal/validator/event.go
package validator

import (
	"soso/internal/model"
	"time"

	"github.com/go-playground/validator/v10"
)

// RegisterEvent sets up struct-level validation rules for model.Event.
//
// 利用例:
//
//	v := validator.New()
//	validator.RegisterEvent(v)
//	err := v.Struct(event)
func RegisterEvent(v *validator.Validate) {
	v.RegisterStructValidation(eventStructValidation, model.Event{})
}

// eventStructValidation implements cross-field checks for an Event.
func eventStructValidation(sl validator.StructLevel) {
	ev := sl.Current().Interface().(model.Event)

	// --- Title: 1–128 文字必須 ---
	if l := len(ev.Title); l == 0 || l > 128 {
		sl.ReportError(ev.Title, "Title", "title", "titlelen", "1~128")
	}

	// --- SeatsRequired: 1 以上 ---
	if ev.SeatsRequired < 1 {
		sl.ReportError(ev.SeatsRequired, "SeatsRequired", "seats_required", "seatmin", ">=1")
	}

	// --- StartTime / EndTime: EndTime は StartTime より後 ---
	if ev.StartTime.IsZero() {
		sl.ReportError(ev.StartTime, "StartTime", "start_time", "required", "")
	}
	if ev.EndTime.IsZero() {
		sl.ReportError(ev.EndTime, "EndTime", "end_time", "required", "")
	}
	if !ev.EndTime.After(ev.StartTime) {
		sl.ReportError(ev.EndTime, "EndTime", "end_time", "endafterstart", "")
	}

	// --- OriginLocation / DestinationLocation: 最大 255 文字 ---
	if len(ev.OriginLocation) > 255 {
		sl.ReportError(ev.OriginLocation, "OriginLocation", "origin_location", "max255", "")
	}
	if len(ev.DestinationLocation) > 255 {
		sl.ReportError(ev.DestinationLocation, "DestinationLocation", "destination_location", "max255", "")
	}

	// --- 任意で: StartTime は未来の日付であること ---
	if time.Now().After(ev.StartTime) {
		sl.ReportError(ev.StartTime, "StartTime", "start_time", "future", "")
	}
}
