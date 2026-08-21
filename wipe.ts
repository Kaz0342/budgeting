import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function cleanAndRun() {
  await prisma.transaction.deleteMany();
  console.log("Semua transaksi di-reset.");
}

cleanAndRun().finally(() => prisma.$disconnect());
