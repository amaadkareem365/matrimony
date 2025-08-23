-- AlterTable
ALTER TABLE `User` ADD COLUMN `activeLanguageId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_activeLanguageId_fkey` FOREIGN KEY (`activeLanguageId`) REFERENCES `Language`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
