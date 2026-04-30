// API Route: GET /api/budgets?month=&year=
// POST /api/budgets - set/update budget

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const now = new Date();
        const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));
        const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));

        // Ambil semua budget bulan ini dengan info pengeluaran aktual
        const budgets = await prisma.budget.findMany({
            where: { month, year },
            include: { category: true },
        });

        // Hitung pengeluaran aktual per kategori bulan ini
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const spending = await prisma.transaction.groupBy({
            by: ["categoryId"],
            where: {
                type: "EXPENSE",
                date: { gte: start, lte: end },
            },
            _sum: { amount: true },
        });

        const spendingMap = Object.fromEntries(
            spending.map((s: { categoryId: number; _sum: { amount: number | null } }) => [s.categoryId, s._sum.amount ?? 0])
        );

        // Gabungkan budget + actual spending
        // Derive tipe dari inferensi Prisma langsung, no import needed
        type BudgetItem = typeof budgets[number];
        const result = budgets.map((budget: BudgetItem) => ({
            ...budget,
            spent: (spendingMap[budget.categoryId] as number) ?? 0,
            percentage: Math.round(
                (((spendingMap[budget.categoryId] as number) ?? 0) / Number(budget.limitAmount)) * 100
            ),
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("GET /api/budgets error:", error);
        return NextResponse.json({ error: "Gagal ambil budget" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { categoryId, limitAmount, month, year } = body;

        if (!categoryId || !limitAmount || !month || !year) {
            return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        }

        // Upsert — update kalau udah ada, insert kalau belum
        const budget = await prisma.budget.upsert({
            where: {
                categoryId_month_year: {
                    categoryId: parseInt(categoryId),
                    month: parseInt(month),
                    year: parseInt(year),
                },
            },
            update: { limitAmount: parseInt(limitAmount) },
            create: {
                categoryId: parseInt(categoryId),
                limitAmount: parseInt(limitAmount),
                month: parseInt(month),
                year: parseInt(year),
            },
            include: { category: true },
        });

        return NextResponse.json(budget, { status: 201 });
    } catch (error) {
        console.error("POST /api/budgets error:", error);
        return NextResponse.json({ error: "Gagal set budget" }, { status: 500 });
    }
}
