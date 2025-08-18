/*
  Warnings:

  - You are about to alter the column `children` on the `User` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `children` VARCHAR(191) NULL;
