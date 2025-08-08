package repository

import (
	"context"
	"database/sql"
	"fmt"
)

type SosoPointRepository struct {
	DB *sql.DB
}

func NewSosoPointRepository(db *sql.DB) *SosoPointRepository {
	return &SosoPointRepository{DB: db}
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
