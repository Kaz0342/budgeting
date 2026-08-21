import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        
        const category = await prisma.category.update({
            where: { id },
            data: {
                name: body.name,
                icon: body.icon,
                color: body.color,
                type: body.type
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("PATCH /api/categories error:", error);
        return NextResponse.json({ error: "Gagal update kategori" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        
        // Cek apakah kategori dipakai di transaksi/budget
        const transactionCount = await prisma.transaction.count({ where: { categoryId: id } });
        const budgetCount = await prisma.budget.count({ where: { categoryId: id } });
        const recurringCount = await prisma.recurringTransaction.count({ where: { categoryId: id } });

        if (transactionCount > 0 || budgetCount > 0 || recurringCount > 0) {
            return NextResponse.json({ error: "Kategori sedang dipakai di Transaksi/Budget/Rutin dan tidak bisa dihapus." }, { status: 400 });
        }

        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/categories error:", error);
        return NextResponse.json({ error: "Gagal hapus kategori" }, { status: 500 });
    }
}
