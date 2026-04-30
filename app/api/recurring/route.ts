// API Route: GET /api/recurring — list semua recurring transactions
// POST /api/recurring — buat recurring baru

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const recurrings = await prisma.recurringTransaction.findMany({
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(recurrings);
    } catch (error) {
        console.error("GET /api/recurring error:", error);
        return NextResponse.json({ error: "Gagal ambil recurring" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, type, description, categoryId, dayOfMonth } = body;

        if (!amount || !type || !description || !categoryId || !dayOfMonth) {
            return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        }
        if (!["INCOME", "EXPENSE"].includes(type)) {
            return NextResponse.json({ error: "Type tidak valid" }, { status: 400 });
        }
        if (parseInt(dayOfMonth) < 1 || parseInt(dayOfMonth) > 28) {
            return NextResponse.json({ error: "Tanggal harus antara 1-28" }, { status: 400 });
        }

        const recurring = await prisma.recurringTransaction.create({
            data: {
                amount: parseInt(amount),
                type,
                description,
                categoryId: parseInt(categoryId),
                dayOfMonth: parseInt(dayOfMonth),
                isActive: true,
            },
            include: { category: true },
        });

        return NextResponse.json(recurring, { status: 201 });
    } catch (error) {
        console.error("POST /api/recurring error:", error);
        return NextResponse.json({ error: "Gagal buat recurring" }, { status: 500 });
    }
}
