-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('ADMIN', 'USER', 'SALE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "userRole" "UserRoles" NOT NULL DEFAULT 'USER';
