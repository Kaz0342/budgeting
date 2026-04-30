// Singleton Prisma client - biar nggak bikin koneksi baru tiap request
// Penting banget di Next.js development mode karena hot reload

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error"] : [],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
