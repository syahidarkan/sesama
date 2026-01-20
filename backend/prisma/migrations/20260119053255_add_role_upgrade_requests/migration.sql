-- CreateEnum
CREATE TYPE "UpgradeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UpgradeRequestType" AS ENUM ('USER_TO_PENGUSUL', 'USER_TO_MANAGER', 'USER_TO_CONTENT_MANAGER', 'USER_TO_SUPERVISOR');

-- CreateTable
CREATE TABLE "role_upgrade_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "request_type" "UpgradeRequestType" NOT NULL,
    "status" "UpgradeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "ktp_number" TEXT,
    "ktp_image_url" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "institution_name" TEXT,
    "institution_profile" TEXT,
    "supporting_documents" JSONB,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_upgrade_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "role_upgrade_requests_user_id_idx" ON "role_upgrade_requests"("user_id");

-- CreateIndex
CREATE INDEX "role_upgrade_requests_status_idx" ON "role_upgrade_requests"("status");

-- CreateIndex
CREATE INDEX "role_upgrade_requests_request_type_idx" ON "role_upgrade_requests"("request_type");

-- AddForeignKey
ALTER TABLE "role_upgrade_requests" ADD CONSTRAINT "role_upgrade_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_upgrade_requests" ADD CONSTRAINT "role_upgrade_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
