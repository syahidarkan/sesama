-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('INDIVIDU', 'LEMBAGA');

-- CreateEnum
CREATE TYPE "BeritaCategory" AS ENUM ('POLITIK', 'SOSIAL', 'TEKNOLOGI', 'EKONOMI', 'PENDIDIKAN', 'KESEHATAN', 'OLAHRAGA', 'HIBURAN', 'LAINNYA');

-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "beneficiary_bank_account" TEXT,
ADD COLUMN     "beneficiary_bank_name" TEXT,
ADD COLUMN     "bukti_kondisi_urls" JSONB,
ADD COLUMN     "ktp_pengaju_url" TEXT,
ADD COLUMN     "program_type" "ProgramType" NOT NULL DEFAULT 'LEMBAGA',
ADD COLUMN     "surat_keterangan_rt_url" TEXT;

-- CreateTable
CREATE TABLE "berita" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "cover_image_url" TEXT,
    "category" "BeritaCategory" NOT NULL DEFAULT 'LAINNYA',
    "author_id" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'PUBLISHED',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "static_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "last_edited_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "static_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_field_configs" (
    "id" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_field_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pelaporan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "cover_image_url" TEXT,
    "program_id" TEXT,
    "author_id" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pelaporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pelaporan_approvals" (
    "id" TEXT NOT NULL,
    "pelaporan_id" TEXT NOT NULL,
    "approver_id" TEXT NOT NULL,
    "action" "ApprovalActionType" NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pelaporan_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pelaporan_history" (
    "id" TEXT NOT NULL,
    "pelaporan_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "edited_by" TEXT NOT NULL,
    "edited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pelaporan_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "berita_slug_key" ON "berita"("slug");

-- CreateIndex
CREATE INDEX "berita_slug_idx" ON "berita"("slug");

-- CreateIndex
CREATE INDEX "berita_status_idx" ON "berita"("status");

-- CreateIndex
CREATE INDEX "berita_category_idx" ON "berita"("category");

-- CreateIndex
CREATE UNIQUE INDEX "static_pages_slug_key" ON "static_pages"("slug");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_category_key_key" ON "system_settings"("category", "key");

-- CreateIndex
CREATE UNIQUE INDEX "form_field_configs_formType_fieldName_key" ON "form_field_configs"("formType", "fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "pelaporan_slug_key" ON "pelaporan"("slug");

-- CreateIndex
CREATE INDEX "pelaporan_slug_idx" ON "pelaporan"("slug");

-- CreateIndex
CREATE INDEX "pelaporan_status_idx" ON "pelaporan"("status");

-- CreateIndex
CREATE INDEX "pelaporan_program_id_idx" ON "pelaporan"("program_id");

-- CreateIndex
CREATE INDEX "pelaporan_approvals_pelaporan_id_idx" ON "pelaporan_approvals"("pelaporan_id");

-- CreateIndex
CREATE INDEX "pelaporan_history_pelaporan_id_idx" ON "pelaporan_history"("pelaporan_id");

-- AddForeignKey
ALTER TABLE "berita" ADD CONSTRAINT "berita_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "static_pages" ADD CONSTRAINT "static_pages_last_edited_by_fkey" FOREIGN KEY ("last_edited_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_field_configs" ADD CONSTRAINT "form_field_configs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelaporan" ADD CONSTRAINT "pelaporan_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelaporan" ADD CONSTRAINT "pelaporan_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelaporan_approvals" ADD CONSTRAINT "pelaporan_approvals_pelaporan_id_fkey" FOREIGN KEY ("pelaporan_id") REFERENCES "pelaporan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelaporan_approvals" ADD CONSTRAINT "pelaporan_approvals_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelaporan_history" ADD CONSTRAINT "pelaporan_history_pelaporan_id_fkey" FOREIGN KEY ("pelaporan_id") REFERENCES "pelaporan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
