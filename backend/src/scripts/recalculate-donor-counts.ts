import { PrismaClient, DonationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function recalculateDonorCounts() {
  console.log('🔄 Starting donor count recalculation...');

  try {
    // Get all programs
    const programs = await prisma.program.findMany({
      select: { id: true, title: true },
    });

    console.log(`📊 Found ${programs.length} programs to process`);

    for (const program of programs) {
      // Count total successful donations for this program
      const donorCount = await prisma.donation.count({
        where: {
          programId: program.id,
          status: DonationStatus.SUCCESS,
        },
      });

      // Update program donor count
      await prisma.program.update({
        where: { id: program.id },
        data: { donorCount },
      });

      console.log(`✅ ${program.title}: ${donorCount} unique donors`);
    }

    console.log('✨ Donor count recalculation completed!');
  } catch (error) {
    console.error('❌ Error recalculating donor counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recalculateDonorCounts();
