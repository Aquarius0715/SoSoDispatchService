package validator

import (
	"soso/internal/model"
	"time"

	"github.com/go-playground/validator/v10"
)

// RegisterEvent sets up struct-level validation rules for model.Event.
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

	/* ---------- Title ---------- */
	if l := len(ev.Title); l == 0 || l > 128 {
		sl.ReportError(ev.Title, "Title", "title", "titlelen", "1-128")
	}

	/* ---------- SeatsRequiredGo / SeatsRequiredReturn ---------- */
	if ev.SeatsRequiredGo < 0 {
		sl.ReportError(ev.SeatsRequiredGo, "SeatsRequiredGo", "seats_required_go", "nonneg", ">=0")
	}
	if ev.SeatsRequiredReturn < 0 {
		sl.ReportError(ev.SeatsRequiredReturn, "SeatsRequiredReturn", "seats_required_return", "nonneg", ">=0")
	}
	// いずれも 0 の場合は “相乗りしない” 意味で許容する。
	if ev.SeatsRequiredGo == 0 && ev.SeatsRequiredReturn == 0 {
		sl.ReportError(ev.SeatsRequiredGo, "SeatsRequiredGo", "seats_required_go", "bothzero", "")
	}

	/* ---------- Start / End 時刻 ---------- */
	if ev.StartTime.IsZero() {
		sl.ReportError(ev.StartTime, "StartTime", "start_time", "required", "")
	}
	if ev.EndTime.IsZero() {
		sl.ReportError(ev.EndTime, "EndTime", "end_time", "required", "")
	}
	if !ev.StartTime.IsZero() && !ev.EndTime.IsZero() && !ev.EndTime.After(ev.StartTime) {
		sl.ReportError(ev.EndTime, "EndTime", "end_time", "endafterstart", "")
	}

	/* ---------- 文字長制限 ---------- */
	if len(ev.OriginLocation) > 255 {
		sl.ReportError(ev.OriginLocation, "OriginLocation", "origin_location", "max255", "")
	}
	if len(ev.DestinationLocation) > 255 {
		sl.ReportError(ev.DestinationLocation, "DestinationLocation", "destination_location", "max255", "")
	}

	/* ---------- StartTime は未来 ---------- */
	if !ev.StartTime.IsZero() && time.Now().After(ev.StartTime) {
		sl.ReportError(ev.StartTime, "StartTime", "start_time", "future", "")
	}
}
