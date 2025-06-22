import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  const primary = await prisma.contact.create({
    data: {
      email: 'lorraine@hillvalley.edu',
      phoneNumber: '123456',
      linkPrecedence: 'PRIMARY',
    },
  });

  await prisma.contact.create({
    data: {
      email: 'mcfly@hillvalley.edu',
      phoneNumber: '123456',
      linkPrecedence: 'SECONDARY',
      linkedId: primary.id,
    },
  });

  console.log('✅ Seeded test contacts');
}

seed().finally(() => prisma.$disconnect());
