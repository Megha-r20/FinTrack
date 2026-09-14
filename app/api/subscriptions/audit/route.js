import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const user = await requireAuthUser();

    const recurring = await prisma.recurringTransaction.findMany({
      where: { userId: user.id, isActive: true },
      include: { category: true },
    });

    const recentExpenses = await prisma.transaction.findMany({
      where: { userId: user.id, type: "EXPENSE" },
      orderBy: { date: "desc" },
      take: 50,
    });

    const potentialDiscounts = [
      { name: "Spotify Music", keyword: "spotify", fullPrice: 119, studentPrice: 59, monthlySavings: 60, url: "https://spotify.com/student" },
      { name: "YouTube Premium", keyword: "youtube", fullPrice: 149, studentPrice: 79, monthlySavings: 70, url: "https://youtube.com/premium/student" },
      { name: "Apple Music", keyword: "apple music", fullPrice: 109, studentPrice: 59, monthlySavings: 50, url: "https://apple.com/student" },
      { name: "Amazon Prime", keyword: "prime", fullPrice: 299, studentPrice: 149, monthlySavings: 150, url: "https://amazon.in/prime/student" },
      { name: "Mobile Data Plan", keyword: "recharge", fullPrice: 399, studentPrice: 299, monthlySavings: 100, url: "https://unidays.com" },
    ];

    const detectedSubscriptions = [];
    let totalPotentialMonthlySavings = 0;

    potentialDiscounts.forEach((item) => {
      const match =
        recurring.find((r) => r.description.toLowerCase().includes(item.keyword)) ||
        recentExpenses.find((e) => e.description.toLowerCase().includes(item.keyword));

      if (match) {
        detectedSubscriptions.push({
          ...item,
          currentCost: match.amount || item.fullPrice,
        });
        totalPotentialMonthlySavings += item.monthlySavings;
      }
    });

    // If no specific keyword matched, include default top student recommendations for demo
    if (detectedSubscriptions.length === 0) {
      detectedSubscriptions.push(potentialDiscounts[0]);
      detectedSubscriptions.push(potentialDiscounts[3]);
      totalPotentialMonthlySavings = 210;
    }

    return NextResponse.json({
      detectedSubscriptions,
      totalPotentialMonthlySavings,
    });
  } catch (error) {
    console.error("Subscription Audit Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
