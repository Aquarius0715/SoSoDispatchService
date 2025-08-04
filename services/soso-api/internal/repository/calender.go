package repository

import (
	"context"
	"database/sql"
	"soso/internal/model"
)

type CalenderRepository struct {
	DB *sql.DB
}

func NewCalenderRepository(db *sql.DB) *CalenderRepository {
	return &CalenderRepository{DB: db}
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
