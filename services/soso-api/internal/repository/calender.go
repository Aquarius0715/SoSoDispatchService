package repository

import (
	"context"
	"database/sql"
	"errors"
	"soso/internal/model"
)

type CalenderRepository struct {
	DB *sql.DB
}

func NewCalenderRepository(db *sql.DB) *CalenderRepository {
	return &CalenderRepository{DB: db}
}

func (r *CalenderRepository) FindCalendersByUserId(ctx context.Context, userID string) ([]*model.Calender, error) {
	rows, err := r.DB.QueryContext(ctx, `
		SELECT
			c.id	AS id,
			c.name	AS name,
			c.description AS description,
			c.owner_id AS owner_id
		FROM
			calender_memberships AS cm
			INNER JOIN calenders AS c
				ON c.id = cm.calender_id
		WHERE
			cm.user_id = ?
	`, userID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*model.Calender
	for rows.Next() {
		var cal model.Calender
		var desc sql.NullString
		if err := rows.Scan(
			&cal.ID, &cal.Name, &desc, &cal.OwnerId,
		); err != nil {
			return nil, err
		}
		cal.Description = desc.String
		list = append(list, &cal)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *CalenderRepository) FindByName(ctx context.Context, name string) (*model.Calender, error) {
	row := r.DB.QueryRowContext(ctx, `
		SELECT
			id,
			name,
			description,
			owner_id,
			created_at,
			updated_at
		FROM calenders
		WHERE name = ?
		LIMIT 1
	`, name)

	var c model.Calender
	if err := row.Scan(
		&c.ID, &c.Name, &c.Description, &c.OwnerId, &c.CreatedAt, &c.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &c, nil
}

func (r *CalenderRepository) FindById(ctx context.Context, id string) (*model.Calender, error) {
	row := r.DB.QueryRowContext(ctx, `
		SELECT
			id,
			name,
			description,
			owner_id,
			created_at,
			updated_at
		FROM calenders
		WHERE id = ?
		LIMIT 1
	`, id)

	var c model.Calender
	var desc sql.NullString
	if err := row.Scan(
		&c.ID,
		&c.Name,
		&desc,
		&c.OwnerId,
		&c.CreatedAt,
		&c.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	c.Description = desc.String
	return &c, nil
}

func (r *CalenderRepository) Create(ctx context.Context, c *model.Calender) error {
	_, err := r.DB.ExecContext(ctx, `
		INSERT INTO calenders (
			id, name, description, owner_id
		) VALUES (?, ?, ?, ?)
	`, c.ID, c.Name, c.Description, c.OwnerId)
	return err
}

func (r *CalenderRepository) CreateTx(ctx context.Context, tx *sql.Tx, c *model.Calender) error {
	_, err := tx.ExecContext(ctx, `
		INSERT INTO calenders (
			id, name, description, owner_id
		) VALUES (?, ?, ?, ?)
	`, c.ID, c.Name, c.Description, c.OwnerId)
	return err
}

func (r *CalenderRepository) FindMyTransportEvents(ctx context.Context, userID string) ([]*model.MyTransportEvent, error) {
	rows, err := r.DB.QueryContext(ctx, `
		SELECT
			e.id                             AS event_id,
			ep.user_id                       AS user_id,
			ep.type                          AS type,
			c.name                           AS calender_name,
			e.title                          AS event_title,
			e.start_time                     AS start_time,
			CASE
				WHEN ep.type = 'go'     THEN e.seats_required_go
				WHEN ep.type = 'return' THEN e.seats_required_return
				ELSE 0
			END                              AS seats_required
		FROM event_participants AS ep
		INNER JOIN events     AS e ON e.id = ep.event_id
		INNER JOIN calenders  AS c ON c.id = e.calender_id
		WHERE
			ep.user_id = ?
			AND ep.status = 'registered'
			AND ep.type IN ('go', 'return')
		ORDER BY e.start_time ASC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*model.MyTransportEvent
	for rows.Next() {
		var ev model.MyTransportEvent
		if err := rows.Scan(
			&ev.EventID,
			&ev.UserID,
			&ev.Type,
			&ev.CalenderName,
			&ev.EventTitle,
			&ev.StartTime,
			&ev.SeatsRequired,
		); err != nil {
			return nil, err
		}
		list = append(list, &ev)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}
