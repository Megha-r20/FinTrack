import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const user = await requireAuthUser();
    const sharedExpenses = await prisma.sharedExpense.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const parsed = sharedExpenses.map((se) => ({
      ...se,
      participants: JSON.parse(se.participants || "[]"),
    }));

    return NextResponse.json({ sharedExpenses: parsed });
  } catch (error) {
    console.error("Fetch Shared Expenses Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { title, totalAmount, participants, notes, categoryId } = body;

    if (!title || !totalAmount || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { error: "Title, total amount, and participants are required." },
        { status: 400 }
      );
    }

    const numTotalPeople = participants.length + 1; // User + participants
    const calculatedMyShare = Math.round((parseFloat(totalAmount) / numTotalPeople) * 100) / 100;

    const sharedExpense = await prisma.sharedExpense.create({
      data: {
        userId: user.id,
        title,
        totalAmount: parseFloat(totalAmount),
        myShare: calculatedMyShare,
        participants: JSON.stringify(participants),
        status: "PENDING",
        notes,
      },
    });

    // Automatically record user's share as a transaction if categoryId provided
    if (categoryId) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          categoryId,
          amount: calculatedMyShare,
          type: "EXPENSE",
          classification: "DISCRETIONARY",
          isShared: true,
          date: new Date(),
          description: `My share for: ${title}`,
          paymentMethod: "UPI",
          notes: `Total bill: ${user.currency}${totalAmount} split with ${participants.map(p => p.name).join(", ")}`,
        },
      });
    }

    return NextResponse.json({
      sharedExpense: {
        ...sharedExpense,
        participants,
      },
    });
  } catch (error) {
    console.error("Create Shared Expense Error:", error);
    return NextResponse.json({ error: "Failed to create shared expense" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { id, status, participants } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (participants) updateData.participants = JSON.stringify(participants);

    const updated = await prisma.sharedExpense.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      sharedExpense: {
        ...updated,
        participants: JSON.parse(updated.participants || "[]"),
      },
    });
  } catch (error) {
    console.error("Update Shared Expense Error:", error);
    return NextResponse.json({ error: "Failed to update shared expense" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.sharedExpense.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Shared Expense Error:", error);
    return NextResponse.json({ error: "Failed to delete shared expense" }, { status: 500 });
  }
}
