import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET() {
    try {
        const user = await requireAuthUser();
        const categories = await prisma.category.findMany({
            where: {
                OR: [{ userId: user.id }, { isDefault: true }],
            },
            orderBy: { name: "asc" },
        });
        return NextResponse.json({ categories });
    }
    catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
export async function POST(req) {
    try {
        const user = await requireAuthUser();
        const { name, type, color = "#6366f1", icon = "Tag" } = await req.json();
        if (!name || !type) {
            return NextResponse.json({ error: "Name and type are required." }, { status: 400 });
        }
        const existing = await prisma.category.findFirst({
            where: {
                name: { equals: name.trim() },
                userId: user.id,
            },
        });
        if (existing) {
            return NextResponse.json({ error: "Category already exists." }, { status: 409 });
        }
        const category = await prisma.category.create({
            data: {
                name: name.trim(),
                type,
                color,
                icon,
                isDefault: false,
                userId: user.id,
            },
        });
        return NextResponse.json({ category });
    }
    catch (error) {
        console.error("Create Category Error:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
