// API Route: DELETE /api/transactions/[id]
// PATCH /api/transactions/[id]

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        await prisma.transaction.delete({ where: { id } });
        return NextResponse.json({ message: "Transaksi dihapus" });
    } catch (error) {
        console.error("DELETE /api/transactions/[id] error:", error);
        return NextResponse.json({ error: "Gagal hapus transaksi" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        const { amount, type, description, date, categoryId } = body;

        const updated = await prisma.transaction.update({
            where: { id },
            data: {
                ...(amount !== undefined && { amount: parseInt(amount) }),
                ...(type && { type }),
                ...(description && { description }),
                ...(date && { date: new Date(date) }),
                ...(categoryId && { categoryId: parseInt(categoryId) }),
            },
            include: { category: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("PATCH /api/transactions/[id] error:", error);
        return NextResponse.json({ error: "Gagal update transaksi" }, { status: 500 });
    }
}
