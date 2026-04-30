// API Route: GET /api/summary - ringkasan keuangan bulanan
// Returns: total income, total expense, balance, category breakdown, trend 6 bulan

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Type helper untuk expense breakdown
interface CategoryBreakdown {
    name: string;
    icon: string;
    color: string;
    amount: number;
}

// Type helper untuk budget alert
interface BudgetAlert {
    name: string;
    icon: string;
    color: string;
    percentage: number;
}


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const now = new Date();
        const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));
        const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        // Ambil semua transaksi bulan ini
        const transactions = await prisma.transaction.findMany({
            where: { date: { gte: start, lte: end } },
            include: { category: true },
        });

        const totalIncome = transactions
            .filter((t: (typeof transactions)[number]) => t.type === "INCOME")
            .reduce((sum: number, t: (typeof transactions)[number]) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter((t: (typeof transactions)[number]) => t.type === "EXPENSE")
            .reduce((sum: number, t: (typeof transactions)[number]) => sum + t.amount, 0);

        // Breakdown pengeluaran per kategori
        const expenseByCategory = transactions
            .filter((t: (typeof transactions)[number]) => t.type === "EXPENSE")
            .reduce((acc: Record<string, CategoryBreakdown>, t: (typeof transactions)[number]) => {
                const key = String(t.categoryId);
                if (!acc[key]) {
                    acc[key] = {
                        name: t.category.name,
                        icon: t.category.icon,
                        color: t.category.color,
                        amount: 0,
                    };
                }
                acc[key].amount += t.amount;
                return acc;
            }, {});

        // Trend 6 bulan terakhir
        const trend = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(year, month - 1 - i, 1);
            const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

            const mTransactions = await prisma.transaction.findMany({
                where: { date: { gte: mStart, lte: mEnd } },
                select: { type: true, amount: true },
            });

            const mIncome = mTransactions
                .filter((t: (typeof mTransactions)[number]) => t.type === "INCOME")
                .reduce((sum: number, t: (typeof mTransactions)[number]) => sum + t.amount, 0);
            const mExpense = mTransactions
                .filter((t: (typeof mTransactions)[number]) => t.type === "EXPENSE")
                .reduce((sum: number, t: (typeof mTransactions)[number]) => sum + t.amount, 0);

            trend.push({
                month: d.toLocaleString("id-ID", { month: "short" }),
                income: mIncome,
                expense: mExpense,
            });
        }

        // 5 transaksi terbaru
        const recentTransactions = await prisma.transaction.findMany({
            take: 5,
            orderBy: { date: "desc" },
            include: { category: true },
        });

        // Budget alerts — kategori yang sudah ≥ 80% dari limit bulan ini
        const budgets = await prisma.budget.findMany({
            where: { month, year },
            include: { category: true },
        });

        // Hitung spending per kategori untuk bulan ini (dipakai di alerts)
        const alertSpending = await prisma.transaction.groupBy({
            by: ["categoryId"],
            where: { type: "EXPENSE", date: { gte: start, lte: end } },
            _sum: { amount: true },
        });

        const alertSpendingMap = Object.fromEntries(
            alertSpending.map((s: { categoryId: number; _sum: { amount: number | null } }) =>
                [s.categoryId, s._sum.amount ?? 0]
            )
        );

        const budgetAlerts: BudgetAlert[] = budgets
            .map((b: typeof budgets[number]) => {
                const spent = (alertSpendingMap[b.categoryId] as number) ?? 0;
                const percentage = b.limitAmount > 0
                    ? Math.round((spent / b.limitAmount) * 100)
                    : 0;
                return { name: b.category.name, icon: b.category.icon, color: b.category.color, percentage };
            })
            .filter((a: BudgetAlert) => a.percentage >= 80)
            .sort((a: BudgetAlert, b: BudgetAlert) => b.percentage - a.percentage);

        return NextResponse.json({
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            expenseByCategory: Object.values(expenseByCategory),
            trend,
            recentTransactions,
            budgetAlerts,
        });
    } catch (error) {
        console.error("GET /api/summary error:", error);
        return NextResponse.json({ error: "Gagal ambil summary" }, { status: 500 });
    }
}
