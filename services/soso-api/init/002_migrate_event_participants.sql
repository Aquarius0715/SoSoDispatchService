-- ============================================================
-- event_participants: type/status ENUM → boolean列 への移行
-- ============================================================

-- Step 1: 新しい boolean 列を追加
ALTER TABLE `event_participants`
  ADD COLUMN `participant_status`    TINYINT(1) NOT NULL DEFAULT 0 AFTER `user_id`,
  ADD COLUMN `go_driver_status`      TINYINT(1) NOT NULL DEFAULT 0 AFTER `participant_status`,
  ADD COLUMN `return_driver_status`  TINYINT(1) NOT NULL DEFAULT 0 AFTER `go_driver_status`,
  ADD COLUMN `go_rider_status`       TINYINT(1) NOT NULL DEFAULT 0 AFTER `return_driver_status`,
  ADD COLUMN `return_rider_status`   TINYINT(1) NOT NULL DEFAULT 0 AFTER `go_rider_status`;

-- Step 2: 既存データを新しい列に移行
UPDATE `event_participants`
SET `participant_status` = CASE WHEN `status` = 'registered' THEN 1 ELSE 0 END,
    `go_driver_status` = CASE WHEN `type` = 'go' AND `status` = 'registered' THEN 1 ELSE 0 END,
    `return_driver_status` = CASE WHEN `type` = 'return' AND `status` = 'registered' THEN 1 ELSE 0 END;

-- Step 3: 旧カラムを削除し、監査列を追加
ALTER TABLE `event_participants`
  DROP COLUMN `status`,
  DROP COLUMN `type`,
  CHANGE COLUMN `registered_at` `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  ADD COLUMN `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER `created_at`;
