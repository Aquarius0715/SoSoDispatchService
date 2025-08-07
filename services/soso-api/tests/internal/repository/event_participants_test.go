package repository_test

import (
	"context"
	"testing"
	"time"

	"soso/internal/model"
	"soso/internal/repository"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
)

// モック付きリポジトリを返すヘルパ
func newEventParticipantRepoMock(t *testing.T) (*repository.EventParticipantRepository, sqlmock.Sqlmock, func()) {
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherRegexp))
	assert.NoError(t, err)
	return repository.NewEventParticipantRepository(db), mock, func() { _ = db.Close() }
}

// -------------------------
// 1. BulkInsert 正常系
// -------------------------
func TestEventParticipantRepository_BulkInsert_OK(t *testing.T) {
	repo, mock, closeFn := newEventParticipantRepoMock(t)
	defer closeFn()

	// テストデータを 2 件用意
	ts := time.Date(2025, 8, 8, 10, 0, 0, 0, time.UTC)
	in := []model.EventParticipant{
		{
			EventID:      "ev1",
			UserID:       "u1",
			Status:       model.Registered,
			Type:         model.Participants,
			RegisteredAt: ts,
		},
		{
			EventID:      "ev1",
			UserID:       "u2",
			Status:       model.Registered,
			Type:         model.PickUp,
			RegisteredAt: ts,
		},
	}

	// 期待されるトランザクションの流れ
	mock.ExpectBegin()
	mock.
		ExpectExec(`INSERT INTO event_participants`).
		WithArgs(
			in[0].EventID, in[0].UserID, string(in[0].Status), string(in[0].Type), sqlmock.AnyArg(),
			in[1].EventID, in[1].UserID, string(in[1].Status), string(in[1].Type), sqlmock.AnyArg(),
		).
		WillReturnResult(sqlmock.NewResult(1, int64(len(in))))
	mock.ExpectCommit()

	err := repo.BulkInsert(context.Background(), in)
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// -------------------------
// 2. BulkInsert 空スライス
// -------------------------
func TestEventParticipantRepository_BulkInsert_Empty(t *testing.T) {
	repo, mock, closeFn := newEventParticipantRepoMock(t)
	defer closeFn()

	err := repo.BulkInsert(context.Background(), nil) // or []model.EventParticipant{}
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet()) // 何も実行されないことを確認
}

// -------------------------
// 3. BulkInsert 失敗 → Rollback
// -------------------------
func TestEventParticipantRepository_BulkInsert_Error(t *testing.T) {
	repo, mock, closeFn := newEventParticipantRepoMock(t)
	defer closeFn()

	in := []model.EventParticipant{
		{
			EventID: "ev1", UserID: "u1",
			Status: model.Registered, Type: model.Participants,
		},
	}

	mock.ExpectBegin()
	mock.
		ExpectExec(`INSERT INTO event_participants`).
		WithArgs(
			in[0].EventID, in[0].UserID, string(in[0].Status), string(in[0].Type), sqlmock.AnyArg(),
		).
		WillReturnError(assert.AnError)
	mock.ExpectRollback()

	err := repo.BulkInsert(context.Background(), in)
	assert.Error(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}
