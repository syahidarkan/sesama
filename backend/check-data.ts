import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    const staticPages = await prisma.staticPage.findMany();
    console.log('\n📄 Static Pages:', staticPages.length);
    staticPages.forEach(page => {
      console.log(`  - ${page.slug}: ${page.title}`);
    });

    const berita = await prisma.berita.findMany();
    console.log('\n📰 Berita:', berita.length);
    berita.forEach(b => {
      console.log(`  - ${b.title} (${b.status})`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkData();
