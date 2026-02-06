-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "referral_code" TEXT;

-- CreateTable
CREATE TABLE "referral_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_donations" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_donors" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_donations" (
    "id" TEXT NOT NULL,
    "referral_code_id" TEXT NOT NULL,
    "donation_id" TEXT NOT NULL,
    "donor_name" TEXT NOT NULL,
    "donor_email" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "program_id" TEXT NOT NULL,
    "program_title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_code_key" ON "referral_codes"("code");

-- CreateIndex
CREATE INDEX "referral_codes_user_id_idx" ON "referral_codes"("user_id");

-- CreateIndex
CREATE INDEX "referral_codes_code_idx" ON "referral_codes"("code");

-- CreateIndex
CREATE INDEX "referral_codes_total_donations_idx" ON "referral_codes"("total_donations");

-- CreateIndex
CREATE UNIQUE INDEX "referral_donations_donation_id_key" ON "referral_donations"("donation_id");

-- CreateIndex
CREATE INDEX "referral_donations_referral_code_id_idx" ON "referral_donations"("referral_code_id");

-- CreateIndex
CREATE INDEX "referral_donations_donation_id_idx" ON "referral_donations"("donation_id");

-- CreateIndex
CREATE INDEX "donations_referral_code_idx" ON "donations"("referral_code");

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_donations" ADD CONSTRAINT "referral_donations_referral_code_id_fkey" FOREIGN KEY ("referral_code_id") REFERENCES "referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
