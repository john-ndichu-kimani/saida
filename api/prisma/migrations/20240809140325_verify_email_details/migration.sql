/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `phoneNumber` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetPasswordExpiresAt" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" VARCHAR(255),
ADD COLUMN     "verificationToken" VARCHAR(255),
ADD COLUMN     "verificationTokenExpiresAt" TIMESTAMP(3),
ALTER COLUMN "phoneNumber" SET DATA TYPE VARCHAR(15);
