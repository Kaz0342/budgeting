// API Route: PATCH /api/recurring/[id] — toggle isActive
// DELETE /api/recurring/[id] — hapus permanen

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updated = await prisma.recurringTransaction.update({
            where: { id: parseInt(id) },
            data: { isActive: body.isActive },
            include: { category: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("PATCH /api/recurring/[id] error:", error);
        return NextResponse.json({ error: "Gagal update recurring" }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.recurringTransaction.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/recurring/[id] error:", error);
        return NextResponse.json({ error: "Gagal hapus recurring" }, { status: 500 });
    }
}
