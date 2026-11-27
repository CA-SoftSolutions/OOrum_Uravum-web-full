-- Link obituaries to the frontend user who submitted them (nullable for legacy rows)
ALTER TABLE `obituaries`
  ADD COLUMN `frontend_user_id` VARCHAR(30) NULL;

CREATE INDEX `obituaries_frontend_user_id_idx` ON `obituaries`(`frontend_user_id`);

ALTER TABLE `obituaries`
  ADD CONSTRAINT `obituaries_frontend_user_id_fkey`
  FOREIGN KEY (`frontend_user_id`) REFERENCES `frontend_users`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Allow multiple named family-detail drafts per user
ALTER TABLE `frontend_obituary_family`
  DROP INDEX `frontend_obituary_family_user_id_key`;

ALTER TABLE `frontend_obituary_family`
  ADD COLUMN `label` VARCHAR(200) NOT NULL DEFAULT '';

CREATE INDEX `frontend_obituary_family_user_id_updated_at_idx`
  ON `frontend_obituary_family`(`user_id`, `updated_at`);

-- Audit trail: track which draft entry each save belongs to + its label
ALTER TABLE `frontend_obituary_family_audit`
  ADD COLUMN `family_id` VARCHAR(30) NULL,
  ADD COLUMN `label` VARCHAR(200) NULL;

CREATE INDEX `frontend_obituary_family_audit_family_id_idx`
  ON `frontend_obituary_family_audit`(`family_id`);
