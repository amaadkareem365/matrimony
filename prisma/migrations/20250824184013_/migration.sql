-- CreateTable
CREATE TABLE `EmailSentCount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `welcomeEmail` INTEGER NOT NULL DEFAULT 0,
    `passwordReset` INTEGER NOT NULL DEFAULT 0,
    `orderConfirmation` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
