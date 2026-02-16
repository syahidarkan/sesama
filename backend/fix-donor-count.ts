import { PrismaClient, DonationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function recalculateDonorCounts() {
  console.log('🔄 Recalculating donor counts for all programs...\n');

  // Get all programs
  const programs = await prisma.program.findMany({
    select: { id: true, title: true },
  });

  for (const program of programs) {
    // Get all successful donations for this program
    const successfulDonations = await prisma.donation.findMany({
      where: {
        programId: program.id,
        status: DonationStatus.SUCCESS,
      },
      select: {
        id: true,
        userId: true,
        donorEmail: true,
        isAnonymous: true,
      },
    });

    // Count unique donors
    const uniqueDonors = new Set();
    successfulDonations.forEach((d) => {
      if (d.userId) {
        uniqueDonors.add(`user:${d.userId}`);
      } else if (d.donorEmail) {
        uniqueDonors.add(`email:${d.donorEmail}`);
      } else {
        uniqueDonors.add(`donation:${d.id}`);
      }
    });

    const donorCount = uniqueDonors.size;

    // Update program
    await prisma.program.update({
      where: { id: program.id },
      data: { donorCount },
    });

    console.log(`✅ ${program.title}: ${donorCount} unique donors`);
  }

  console.log('\n✅ Done! All donor counts recalculated.');
}

recalculateDonorCounts()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
