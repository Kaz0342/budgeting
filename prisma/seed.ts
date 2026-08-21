// Seed script — Kategori Fixed + Mapping Alokasi
// Jalankan: npx ts-node prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
    // ═══════════════════════════════════════
    // PENGELUARAN — Induk: Kebutuhan
    // ═══════════════════════════════════════
    { name: "Makan & Minuman",          type: "EXPENSE", icon: "🍜", color: "#f97316", allocation: "Kebutuhan" },
    { name: "Bensin & Transportasi",    type: "EXPENSE", icon: "⛽", color: "#3b82f6", allocation: "Kebutuhan" },
    { name: "Kos",                      type: "EXPENSE", icon: "🏠", color: "#8b5cf6", allocation: "Kebutuhan" },
    { name: "Internet & Komunikasi",    type: "EXPENSE", icon: "📶", color: "#06b6d4", allocation: "Kebutuhan" },
    { name: "Personal Care",            type: "EXPENSE", icon: "🧴", color: "#ec4899", allocation: "Kebutuhan" },

    // ═══════════════════════════════════════
    // PENGELUARAN — Induk: Keinginan
    // ═══════════════════════════════════════
    { name: "Hiburan, Jajan, Lifestyle", type: "EXPENSE", icon: "🎮", color: "#f59e0b", allocation: "Keinginan" },
    { name: "Motor",                     type: "EXPENSE", icon: "🏍️", color: "#ef4444", allocation: "Keinginan" },
    { name: "Gadget",                    type: "EXPENSE", icon: "📱", color: "#6366f1", allocation: "Keinginan" },

    // ═══════════════════════════════════════
    // PENGELUARAN — Induk: Tabungan
    // ═══════════════════════════════════════
    { name: "Tabungan, Dana darurat",    type: "EXPENSE", icon: "🏦", color: "#10b981", allocation: "Tabungan" },

    // ═══════════════════════════════════════
    // PEMASUKAN — Tidak punya induk alokasi
    // ═══════════════════════════════════════
    { name: "Gaji",            type: "INCOME", icon: "💼", color: "#22c55e", allocation: "-" },
    { name: "Transfer Masuk",  type: "INCOME", icon: "💸", color: "#14b8a6", allocation: "-" },
];

async function main() {
    console.log("🌱 Resetting & seeding database...");

    // Wipe semua data terkait (urutan penting karena foreign keys)
    console.log("  🗑️ Menghapus transaksi...");
    await prisma.transaction.deleteMany();
    console.log("  🗑️ Menghapus budget...");
    await prisma.budget.deleteMany();
    console.log("  🗑️ Menghapus recurring...");
    await prisma.recurringTransaction.deleteMany();
    console.log("  🗑️ Menghapus kategori lama...");
    await prisma.category.deleteMany();

    // Insert kategori baru
    console.log("  📦 Memasukkan kategori baru...");
    for (const cat of categories) {
        await prisma.category.create({ data: cat });
    }

    const count = await prisma.category.count();
    console.log(`✅ Seeding selesai! Total ${count} kategori berhasil ditanam.`);
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
