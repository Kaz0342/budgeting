// API Route: PATCH /api/goals/[id] — tambah setoran ke saved amount
// DELETE /api/goals/[id] — hapus goal

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { addAmount } = body;

        if (!addAmount || parseInt(addAmount) <= 0) {
            return NextResponse.json({ error: "Jumlah setoran harus lebih dari 0" }, { status: 400 });
        }

        // Increment savedAmount
        const updated = await prisma.savingsGoal.update({
            where: { id: parseInt(id) },
            data: {
                savedAmount: {
                    increment: parseInt(addAmount),
                },
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("PATCH /api/goals/[id] error:", error);
        return NextResponse.json({ error: "Gagal update goal" }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.savingsGoal.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/goals/[id] error:", error);
        return NextResponse.json({ error: "Gagal hapus goal" }, { status: 500 });
    }
}
