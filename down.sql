-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_currentPositionId_fkey";

-- DropForeignKey
ALTER TABLE "profile_looking_for_positions" DROP CONSTRAINT "profile_looking_for_positions_profileId_fkey";

-- DropForeignKey
ALTER TABLE "profile_looking_for_positions" DROP CONSTRAINT "profile_looking_for_positions_positionId_fkey";

-- DropTable
DROP TABLE "profiles";

-- DropTable
DROP TABLE "positions";

-- DropTable
DROP TABLE "profile_looking_for_positions";

