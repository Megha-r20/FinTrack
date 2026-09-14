import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { DEFAULT_CATEGORIES } from "@/lib/defaultCategories";

export async function POST(req: Request) {
  try {
    const { name, email, password, currency = "₹" } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        currency,
      },
    });

    // Seed default categories for new user
    for (const cat of DEFAULT_CATEGORIES) {
      await prisma.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          color: cat.color,
          icon: cat.icon,
          isDefault: true,
          userId: user.id,
        },
      });
    }

    // Welcome Notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to FinTrack!",
        message: "Start by logging your income and expenses or setting up monthly budgets.",
        type: "SYSTEM",
      },
    });

    const token = signToken({ userId: user.id, email: user.email, name: user.name });

    const response = NextResponse.json({
      message: "Account created successfully.",
      user: { id: user.id, name: user.name, email: user.email, currency: user.currency },
    });

    response.cookies.set("fintrack_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "An error occurred during registration." }, { status: 500 });
  }
}
