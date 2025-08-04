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

func (r *CalenderRepository) Create(ctx context.Context, c *model.Calender) error {
	_, err := r.DB.ExecContext(ctx, `
		INSERT INTO calenders (
			id, name, description, owner_id
		VALUES (?, ?, ?, ?, ?)
		)
	`, c.ID, c.Name, c.Description, c.OwnerId)
	return err
}
