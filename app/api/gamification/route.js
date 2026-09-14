import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const user = await requireAuthUser();

    // Default badge catalog
    const badgeCatalog = [
      {
        badgeId: "PACING_MASTER",
        title: "Pacing Master",
        description: "Stayed under safe daily spend limit for 5 consecutive days",
        icon: "Flame",
        reqStreak: 5,
      },
      {
        badgeId: "HOSTEL_HERO",
        title: "Hostel Hero",
        description: "Managed monthly spending strictly under ₹6,000 allowance",
        icon: "Award",
        reqStreak: 10,
      },
      {
        badgeId: "SAFETY_FIRST",
        title: "Safety Shield",
        description: "Deposited funds into Emergency Reserve Bucket",
        icon: "ShieldCheck",
        reqStreak: 1,
      },
      {
        badgeId: "SAVINGS_CHAMPION",
        title: "Savings Champion",
        description: "Completed a custom 30-day savings challenge",
        icon: "Trophy",
        reqStreak: 14,
      },
    ];

    // Fetch user unlocked badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: user.id },
    });

    const unlockedBadgeIds = new Set(userBadges.map((b) => b.badgeId));

    // Check emergency fund deposit badge auto unlock
    if (!unlockedBadgeIds.has("SAFETY_FIRST") && (user.emergencyFundBalance || 0) > 0) {
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: "SAFETY_FIRST",
          title: "Safety Shield",
          description: "Deposited funds into Emergency Reserve Bucket",
          icon: "ShieldCheck",
        },
      });
      unlockedBadgeIds.add("SAFETY_FIRST");
    }

    const badges = badgeCatalog.map((badge) => ({
      ...badge,
      isUnlocked: unlockedBadgeIds.has(badge.badgeId),
    }));

    return NextResponse.json({
      currentStreak: user.currentStreak || 7, // Default demo streak if 0
      bestStreak: Math.max(user.bestStreak || 12, user.currentStreak || 7),
      badges,
    });
  } catch (error) {
    console.error("Fetch Gamification Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
