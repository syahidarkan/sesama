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
      // Count unique donors for this program (by email)
      const uniqueDonors = await prisma.donation.groupBy({
        by: ['donorEmail'],
        where: {
          programId: program.id,
          status: DonationStatus.SUCCESS,
        },
        _count: true,
      });

      const donorCount = uniqueDonors.length;

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
