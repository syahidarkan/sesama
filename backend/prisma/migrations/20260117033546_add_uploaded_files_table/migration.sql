-- CreateEnum
CREATE TYPE "FileCategory" AS ENUM ('KTP', 'PROPOSAL', 'AKTA_NOTARIS', 'SK_KEMENKUMHAM', 'NPWP', 'SURAT_DOMISILI', 'LEGALITY_DOCS', 'OFFICIAL_LETTER', 'BUDGET_PLAN', 'BUKTI_KONDISI', 'SURAT_KETERANGAN_RT', 'COVER_IMAGE', 'OTHER');

-- CreateTable
CREATE TABLE "uploaded_files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "stored_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "category" "FileCategory" NOT NULL DEFAULT 'OTHER',
    "entity_type" TEXT,
    "entity_id" TEXT,
    "field_name" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_public" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uploaded_files_stored_filename_key" ON "uploaded_files"("stored_filename");

-- CreateIndex
CREATE INDEX "uploaded_files_entity_type_entity_id_idx" ON "uploaded_files"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "uploaded_files_uploaded_by_idx" ON "uploaded_files"("uploaded_by");

-- CreateIndex
CREATE INDEX "uploaded_files_category_idx" ON "uploaded_files"("category");

-- AddForeignKey
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
