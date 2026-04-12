-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "category" TEXT;

-- CreateIndex
CREATE INDEX "jobs_category_idx" ON "jobs"("category");
