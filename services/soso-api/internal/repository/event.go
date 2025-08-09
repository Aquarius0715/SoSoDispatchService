package repository

import (
	"context"
	"database/sql"
	"errors"

	"soso/internal/model"
)

type EventRepository struct {
	DB *sql.DB
}

func NewEventRepository(db *sql.DB) *EventRepository {
	return &EventRepository{DB: db}
}

/* ----------------------------------------------------------------
   Create
   ---------------------------------------------------------------- */

func (r *EventRepository) Create(ctx context.Context, e *model.Event) error {
	_, err := r.DB.ExecContext(ctx, `
		INSERT INTO events (
			id,
			calender_id,
			creator_id,
			title,
			description,
			start_time,
			end_time,
			origin_location,
			destination_location,
			seats_required_go,
			seats_required_return
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, e.ID, e.CalenderID, e.CreatorID, e.Title, e.Description,
		e.StartTime, e.EndTime, e.OriginLocation, e.DestinationLocation,
		e.SeatsRequiredGo, e.SeatsRequiredReturn)
	return err
}

/* ----------------------------------------------------------------
   List by Calender
   ---------------------------------------------------------------- */

func (r *EventRepository) FindEventsByCalenderId(ctx context.Context, calenderID string) ([]*model.Event, error) {
	rows, err := r.DB.QueryContext(ctx, `
		SELECT
			id,
			calender_id,
			creator_id,
			title,
			description,
			start_time,
			end_time,
			origin_location,
			destination_location,
			seats_required_go,
			seats_required_return,
			created_at,
			updated_at
		FROM events
		WHERE calender_id = ?
	`, calenderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*model.Event
	for rows.Next() {
		var ev model.Event
		var desc, origin, dest sql.NullString

		if err := rows.Scan(
			&ev.ID,
			&ev.CalenderID,
			&ev.CreatorID,
			&ev.Title,
			&desc,
			&ev.StartTime,
			&ev.EndTime,
			&origin,
			&dest,
			&ev.SeatsRequiredGo,
			&ev.SeatsRequiredReturn,
			&ev.CreatedAt,
			&ev.UpdatedAt,
		); err != nil {
			return nil, err
		}

		ev.Description = desc.String
		ev.OriginLocation = origin.String
		ev.DestinationLocation = dest.String

		list = append(list, &ev)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

/* ----------------------------------------------------------------
   Find by ID
   ---------------------------------------------------------------- */

func (r *EventRepository) FindById(ctx context.Context, eventID string) (*model.Event, error) {
	row := r.DB.QueryRowContext(ctx, `
		SELECT
			id,
			calender_id,
			creator_id,
			title,
			description,
			start_time,
			end_time,
			origin_location,
			destination_location,
			seats_required_go,
			seats_required_return,
			created_at,
			updated_at
		FROM events
		WHERE id = ?
		LIMIT 1
	`, eventID)

	var ev model.Event
	var desc, origin, dest sql.NullString
	if err := row.Scan(
		&ev.ID,
		&ev.CalenderID,
		&ev.CreatorID,
		&ev.Title,
		&desc,
		&ev.StartTime,
		&ev.EndTime,
		&origin,
		&dest,
		&ev.SeatsRequiredGo,
		&ev.SeatsRequiredReturn,
		&ev.CreatedAt,
		&ev.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	ev.Description = desc.String
	ev.OriginLocation = origin.String
	ev.DestinationLocation = dest.String

	return &ev, nil
}
