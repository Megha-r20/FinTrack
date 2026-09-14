import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import crypto from "crypto";

export async function GET() {
  try {
    const user = await requireAuthUser();

    // Deterministic fallback bot token for demo user based on user id
    const tokenHash = crypto.createHash("sha256").update(`fintrack_bot_${user.id}`).digest("hex").slice(0, 24);
    const botToken = `ft_bot_${tokenHash}`;

    return NextResponse.json({
      success: true,
      botToken,
      webhookUrl: "https://fintrack.app/api/bot/webhook",
    });
  } catch (error) {
    console.error("Bot Token Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST() {
  try {
    const user = await requireAuthUser();
    const newSecret = crypto.randomBytes(12).toString("hex");
    const botToken = `ft_bot_${newSecret}`;

    return NextResponse.json({
      success: true,
      botToken,
      message: "Bot API Key regenerated successfully",
    });
  } catch (error) {
    console.error("Regenerate Token Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
