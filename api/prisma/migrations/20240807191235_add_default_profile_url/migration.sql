/*
  Warnings:

  - Made the column `profileImage` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profileImage" SET NOT NULL,
ALTER COLUMN "profileImage" SET DEFAULT 'https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg?t=st=1721767806~exp=1721771406~hmac=2eabf978612ccdfd2ea6f27a59a484ddbee8498786207e1cb8f92a69a5ef94ee&w=740';
