import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
prisma.transaction.findMany({orderBy: {amount: 'desc'}, take: 10}).then(console.log).finally(() => prisma.$disconnect());
