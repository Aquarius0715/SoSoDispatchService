package repository

import (
	"context"
	"database/sql"
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
		// panic や中途 return に備えた保険
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		}
	}()

	const cols = "(event_id, user_id, status, type, registered_at)"
	var (
		valuePlaceholders []string
		args              []interface{}
	)

	for _, ep := range participants {
		valuePlaceholders = append(valuePlaceholders, "(?, ?, ?, ?, ?)")
		args = append(args,
			ep.EventID,
			ep.UserID,
			string(ep.Status), // ENUM は string として扱う
			string(ep.Type),
			ep.RegisteredAt,
		)
	}

	query := fmt.Sprintf(`
		INSERT INTO event_participants %s VALUES %s
	`, cols, strings.Join(valuePlaceholders, ","))

	if _, err := tx.ExecContext(ctx, query, args...); err != nil {
		_ = tx.Rollback()
		return fmt.Errorf("exec bulk insert: %w", err)
	}
	return tx.Commit()
}

func (r *EventParticipantRepository) FindByEventIDAndType(
	ctx context.Context,
	eventID string,
	pt model.Type,
) ([]*model.EventParticipant, error) {

	const q = `
		SELECT
			event_id,
			user_id,
			status,
			type,
			registered_at
		FROM event_participants
		WHERE event_id = ? AND type = ?
	`

	rows, err := r.DB.QueryContext(ctx, q, eventID, string(pt))
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
			&ep.Status,
			&ep.Type,
			&ep.RegisteredAt,
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

/* 参加者とユーザー情報をまとめた DTO */
type ParticipantInfo struct {
	UserName string
	Capacity int
	Type     model.Type
}

// FetchUserInfos returns all participants of an event
// together with their username and capacity.
func (r *EventParticipantRepository) FetchUserInfos(
	ctx context.Context,
	eventID string,
) ([]ParticipantInfo, error) {

	const q = `
		SELECT u.username, u.capacity, ep.type
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
		if err := rows.Scan(&p.UserName, &p.Capacity, &p.Type); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, rows.Err()
}
