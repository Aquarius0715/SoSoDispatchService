package repository

import (
	"context"
	"database/sql"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func Open(dsn string, maxOpen, maxIdle int, maxLife time.Duration) (*sql.DB, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, err
	}

	db.SetMaxOpenConns(maxOpen)
	db.SetMaxIdleConns(maxIdle)
	db.SetConnMaxLifetime(maxLife)
	return db, nil
}

func MustOpen(dsn string, maxOpen, maxIdle int, maxLife time.Duration) *sql.DB {
	db, err := Open(dsn, maxOpen, maxIdle, maxLife)
	if err != nil {
		panic(err)
	}
	return db
}
