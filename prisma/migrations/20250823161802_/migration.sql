/*
  Warnings:

  - You are about to drop the column `device` on the `UserActivity` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `UserActivity` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `UserActivity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `UserActivity` DROP COLUMN `device`,
    DROP COLUMN `ipAddress`,
    DROP COLUMN `location`;
