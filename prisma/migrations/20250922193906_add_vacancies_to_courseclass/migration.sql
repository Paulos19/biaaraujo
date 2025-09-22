-- DropForeignKey
ALTER TABLE "public"."CourseEnrollment" DROP CONSTRAINT "CourseEnrollment_classId_fkey";

-- AlterTable
ALTER TABLE "public"."CourseClass" ADD COLUMN     "vacancies" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "public"."CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."CourseClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
