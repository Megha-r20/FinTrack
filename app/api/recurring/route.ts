import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuthUser();

    const recurring = await prisma.recurringTransaction.findMany({
      where: { userId: user.id },
      include: {
        category: true,
      },
      orderBy: { nextDueDate: "asc" },
    });

    const now = new Date();
    const enriched = recurring.map((item) => {
      const diffTime = item.nextDueDate.getTime() - now.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...item,
        daysUntilDue: daysUntil,
        isDueSoon: daysUntil <= 7 && daysUntil >= 0,
        isOverdue: daysUntil < 0,
      };
    });

    return NextResponse.json({ recurring: enriched });
  } catch (error) {
    console.error("Fetch Recurring Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthUser();
    const { amount, type, categoryId, frequency, description, nextDueDate, paymentMethod = "Bank Transfer" } = await req.json();

    if (!amount || !type || !categoryId || !frequency || !description || !nextDueDate) {
      return NextResponse.json({ error: "Amount, type, category, frequency, description, and next due date are required." }, { status: 400 });
    }

    const item = await prisma.recurringTransaction.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        type,
        categoryId,
        frequency,
        startDate: new Date(),
        nextDueDate: new Date(nextDueDate),
        description: description.trim(),
        paymentMethod,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ recurring: item });
  } catch (error) {
    console.error("Create Recurring Error:", error);
    return NextResponse.json({ error: "Failed to create recurring transaction" }, { status: 500 });
  }
}
