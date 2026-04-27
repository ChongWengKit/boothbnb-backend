/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.currency_exchange.count();

  if (count === 0) {
    await prisma.currency_exchange.create({
      data: {
        currency: 'USD',
        rate: 1.0,
        is_enabled: false,
      },
    });
  }
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });