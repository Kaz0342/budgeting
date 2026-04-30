// API Route: GET /api/transactions - list dengan filter
// POST /api/transactions - buat transaksi baru

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");        // "INCOME" | "EXPENSE"
        const categoryId = searchParams.get("categoryId");
        const month = searchParams.get("month");      // 1-12
        const year = searchParams.get("year");

        // Bangun filter dinamis
        const where: Record<string, unknown> = {};
        if (type) where.type = type;
        if (categoryId) where.categoryId = parseInt(categoryId);
        if (month && year) {
            const start = new Date(parseInt(year), parseInt(month) - 1, 1);
            const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
            where.date = { gte: start, lte: end };
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: { category: true },
            orderBy: { date: "desc" },
        });

        return NextResponse.json(transactions);
    } catch (error) {
        console.error("GET /api/transactions error:", error);
        return NextResponse.json({ error: "Gagal ambil transaksi" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, type, description, date, categoryId } = body;

        if (!amount || !type || !description || !categoryId) {
            return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        }
        if (!["INCOME", "EXPENSE"].includes(type)) {
            return NextResponse.json({ error: "Type tidak valid" }, { status: 400 });
        }
        if (parseInt(amount) <= 0) {
            return NextResponse.json({ error: "Amount harus lebih dari 0" }, { status: 400 });
        }

        const transaction = await prisma.transaction.create({
            data: {
                amount: parseInt(amount),
                type,
                description,
                date: date ? new Date(date) : new Date(),
                categoryId: parseInt(categoryId),
            },
            include: { category: true },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error("POST /api/transactions error:", error);
        return NextResponse.json({ error: "Gagal buat transaksi" }, { status: 500 });
    }
}
