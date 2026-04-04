-- Add AI assistant config fields and base knowledge tables.

ALTER TABLE `Settings`
  ADD COLUMN `aiAssistant` JSON NULL,
  ADD COLUMN `aiModelConfig` JSON NULL;

CREATE TABLE `KnowledgeSource` (
  `id` VARCHAR(191) NOT NULL,
  `sourceType` ENUM('POST', 'WORK', 'TUTORIAL', 'SETTINGS') NOT NULL,
  `sourceId` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(255) NULL,
  `title` VARCHAR(255) NOT NULL,
  `url` TEXT NOT NULL,
  `status` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  `hash` VARCHAR(64) NOT NULL,
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `KnowledgeSource_status_idx`(`status`),
  INDEX `KnowledgeSource_sourceType_idx`(`sourceType`),
  UNIQUE INDEX `KnowledgeSource_sourceType_sourceId_key`(`sourceType`, `sourceId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `KnowledgeChunk` (
  `id` VARCHAR(191) NOT NULL,
  `sourceId` VARCHAR(191) NOT NULL,
  `chunkIndex` INTEGER NOT NULL,
  `contentText` LONGTEXT NOT NULL,
  `contentTokens` INTEGER NOT NULL DEFAULT 0,
  `embedding` JSON NULL,
  `meta` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `KnowledgeChunk_sourceId_idx`(`sourceId`),
  UNIQUE INDEX `KnowledgeChunk_sourceId_chunkIndex_key`(`sourceId`, `chunkIndex`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `KnowledgeAsset` (
  `id` VARCHAR(191) NOT NULL,
  `sourceId` VARCHAR(191) NOT NULL,
  `assetType` ENUM('IMAGE') NOT NULL DEFAULT 'IMAGE',
  `url` TEXT NOT NULL,
  `caption` VARCHAR(255) NULL,
  `ocrText` TEXT NULL,
  `embedding` JSON NULL,
  `width` INTEGER NULL,
  `height` INTEGER NULL,
  `hash` VARCHAR(64) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `KnowledgeAsset_sourceId_idx`(`sourceId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `KnowledgeSyncJob` (
  `id` VARCHAR(191) NOT NULL,
  `jobType` ENUM('UPSERT_SOURCE', 'DELETE_SOURCE', 'FULL_REBUILD') NOT NULL,
  `payload` JSON NULL,
  `status` ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
  `error` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `KnowledgeSyncJob_status_idx`(`status`),
  INDEX `KnowledgeSyncJob_jobType_idx`(`jobType`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `KnowledgeChunk`
  ADD CONSTRAINT `KnowledgeChunk_sourceId_fkey`
  FOREIGN KEY (`sourceId`) REFERENCES `KnowledgeSource`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `KnowledgeAsset`
  ADD CONSTRAINT `KnowledgeAsset_sourceId_fkey`
  FOREIGN KEY (`sourceId`) REFERENCES `KnowledgeSource`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
