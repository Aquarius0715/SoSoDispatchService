package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"soso/internal/model"
)

type EventParticipantRepository struct {
	DB *sql.DB
}

func NewEventParticipantRepository(db *sql.DB) *EventParticipantRepository {
	return &EventParticipantRepository{DB: db}
}

// BulkInsert inserts the given participants in a single SQL statement.
//
//   - 空スライスは何もしないで nil を返す。
//   - トランザクションを張り、エラー時はロールバック。
//   - VALUES 句を動的生成してバルク INSERT とすることで性能を確保。
func (r *EventParticipantRepository) BulkInsert(
	ctx context.Context,
	participants []model.EventParticipant,
) error {
	if len(participants) == 0 {
		return nil
	}

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

	const cols = "(event_id, user_id, participant_status, go_driver_status, return_driver_status, go_rider_status, return_rider_status)"
	var (
		valuePlaceholders []string
		args              []interface{}
	)

	for _, ep := range participants {
		valuePlaceholders = append(valuePlaceholders, "(?, ?, ?, ?, ?, ?, ?)")
		args = append(args,
			ep.EventID,
			ep.UserID,
			ep.ParticipantStatus,
			ep.GoDriverStatus,
			ep.ReturnDriverStatus,
			ep.GoRiderStatus,
			ep.ReturnRiderStatus,
		)
	}

	query := fmt.Sprintf(`
		INSERT INTO event_participants %s VALUES %s
	`, cols, strings.Join(valuePlaceholders, ","))

	if _, err := tx.ExecContext(ctx, query, args...); err != nil {
		_ = tx.Rollback()
		if isDuplicateError(err) {
			return ErrDuplicateEntry
		}
		return fmt.Errorf("exec bulk insert: %w", err)
	}
	return tx.Commit()
}

// sentinel error for duplicate (unique constraint) insert
var ErrDuplicateEntry = errors.New("duplicate entry")

// isDuplicateError performs a lightweight check for DB unique-violation
// messages. It uses string matching to remain DB-driver-agnostic.
func isDuplicateError(err error) bool {
	if err == nil {
		return false
	}
	l := strings.ToLower(err.Error())
	if strings.Contains(l, "duplicate") ||
		strings.Contains(l, "unique constraint") ||
		strings.Contains(l, "unique_violation") ||
		strings.Contains(l, "unique constraint failed") ||
		strings.Contains(l, "duplicate key value") {
		return true
	}
	return false
}

// Upsert inserts a new participant or updates the boolean status columns
// if the (event_id, user_id) row already exists.
func (r *EventParticipantRepository) Upsert(
	ctx context.Context,
	ep model.EventParticipant,
) error {
	const q = `
		INSERT INTO event_participants
			(event_id, user_id, participant_status,
	go_driver_status, return_driver_status, go_rider_status,
	return_rider_status)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			participant_status   = participant_status   OR VALUES(participant_status),
			go_driver_status     = go_driver_status     OR VALUES(go_driver_status),
			return_driver_status = return_driver_status OR VALUES(return_driver_status),
			go_rider_status      = go_rider_status      OR VALUES(go_rider_status),
			return_rider_status  = return_rider_status  OR VALUES(return_rider_status)
	`

	_, err := r.DB.ExecContext(ctx, q,
		ep.EventID,            // 1つ目の ?
		ep.UserID,             // 2つ目の ?
		ep.ParticipantStatus,  // 3つ目の ?
		ep.GoDriverStatus,     // 4つ目の ?
		ep.ReturnDriverStatus, // 5つ目の ?
		ep.GoRiderStatus,      // 6つ目の ?
		ep.ReturnRiderStatus,  // 7つ目の ?
	)

	return err
}

// FindByEventID returns all participants for an event.
func (r *EventParticipantRepository) FindByEventID(
	ctx context.Context,
	eventID string,
) ([]*model.EventParticipant, error) {

	const q = `
		SELECT
			event_id, user_id,
			participant_status, go_driver_status, return_driver_status,
			go_rider_status, return_rider_status,
			created_at, updated_at
		FROM event_participants
		WHERE event_id = ?
	`

	rows, err := r.DB.QueryContext(ctx, q, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*model.EventParticipant
	for rows.Next() {
		var ep model.EventParticipant
		if err := rows.Scan(
			&ep.EventID,
			&ep.UserID,
			&ep.ParticipantStatus,
			&ep.GoDriverStatus,
			&ep.ReturnDriverStatus,
			&ep.GoRiderStatus,
			&ep.ReturnRiderStatus,
			&ep.CreatedAt,
			&ep.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, &ep)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

// ExistsByEventAndUser checks if a participant record exists for the given event and user.
func (r *EventParticipantRepository) ExistsByEventAndUser(
	ctx context.Context,
	eventID string,
	userID string,
) (bool, error) {
	const q = `
		SELECT COUNT(*)
		FROM event_participants
		WHERE event_id = ? AND user_id = ?
	`

	var count int
	err := r.DB.QueryRowContext(ctx, q, eventID, userID).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("check participant existence: %w", err)
	}

	return count > 0, nil
}

/* 参加者とユーザー情報をまとめた DTO */
type ParticipantInfo struct {
	UserID             string
	UserName           string
	Capacity           int
	ParticipantStatus  bool
	GoDriverStatus     bool
	ReturnDriverStatus bool
}

// FetchUserInfos returns all participants of an event
// together with their username, capacity, and driver statuses.
func (r *EventParticipantRepository) FetchUserInfos(
	ctx context.Context,
	eventID string,
) ([]ParticipantInfo, error) {

	const q = `
		SELECT u.id, u.username, u.capacity, ep.participant_status, ep.go_driver_status, ep.return_driver_status
		FROM event_participants AS ep
		INNER JOIN users AS u ON u.id = ep.user_id
		WHERE ep.event_id = ?`

	rows, err := r.DB.QueryContext(ctx, q, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []ParticipantInfo
	for rows.Next() {
		var p ParticipantInfo
		if err := rows.Scan(&p.UserID, &p.UserName, &p.Capacity, &p.ParticipantStatus, &p.GoDriverStatus, &p.ReturnDriverStatus); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, rows.Err()
}

// -------------------------
// メンバー一覧 DTO
// -------------------------

type MemberInfo struct {
	UserID    string
	UserName  string
	SoSoPoint int
}

// FetchMemberInfos returns all event members
// with their SoSo points in the same calendar.
func (r *EventParticipantRepository) FetchMemberInfos(
	ctx context.Context,
	eventID string,
) ([]MemberInfo, error) {

	const q = `
		SELECT u.id, u.username, cm.soso_point
		FROM event_participants AS ep
		INNER JOIN events   AS e  ON e.id = ep.event_id
		INNER JOIN calender_memberships AS cm
		     ON cm.calender_id = e.calender_id AND cm.user_id = ep.user_id
		INNER JOIN users AS u ON u.id = ep.user_id
		WHERE ep.event_id = ?
	`

	rows, err := r.DB.QueryContext(ctx, q, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []MemberInfo
	for rows.Next() {
		var m MemberInfo
		if err := rows.Scan(&m.UserID, &m.UserName, &m.SoSoPoint); err != nil {
			return nil, err
		}
		list = append(list, m)
	}
	return list, rows.Err()
}
