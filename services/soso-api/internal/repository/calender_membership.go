package repository

import (
	"context"
	"database/sql"
	"errors"
	"soso/internal/model"
)

type CalenderMembershipRepository struct {
	DB *sql.DB
}

func NewCalenderMembershipRepository(db *sql.DB) *CalenderMembershipRepository {
	return &CalenderMembershipRepository{DB: db}
}

func (r *CalenderMembershipRepository) FindByCalenderIDAndUserID(ctx context.Context, calenderId string, userId string) (*model.CalenderMembership, error) {
	row := r.DB.QueryRowContext(ctx, `
		SELECT
			*
		FROM calender_memberships
		WHERE calender_id = ?
		AND user_id = ?
		LIMIT 1
	`, calenderId, userId)

	var cm model.CalenderMembership
	if err := row.Scan(
		&cm.CalenderID, &cm.UserID, &cm.Role, &cm.SoSoPoint, &cm.JoinedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &cm, nil
}

func (r *CalenderMembershipRepository) Create(ctx context.Context, cm *model.CalenderMembership) error {
	_, err := r.DB.ExecContext(ctx, `
		INSERT INTO calender_memberships (
			calender_id, user_id, role
		) VALUES (?, ?, ?)
	`, cm.CalenderID, cm.UserID, cm.Role)
	return err
}
