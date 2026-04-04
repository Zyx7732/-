-- Add bilingual columns (zh/en only) and default locale controls.

ALTER TABLE `Settings`
  ADD COLUMN `defaultLocale` ENUM('ZH', 'EN') NOT NULL DEFAULT 'ZH',
  ADD COLUMN `navI18n` JSON NULL,
  ADD COLUMN `pageCopyI18n` JSON NULL,
  ADD COLUMN `aiAssistantI18n` JSON NULL,
  ADD COLUMN `footerI18n` JSON NULL;

ALTER TABLE `Post`
  ADD COLUMN `titleI18n` JSON NULL,
  ADD COLUMN `slugI18n` JSON NULL,
  ADD COLUMN `excerptI18n` JSON NULL,
  ADD COLUMN `contentI18n` JSON NULL,
  ADD COLUMN `seoI18n` JSON NULL;

ALTER TABLE `Work`
  ADD COLUMN `titleI18n` JSON NULL,
  ADD COLUMN `slugI18n` JSON NULL,
  ADD COLUMN `descriptionI18n` JSON NULL,
  ADD COLUMN `contentI18n` JSON NULL,
  ADD COLUMN `seoI18n` JSON NULL;

ALTER TABLE `VideoTutorial`
  ADD COLUMN `titleI18n` JSON NULL,
  ADD COLUMN `slugI18n` JSON NULL,
  ADD COLUMN `descriptionI18n` JSON NULL,
  ADD COLUMN `seoI18n` JSON NULL;

ALTER TABLE `Category`
  ADD COLUMN `nameI18n` JSON NULL,
  ADD COLUMN `slugI18n` JSON NULL;

ALTER TABLE `Tag`
  ADD COLUMN `nameI18n` JSON NULL;

ALTER TABLE `Order`
  ADD COLUMN `buyerLocale` ENUM('ZH', 'EN') NOT NULL DEFAULT 'ZH';

ALTER TABLE `KnowledgeSource`
  ADD COLUMN `locale` ENUM('ZH', 'EN') NOT NULL DEFAULT 'ZH';

ALTER TABLE `KnowledgeChunk`
  ADD COLUMN `locale` ENUM('ZH', 'EN') NOT NULL DEFAULT 'ZH';

ALTER TABLE `KnowledgeAsset`
  ADD COLUMN `locale` ENUM('ZH', 'EN') NOT NULL DEFAULT 'ZH';

-- Backfill current single-language data to zh baseline.
UPDATE `Post`
SET
  `titleI18n` = JSON_OBJECT('zh', `title`, 'en', NULL),
  `slugI18n` = JSON_OBJECT('zh', `slug`, 'en', NULL),
  `excerptI18n` = JSON_OBJECT('zh', `excerpt`, 'en', NULL),
  `contentI18n` = JSON_OBJECT('zh', `content`, 'en', NULL)
WHERE `titleI18n` IS NULL;

UPDATE `Work`
SET
  `titleI18n` = JSON_OBJECT('zh', `title`, 'en', NULL),
  `slugI18n` = JSON_OBJECT('zh', `slug`, 'en', NULL),
  `descriptionI18n` = JSON_OBJECT('zh', `description`, 'en', NULL),
  `contentI18n` = JSON_OBJECT('zh', `content`, 'en', NULL)
WHERE `titleI18n` IS NULL;

UPDATE `VideoTutorial`
SET
  `titleI18n` = JSON_OBJECT('zh', `title`, 'en', NULL),
  `slugI18n` = JSON_OBJECT('zh', `slug`, 'en', NULL),
  `descriptionI18n` = JSON_OBJECT('zh', `description`, 'en', NULL)
WHERE `titleI18n` IS NULL;

UPDATE `Category`
SET
  `nameI18n` = JSON_OBJECT('zh', `name`, 'en', NULL),
  `slugI18n` = JSON_OBJECT('zh', `slug`, 'en', NULL)
WHERE `nameI18n` IS NULL;

UPDATE `Tag`
SET
  `nameI18n` = JSON_OBJECT('zh', `name`, 'en', NULL)
WHERE `nameI18n` IS NULL;

UPDATE `Settings`
SET
  `navI18n` = JSON_OBJECT('zh', `nav`, 'en', NULL),
  `pageCopyI18n` = JSON_OBJECT('zh', `pageCopy`, 'en', NULL),
  `aiAssistantI18n` = JSON_OBJECT('zh', `aiAssistant`, 'en', NULL),
  `footerI18n` = JSON_OBJECT('zh', `footer`, 'en', NULL)
WHERE `id` = 'settings' AND `navI18n` IS NULL;

-- Update knowledge unique key to include locale.
DROP INDEX `KnowledgeSource_sourceType_sourceId_key` ON `KnowledgeSource`;
CREATE UNIQUE INDEX `KnowledgeSource_sourceType_sourceId_locale_key` ON `KnowledgeSource`(`sourceType`, `sourceId`, `locale`);

CREATE INDEX `KnowledgeSource_locale_idx` ON `KnowledgeSource`(`locale`);
CREATE INDEX `KnowledgeChunk_locale_idx` ON `KnowledgeChunk`(`locale`);
CREATE INDEX `KnowledgeAsset_locale_idx` ON `KnowledgeAsset`(`locale`);
