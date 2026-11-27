CREATE TABLE IF NOT EXISTS `frontend_obituary_family` (
  `id` VARCHAR(30) NOT NULL,
  `user_id` VARCHAR(30) NOT NULL,
  `data` LONGTEXT NOT NULL,
  `version` INTEGER NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `frontend_obituary_family_user_id_key` (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `frontend_obituary_family_audit` (
  `id` VARCHAR(30) NOT NULL,
  `user_id` VARCHAR(30) NOT NULL,
  `version` INTEGER NOT NULL,
  `action` VARCHAR(20) NOT NULL,
  `before_data` LONGTEXT NULL,
  `after_data` LONGTEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `frontend_obituary_family_audit_user_id_created_at_idx`
  ON `frontend_obituary_family_audit`(`user_id`, `created_at`);

CREATE INDEX `frontend_obituary_family_audit_created_at_idx`
  ON `frontend_obituary_family_audit`(`created_at`);
