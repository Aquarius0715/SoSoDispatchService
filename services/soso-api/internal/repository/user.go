// internal/repository/user_repository.go
package repository

import (
	"context"
	"database/sql"
	"errors"

	"soso/internal/model"
)

type UserRepository struct {
	DB *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{DB: db}
}

func (r *UserRepository) Create(ctx context.Context, u *model.User) error {
	_, err := r.DB.ExecContext(ctx, `
		INSERT INTO users (
			id, username, mail_address, password_hash, has_car, capacity
		) VALUES (?,?,?,?,?,?)
	`, u.ID, u.Username, u.MailAddress, u.PasswordHash, u.HasCar, u.Capacity)
	return err
}

func (r *UserRepository) FindByUsername(ctx context.Context, name string) (*model.User, error) {
	row := r.DB.QueryRowContext(ctx, `
		SELECT
			id,
			username,
			mail_address,
			password_hash,
			has_car,
			capacity,
			created_at,
			updated_at
		FROM users
		WHERE username = ?
		LIMIT 1
	`, name)

	var u model.User
	if err := row.Scan(
		&u.ID, &u.Username, &u.MailAddress, &u.PasswordHash,
		&u.HasCar, &u.Capacity,
		&u.CreatedAt, &u.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) FindByMailAddress(ctx context.Context, mailAddress string) (*model.User, error) {
	row := r.DB.QueryRowContext(ctx, `
		SELECT
			id,
			username,
			mail_address,
			password_hash,
			has_car,
			capacity,
			created_at,
			updated_at
		FROM users
		WHERE mail_address = ?
		LIMIT 1
	`, mailAddress)

	var u model.User
	if err := row.Scan(
		&u.ID, &u.Username, &u.MailAddress, &u.PasswordHash,
		&u.HasCar, &u.Capacity,
		&u.CreatedAt, &u.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*model.User, error) {
	row := r.DB.QueryRowContext(ctx, `
		SELECT
			id,
			username,
			mail_address,
			password_hash,
			has_car,
			capacity,
			created_at,
			updated_at
		FROM users
		WHERE id = ?
		LIMIT 1
	`, id)

	var u model.User
	if err := row.Scan(
		&u.ID, &u.Username, &u.MailAddress, &u.PasswordHash,
		&u.HasCar, &u.Capacity,
		&u.CreatedAt, &u.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

//新しくに追加

func (r *UserRepository) Update(ctx context.Context, u *model.User) error {
	// データベースに対してUPDATE文を実行する
	_, err := r.DB.ExecContext(ctx, `
		UPDATE users
		SET
			username = ?,
			mail_address = ?,
			has_car = ?,
			capacity = ?
		WHERE
			id = ?
	`, u.Username, u.MailAddress, u.HasCar, u.Capacity, u.ID) // WHERE句のidを最後に追加

	// エラーがあればそれを返す
	return err
}