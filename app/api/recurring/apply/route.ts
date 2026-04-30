// API Route: POST /api/recurring/apply?month=&year=
// Generate transaksi nyata dari semua recurring aktif untuk bulan tertentu
// Skip kalau sudah ada transaksi dengan description yang sama di bulan itu (idempotent)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const now = new Date();
        const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));
        const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        // Ambil semua recurring aktif
        const recurrings = await prisma.recurringTransaction.findMany({
            where: { isActive: true },
        });

        if (recurrings.length === 0) {
            return NextResponse.json({ applied: 0, message: "Tidak ada recurring aktif" });
        }

        // Ambil transaksi yang sudah ada di bulan ini untuk cek duplikasi
        const existingThisMonth = await prisma.transaction.findMany({
            where: { date: { gte: start, lte: end } },
            select: { description: true, categoryId: true, type: true },
        });

        // Set unik: "description|categoryId|type"
        const existingSet = new Set(
            existingThisMonth.map((t: { description: string; categoryId: number; type: string }) =>
                `${t.description}|${t.categoryId}|${t.type}`
            )
        );

        let applied = 0;
        const skipped: string[] = [];

        for (const r of recurrings) {
            const key = `${r.description}|${r.categoryId}|${r.type}`;
            if (existingSet.has(key)) {
                skipped.push(r.description);
                continue;
            }

            // Buat tanggal transaksi: dayOfMonth di bulan yang diminta
            // Kalau dayOfMonth lebih besar dari hari terakhir bulan, pakai hari terakhir
            const maxDay = new Date(year, month, 0).getDate();
            const day = Math.min(r.dayOfMonth, maxDay);
            const transactionDate = new Date(year, month - 1, day, 12, 0, 0);

            await prisma.transaction.create({
                data: {
                    amount: r.amount,
                    type: r.type,
                    description: r.description,
                    date: transactionDate,
                    categoryId: r.categoryId,
                },
            });

            applied++;
        }

        return NextResponse.json({
            applied,
            skipped: skipped.length,
            message: `${applied} transaksi berhasil di-apply, ${skipped.length} dilewati (sudah ada)`,
        });
    } catch (error) {
        console.error("POST /api/recurring/apply error:", error);
        return NextResponse.json({ error: "Gagal apply recurring" }, { status: 500 });
    }
}
