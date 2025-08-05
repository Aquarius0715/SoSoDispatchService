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

func (r *CalenderMembershipRepository) FindMembersByCalenderID(
	ctx context.Context,
	calenderID string,
) ([]*model.CalenderMember, error) {

	rows, err := r.DB.QueryContext(ctx, `
		SELECT
			cm.user_id,
			u.username,
			u.has_car,
			u.capacity,
			cm.soso_point
		FROM calender_memberships AS cm
		INNER JOIN users AS u ON u.id = cm.user_id
		WHERE cm.calender_id = ?
	`, calenderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	members := make([]*model.CalenderMember, 0)
	for rows.Next() {
		var m model.CalenderMember
		if err := rows.Scan(
			&m.UserID,
			&m.Username,
			&m.HasCar,
			&m.Capacity,
			&m.SoSoPoint,
		); err != nil {
			return nil, err
		}
		members = append(members, &m)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return members, nil
}

func (r *CalenderMembershipRepository) FindByCalenderID(ctx context.Context, calenderID string) (*model.CalenderMembership, error) {
	row := r.DB.QueryRowContext(ctx, `
		SELECT
			*
		FROM calender_memberships
		WHERE calender_id = ?
		LIMIT 1
	`, calenderID)

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
