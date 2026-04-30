// Seed script - bikin kategori default buat pertama kali setup
// Jalankan: npx ts-node prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
    // Pengeluaran
    { name: "Makan & Minum", type: "EXPENSE", icon: "🍜", color: "#f97316" },
    { name: "Transport", type: "EXPENSE", icon: "🚌", color: "#3b82f6" },
    { name: "Hiburan", type: "EXPENSE", icon: "🎮", color: "#8b5cf6" },
    { name: "Belanja", type: "EXPENSE", icon: "🛒", color: "#ec4899" },
    { name: "Kesehatan", type: "EXPENSE", icon: "💊", color: "#10b981" },
    { name: "Pendidikan", type: "EXPENSE", icon: "📚", color: "#6366f1" },
    { name: "Tagihan", type: "EXPENSE", icon: "📱", color: "#ef4444" },
    { name: "Lain-lain", type: "EXPENSE", icon: "📦", color: "#6b7280" },
    // Pemasukan
    { name: "Gaji", type: "INCOME", icon: "💼", color: "#22c55e" },
    { name: "Freelance", type: "INCOME", icon: "💻", color: "#14b8a6" },
    { name: "Investasi", type: "INCOME", icon: "📈", color: "#f59e0b" },
    { name: "Bonus", type: "INCOME", icon: "🎁", color: "#84cc16" },
];

async function main() {
    console.log("🌱 Seeding database...");

    // Hapus data lama kalau ada
    await prisma.transaction.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.category.deleteMany();

    // Insert kategori
    for (const cat of categories) {
        await prisma.category.create({ data: cat });
    }

    // Bikin beberapa transaksi contoh buat bulan ini
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const makanCat = await prisma.category.findFirst({
        where: { name: "Makan & Minum" },
    });
    const gajiCat = await prisma.category.findFirst({ where: { name: "Gaji" } });
    const transportCat = await prisma.category.findFirst({
        where: { name: "Transport" },
    });
    const hiburanCat = await prisma.category.findFirst({
        where: { name: "Hiburan" },
    });

    if (gajiCat) {
        await prisma.transaction.create({
            data: {
                amount: 5000000,
                type: "INCOME",
                description: "Gaji bulan ini",
                date: new Date(year, month, 1),
                categoryId: gajiCat.id,
            },
        });
    }

    if (makanCat) {
        await prisma.transaction.create({
            data: {
                amount: 85000,
                type: "EXPENSE",
                description: "Makan siang sama temen",
                date: new Date(year, month, 3),
                categoryId: makanCat.id,
            },
        });
        await prisma.transaction.create({
            data: {
                amount: 45000,
                type: "EXPENSE",
                description: "Kopi sama snack",
                date: new Date(year, month, 5),
                categoryId: makanCat.id,
            },
        });
        await prisma.transaction.create({
            data: {
                amount: 120000,
                type: "EXPENSE",
                description: "Makan malam keluarga",
                date: new Date(year, month, 10),
                categoryId: makanCat.id,
            },
        });
    }

    if (transportCat) {
        await prisma.transaction.create({
            data: {
                amount: 30000,
                type: "EXPENSE",
                description: "Grab ke kampus",
                date: new Date(year, month, 4),
                categoryId: transportCat.id,
            },
        });
    }

    if (hiburanCat) {
        await prisma.transaction.create({
            data: {
                amount: 150000,
                type: "EXPENSE",
                description: "Nonton bioskop",
                date: new Date(year, month, 8),
                categoryId: hiburanCat.id,
            },
        });
    }

    // Bikin contoh budget
    if (makanCat) {
        await prisma.budget.create({
            data: {
                categoryId: makanCat.id,
                limitAmount: 800000,
                month: month + 1,
                year,
            },
        });
    }
    if (transportCat) {
        await prisma.budget.create({
            data: {
                categoryId: transportCat.id,
                limitAmount: 300000,
                month: month + 1,
                year,
            },
        });
    }
    if (hiburanCat) {
        await prisma.budget.create({
            data: {
                categoryId: hiburanCat.id,
                limitAmount: 500000,
                month: month + 1,
                year,
            },
        });
    }

    console.log("✅ Seeding selesai!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
