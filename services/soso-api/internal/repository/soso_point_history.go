package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type SosoPointRepository struct {
	DB *sql.DB
}

func NewSosoPointRepository(db *sql.DB) *SosoPointRepository {
	return &SosoPointRepository{DB: db}
}

type SosoPointHistory struct {
	ID         int64
	CalenderID string
	UserID     string
	ChangedAt  time.Time
	ChangedBy  *string
	EventID    *string
	OldPoint   int
	NewPoint   int
	PointDelta int
	Reason     string
}

// UpdatePointWithLog updates `calender_memberships.soso_point` and
// inserts a history record atomically.
func (r *SosoPointRepository) UpdatePointWithLog(
	ctx context.Context,
	calID, userID string,
	newPoint int,
	changedBy *string,
	eventID *string,
	reason string,
) error {

	tx, err := r.DB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		}
	}()

	// 1. 現在値取得（SELECT ... FOR UPDATE でロック）
	var oldPoint int
	const sel = `
		SELECT soso_point
		FROM calender_memberships
		WHERE calender_id = ? AND user_id = ?
		FOR UPDATE`
	if err := tx.QueryRowContext(ctx, sel, calID, userID).Scan(&oldPoint); err != nil {
		_ = tx.Rollback()
		return fmt.Errorf("select old point: %w", err)
	}

	// 2. 更新
	const upd = `
		UPDATE calender_memberships
		SET soso_point = ?
		WHERE calender_id = ? AND user_id = ?`
	if _, err := tx.ExecContext(ctx, upd, newPoint, calID, userID); err != nil {
		_ = tx.Rollback()
		return fmt.Errorf("update point: %w", err)
	}

	// 3. 履歴 INSERT
	const ins = `
		INSERT INTO soso_point_histories (
			calender_id, user_id, changed_by, event_id,
			old_point, new_point, point_delta, reason
		) VALUES (?,?,?,?,?,?,?,?)`
	if _, err := tx.ExecContext(
		ctx, ins,
		calID, userID, changedBy, eventID,
		oldPoint, newPoint, newPoint-oldPoint, reason,
	); err != nil {
		_ = tx.Rollback()
		return fmt.Errorf("insert history: %w", err)
	}

	return tx.Commit()
}

const (
	SQLSosoPointHistoryFindByEventID = `
SELECT
  id, calender_id, user_id, changed_at, changed_by, event_id,
  old_point, new_point, point_delta, reason
FROM soso_point_histories
WHERE event_id = ?
ORDER BY changed_at DESC, id DESC
`

	SQLSosoPointHistoryFindByCalenderID = `
SELECT
  id, calender_id, user_id, changed_at, changed_by, event_id,
  old_point, new_point, point_delta, reason
FROM soso_point_histories
WHERE calender_id = ?
ORDER BY changed_at DESC, id DESC
`
)

// FindHistoriesByEventID は event_id に紐づくポイント履歴を新しい順で返す
func (r *SosoPointRepository) FindHistoriesByEventID(
	ctx context.Context, eventID string,
) ([]SosoPointHistory, error) {

	rows, err := r.DB.QueryContext(ctx, SQLSosoPointHistoryFindByEventID, eventID)
	if err != nil {
		return nil, fmt.Errorf("query histories by event_id: %w", err)
	}
	defer rows.Close()

	var list []SosoPointHistory
	for rows.Next() {
		var (
			h                      SosoPointHistory
			changedByNS, eventIDNS sql.NullString
			reasonNS               sql.NullString
		)
		if err := rows.Scan(
			&h.ID, &h.CalenderID, &h.UserID, &h.ChangedAt,
			&changedByNS, &eventIDNS,
			&h.OldPoint, &h.NewPoint, &h.PointDelta, &reasonNS,
		); err != nil {
			return nil, fmt.Errorf("scan histories by event_id: %w", err)
		}
		if changedByNS.Valid {
			v := changedByNS.String
			h.ChangedBy = &v
		}
		if eventIDNS.Valid {
			v := eventIDNS.String
			h.EventID = &v
		}
		if reasonNS.Valid {
			h.Reason = reasonNS.String
		}
		list = append(list, h)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows err histories by event_id: %w", err)
	}
	return list, nil
}

// FindHistoriesByCalenderID は calender_id に紐づくポイント履歴を新しい順で返す
func (r *SosoPointRepository) FindHistoriesByCalenderID(
	ctx context.Context, calenderID string,
) ([]SosoPointHistory, error) {

	rows, err := r.DB.QueryContext(ctx, SQLSosoPointHistoryFindByCalenderID, calenderID)
	if err != nil {
		return nil, fmt.Errorf("query histories by calender_id: %w", err)
	}
	defer rows.Close()

	var list []SosoPointHistory
	for rows.Next() {
		var (
			h                      SosoPointHistory
			changedByNS, eventIDNS sql.NullString
			reasonNS               sql.NullString
		)
		if err := rows.Scan(
			&h.ID, &h.CalenderID, &h.UserID, &h.ChangedAt,
			&changedByNS, &eventIDNS,
			&h.OldPoint, &h.NewPoint, &h.PointDelta, &reasonNS,
		); err != nil {
			return nil, fmt.Errorf("scan histories by calender_id: %w", err)
		}
		if changedByNS.Valid {
			v := changedByNS.String
			h.ChangedBy = &v
		}
		if eventIDNS.Valid {
			v := eventIDNS.String
			h.EventID = &v
		}
		if reasonNS.Valid {
			h.Reason = reasonNS.String
		}
		list = append(list, h)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows err histories by calender_id: %w", err)
	}
	return list, nil
}
