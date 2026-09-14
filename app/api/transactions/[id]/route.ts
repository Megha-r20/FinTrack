import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthUser();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Transaction not found or forbidden." }, { status: 404 });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(body.amount && { amount: parseFloat(body.amount) }),
        ...(body.type && { type: body.type }),
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.date && { date: new Date(body.date) }),
        ...(body.description && { description: body.description.trim() }),
        ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ transaction: updated });
  } catch (error) {
    console.error("Update Transaction Error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthUser();
    const { id } = await params;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Transaction not found or forbidden." }, { status: 404 });
    }

    await prisma.transaction.delete({ where: { id } });

    return NextResponse.json({ message: "Transaction deleted successfully." });
  } catch (error) {
    console.error("Delete Transaction Error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
