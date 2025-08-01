// internal/repository/refresh_token_repository.go
package repository

import (
	"context"
	"database/sql"
	"time"

	"soso/internal/model"
)

type RefreshTokenRepository struct {
	DB *sql.DB
}

func NewRefreshTokenRepository(db *sql.DB) *RefreshTokenRepository {
	return &RefreshTokenRepository{DB: db}
}

func (r *RefreshTokenRepository) Insert(ctx context.Context, rt *model.RefreshToken) error {
	_, err := r.DB.ExecContext(ctx, `
		INSERT INTO refresh_tokens (
			id, user_id, token_hash, expires_at
		) VALUES (?,?,?,?)
	`, rt.ID, rt.UserID, rt.TokenHash, rt.ExpiresAt)
	return err
}

func (r *RefreshTokenRepository) FindActiveByHash(ctx context.Context, hash string) (*model.RefreshToken, error) {
	row := r.DB.QueryRowContext(ctx, `
		SELECT
			id,
			user_id,
			token_hash,
			expires_at,
			revoked_at,
			created_at
		FROM refresh_tokens
		WHERE token_hash = ?
		  AND revoked_at IS NULL
		  AND expires_at > NOW()
		LIMIT 1
	`, hash)

	var rt model.RefreshToken
	if err := row.Scan(
		&rt.ID, &rt.UserID, &rt.TokenHash,
		&rt.ExpiresAt, &rt.RevokedAt, &rt.CreatedAt,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &rt, nil
}

func (r *RefreshTokenRepository) Revoke(ctx context.Context, id string) error {
	_, err := r.DB.ExecContext(ctx, `
		UPDATE refresh_tokens
		   SET revoked_at = ?
		 WHERE id = ?
		   AND revoked_at IS NULL
	`, time.Now(), id)
	return err
}
