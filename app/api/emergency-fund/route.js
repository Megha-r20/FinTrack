import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const user = await requireAuthUser();

    const logs = await prisma.emergencyFundLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      balance: user.emergencyFundBalance || 0,
      percent: user.emergencyFundPercent || 5.0,
      logs,
    });
  } catch (error) {
    console.error("Fetch Emergency Fund Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { action, amount, percent, note } = body;

    let newBalance = user.emergencyFundBalance || 0;
    let newPercent = user.emergencyFundPercent || 5.0;

    if (action === "UPDATE_PERCENT" && percent !== undefined) {
      newPercent = Math.max(0, Math.min(50, parseFloat(percent)));
      await prisma.user.update({
        where: { id: user.id },
        data: { emergencyFundPercent: newPercent },
      });
      return NextResponse.json({ success: true, percent: newPercent, balance: newBalance });
    }

    if ((action === "DEPOSIT" || action === "WITHDRAW") && amount > 0) {
      const parsedAmt = parseFloat(amount);
      if (action === "DEPOSIT") {
        newBalance += parsedAmt;
      } else {
        if (parsedAmt > newBalance) {
          return NextResponse.json({ error: "Insufficient emergency reserve balance" }, { status: 400 });
        }
        newBalance -= parsedAmt;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { emergencyFundBalance: newBalance },
      });

      await prisma.emergencyFundLog.create({
        data: {
          userId: user.id,
          amount: parsedAmt,
          type: action,
          note: note || (action === "DEPOSIT" ? "Manual deposit into emergency reserve" : "Emergency withdrawal"),
        },
      });
    }

    return NextResponse.json({
      balance: newBalance,
      percent: newPercent,
    });
  } catch (error) {
    console.error("Emergency Fund Error:", error);
    return NextResponse.json({ error: "Failed to update emergency fund" }, { status: 500 });
  }
}
