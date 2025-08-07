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
