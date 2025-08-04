-- 1. users テーブル
CREATE TABLE `users` (
  `id`             VARCHAR(36)       NOT NULL,
  `username`       VARCHAR(64)       NOT NULL UNIQUE,
  `mail_address`   VARCHAR(128)      NOT NULL UNIQUE,
  `password_hash`  VARCHAR(255)      NOT NULL,
  `has_car`        TINYINT(1)        NOT NULL DEFAULT 0,
  `capacity`       INT               NOT NULL DEFAULT 0,
  `created_at`     DATETIME(6)       NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`     DATETIME(6)       NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY(`id`)
);

-- 2. calenders テーブル
CREATE TABLE `calenders` (
  `id`             VARCHAR(36)       NOT NULL,
  `name`           VARCHAR(128)      NOT NULL,
  `description`    TEXT,
  `owner_id`       VARCHAR(36)       NOT NULL,
  `created_at`     DATETIME(6)       NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`     DATETIME(6)       NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_calenders_owner` (`owner_id`),
  CONSTRAINT `fk_calenders_owner`
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. calender_memberships テーブル
CREATE TABLE `calender_memberships` (
  `calender_id`        VARCHAR(36)               NOT NULL,
  `user_id`        VARCHAR(36)               NOT NULL,
  `role`           ENUM('member','admin')    NOT NULL DEFAULT 'member',
  `soso_point`     INT                       NOT NULL DEFAULT 0,
  `joined_at`      DATETIME(6)               NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`calender_id`,`user_id`),
  INDEX `idx_tm_user` (`user_id`),
  CONSTRAINT `fk_tm_calender`
    FOREIGN KEY (`calender_id`) REFERENCES `calenders`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_tm_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. reservations テーブル
CREATE TABLE `reservations` (
  `id`                   VARCHAR(36)       NOT NULL,
  `calender_id`              VARCHAR(36)       NOT NULL,
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
  INDEX `idx_reservations_calender` (`calender_id`),
  CONSTRAINT `fk_reservations_calender`
    FOREIGN KEY (`calender_id`) REFERENCES `calenders`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_reservations_creator`
    FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. reservation_participants テーブル
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
  `id`            CHAR(36)     NOT NULL,
  `user_id`       CHAR(36)     NOT NULL,
  `token_hash`    CHAR(64)     NOT NULL,
  `expires_at`    DATETIME(6)  NOT NULL,
  `revoked_at`    DATETIME(6)  NULL,
  `created_at`    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_rt_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. soso_point_histories テーブル
CREATE TABLE `soso_point_histories` (
  `id`             BIGINT AUTO_INCREMENT PRIMARY KEY,
  `calender_id`        VARCHAR(36) NOT NULL,
  `user_id`        VARCHAR(36) NOT NULL,
  `changed_at`     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `changed_by`     VARCHAR(36),  -- 操作したユーザー（NULL = システム）
  `reservation_id` VARCHAR(36),  -- 関連する予約（NULL可）
  `old_point`      INT NOT NULL,
  `new_point`      INT NOT NULL,
  `point_delta`    INT NOT NULL,  -- new_point - old_point
  `reason`         TEXT,  -- 操作理由の自由記述欄

  INDEX `idx_sph_user` (`user_id`),
  INDEX `idx_sph_calender` (`calender_id`),
  INDEX `idx_sph_reservation` (`reservation_id`),

  CONSTRAINT `fk_sph_calender`
    FOREIGN KEY (`calender_id`) REFERENCES `calenders`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_sph_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_sph_changed_by`
    FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_sph_reservation`
    FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;