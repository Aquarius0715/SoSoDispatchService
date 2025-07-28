-- 1. users テーブル
CREATE TABLE `users` (
  `id`             VARCHAR(36)       NOT NULL,
  `username`       VARCHAR(64)       NOT NULL UNIQUE,
  `password_hash`  VARCHAR(255)      NOT NULL,
  `has_car`        TINYINT(1)        NOT NULL DEFAULT 0,
  `capacity`       INT               NOT NULL DEFAULT 0,
  `soso_points`    INT               NOT NULL DEFAULT 0,
  `created_at`     DATETIME(6)       NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`     DATETIME(6)       NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
);

-- 2. teams テーブル
CREATE TABLE `teams` (
  `id`             VARCHAR(36)       NOT NULL,
  `name`           VARCHAR(128)      NOT NULL,
  `description`    TEXT,
  `owner_id`       VARCHAR(36)       NOT NULL,
  `created_at`     DATETIME(6)       NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`     DATETIME(6)       NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_teams_owner` (`owner_id`),
  CONSTRAINT `fk_teams_owner`
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. team_memberships テーブル（role を ENUM 化）
CREATE TABLE `team_memberships` (
  `team_id`        VARCHAR(36)               NOT NULL,
  `user_id`        VARCHAR(36)               NOT NULL,
  `role`           ENUM('member','admin')    NOT NULL DEFAULT 'member',
  `joined_at`      DATETIME(6)               NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`team_id`,`user_id`),
  INDEX `idx_tm_user` (`user_id`),
  CONSTRAINT `fk_tm_team`
    FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_tm_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. reservations テーブル
CREATE TABLE `reservations` (
  `id`                   VARCHAR(36)       NOT NULL,
  `team_id`              VARCHAR(36)       NOT NULL,
  `creator_id`           VARCHAR(36)       NOT NULL,
  `title`                VARCHAR(128)      NOT NULL,
  `description`          TEXT,
  `start_time`           DATETIME(6)       NOT NULL,
  `end_time`             DATETIME(6)       NOT NULL,
  `origin_location`      VARCHAR(255),
  `destination_location` VARCHAR(255),
  `seats_required`       INT               NOT NULL DEFAULT 1,
  `created_at`           DATETIME(6)       NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`           DATETIME(6)       NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_reservations_team` (`team_id`),
  CONSTRAINT `fk_reservations_team`
    FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_reservations_creator`
    FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. reservation_participants テーブル（status を ENUM 化）
CREATE TABLE `reservation_participants` (
  `reservation_id`       VARCHAR(36)                        NOT NULL,
  `user_id`              VARCHAR(36)                        NOT NULL,
  `status`               ENUM('registered','cancelled')     NOT NULL DEFAULT 'registered',
  `registered_at`        DATETIME(6)                        NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`reservation_id`,`user_id`),
  INDEX `idx_rp_user` (`user_id`),
  CONSTRAINT `fk_rp_reservation`
    FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_rp_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. refresh_token テーブル
CREATE TABLE refresh_tokens (
  id            CHAR(36)     NOT NULL,
  user_id       CHAR(36)     NOT NULL,
  token_hash    CHAR(64)     NOT NULL,  -- sha256 hex
  expires_at    DATETIME(6)  NOT NULL,
  revoked_at    DATETIME(6)  NULL,
  created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_user (user_id),
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;