-- CreateTable
CREATE TABLE `ProfileVisit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `visitorId` INTEGER NOT NULL,
    `visitedId` INTEGER NOT NULL,
    `visitedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ProfileVisit_visitorId_visitedId_key`(`visitorId`, `visitedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProfileVisit` ADD CONSTRAINT `ProfileVisit_visitorId_fkey` FOREIGN KEY (`visitorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProfileVisit` ADD CONSTRAINT `ProfileVisit_visitedId_fkey` FOREIGN KEY (`visitedId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
