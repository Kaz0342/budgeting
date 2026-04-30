// API Route: GET /api/export?month=&year= — export transaksi ke CSV
// Returns: file CSV dengan header Content-Disposition untuk auto-download

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const now = new Date();
        const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));
        const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        // Ambil semua transaksi bulan yang diminta
        const transactions = await prisma.transaction.findMany({
            where: { date: { gte: start, lte: end } },
            include: { category: true },
            orderBy: { date: "desc" },
        });

        // Build CSV string
        const rows: string[] = [
            // Header row
            "Tanggal,Jenis,Kategori,Keterangan,Jumlah (Rp)",
        ];

        for (const t of transactions) {
            const tanggal = new Date(t.date).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
            const jenis = t.type === "INCOME" ? "Pemasukan" : "Pengeluaran";
            const kategori = t.category.name;
            // Escape keterangan kalau ada koma atau newline
            const keterangan = `"${t.description.replace(/"/g, '""')}"`;
            const jumlah = t.amount;

            rows.push(`${tanggal},${jenis},${kategori},${keterangan},${jumlah}`);
        }

        const csvContent = rows.join("\n");

        // Nama file: DuitKu_Februari_2025.csv
        const monthName = new Date(year, month - 1).toLocaleString("id-ID", { month: "long" });
        const filename = `DuitKu_${monthName}_${year}.csv`;

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("GET /api/export error:", error);
        return NextResponse.json({ error: "Gagal export data" }, { status: 500 });
    }
}
