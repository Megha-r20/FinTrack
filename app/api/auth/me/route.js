import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET() {
    try {
        const user = await requireAuthUser();
        return NextResponse.json({ user });
    }
    catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
export async function PUT(req) {
    try {
        const sessionUser = await requireAuthUser();
        const { name, currency } = await req.json();
        const updated = await prisma.user.update({
            where: { id: sessionUser.id },
            data: {
                ...(name && { name }),
                ...(currency && { currency }),
            },
            select: { id: true, name: true, email: true, currency: true },
        });
        return NextResponse.json({ user: updated });
    }
    catch (error) {
        console.error("Update Profile Error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
