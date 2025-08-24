-- AlterTable
ALTER TABLE `EmailTemplateTranslation` ADD COLUMN `description` TEXT NULL,
    MODIFY `subject` TEXT NOT NULL,
    MODIFY `content` TEXT NOT NULL;
