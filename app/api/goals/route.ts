// API Route: GET /api/goals — list semua savings goals
// POST /api/goals — buat goal baru

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const goals = await prisma.savingsGoal.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(goals);
    } catch (error) {
        console.error("GET /api/goals error:", error);
        return NextResponse.json({ error: "Gagal ambil goals" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, icon, targetAmount, deadline } = body;

        if (!name || !targetAmount) {
            return NextResponse.json({ error: "Nama dan target wajib diisi" }, { status: 400 });
        }
        if (parseInt(targetAmount) <= 0) {
            return NextResponse.json({ error: "Target harus lebih dari 0" }, { status: 400 });
        }

        const goal = await prisma.savingsGoal.create({
            data: {
                name,
                icon: icon || "🎯",
                targetAmount: parseInt(targetAmount),
                savedAmount: 0,
                deadline: deadline ? new Date(deadline) : null,
            },
        });

        return NextResponse.json(goal, { status: 201 });
    } catch (error) {
        console.error("POST /api/goals error:", error);
        return NextResponse.json({ error: "Gagal buat goal" }, { status: 500 });
    }
}
