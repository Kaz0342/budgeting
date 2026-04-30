// API Route: GET /api/categories - ambil semua kategori
// POST /api/categories - buat kategori baru

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: [{ type: "asc" }, { name: "asc" }],
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("GET /api/categories error:", error);
        return NextResponse.json({ error: "Gagal ambil kategori" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, type, icon, color } = body;

        if (!name || !type || !["INCOME", "EXPENSE"].includes(type)) {
            return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: { name, type, icon: icon ?? "💰", color: color ?? "#6366f1" },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error("POST /api/categories error:", error);
        return NextResponse.json({ error: "Gagal buat kategori" }, { status: 500 });
    }
}
