import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET(req) {
    try {
        const user = await requireAuthUser();
        const { searchParams } = new URL(req.url);
        const now = new Date();
        const month = parseInt(searchParams.get("month") || (now.getMonth() + 1).toString(), 10);
        const year = parseInt(searchParams.get("year") || now.getFullYear().toString(), 10);
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0, 23, 59, 59);
        // Get user category budgets
        const budgets = await prisma.budget.findMany({
            where: {
                userId: user.id,
                month,
                year,
            },
            include: {
                category: true,
            },
        });
        // Compute actual spending for each category in this month
        const categorySpending = await prisma.transaction.groupBy({
            by: ["categoryId"],
            where: {
                userId: user.id,
                type: "EXPENSE",
                date: {
                    gte: firstDay,
                    lte: lastDay,
                },
            },
            _sum: {
                amount: true,
            },
        });
        const spendingMap = new Map();
        categorySpending.forEach((item) => {
            spendingMap.set(item.categoryId, item._sum.amount || 0);
        });
        const enrichedBudgets = budgets.map((b) => {
            const spent = spendingMap.get(b.categoryId) || 0;
            const remaining = b.amount - spent;
            const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
            return {
                id: b.id,
                categoryId: b.categoryId,
                categoryName: b.category.name,
                categoryColor: b.category.color,
                categoryIcon: b.category.icon,
                budgetAmount: b.amount,
                spentAmount: spent,
                remainingAmount: remaining,
                percentageUsed: percentage,
                status: percentage > 100 ? "EXCEEDED" : percentage >= 80 ? "WARNING" : "NORMAL",
            };
        });
        const totalBudgeted = enrichedBudgets.reduce((acc, curr) => acc + curr.budgetAmount, 0);
        const totalSpentInBudgets = enrichedBudgets.reduce((acc, curr) => acc + curr.spentAmount, 0);
        // Calculate safe pacing math for hostel students
        const totalDaysInMonth = new Date(year, month, 0).getDate();
        const currentDay = now.getMonth() + 1 === month && now.getFullYear() === year ? now.getDate() : 1;
        const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);
        const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));
        const totalRemaining = Math.max(0, totalBudgeted - totalSpentInBudgets);
        const safeDailyAllowance = Math.round(totalRemaining / daysRemaining);
        const safeWeeklyAllowance = Math.round(totalRemaining / weeksRemaining);
        return NextResponse.json({
            budgets: enrichedBudgets,
            month,
            year,
            summary: {
                totalBudgeted,
                totalSpentInBudgets,
                totalRemaining: totalBudgeted - totalSpentInBudgets,
                overallPercentage: totalBudgeted > 0 ? Math.round((totalSpentInBudgets / totalBudgeted) * 100) : 0,
                daysRemaining,
                weeksRemaining,
                safeDailyAllowance,
                safeWeeklyAllowance,
            },
        });
    }
    catch (error) {
        console.error("Fetch Budgets Error:", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
export async function POST(req) {
    try {
        const user = await requireAuthUser();
        const body = await req.json();
        const now = new Date();
        const targetMonth = body.month || now.getMonth() + 1;
        const targetYear = body.year || now.getFullYear();
        // Support bulk preset creation (e.g. Hostel Student ₹6,000 Template)
        if (body.bulk && Array.isArray(body.items)) {
            const results = [];
            for (const item of body.items) {
                let category = await prisma.category.findFirst({
                    where: {
                        name: { equals: item.categoryName.trim() },
                        OR: [{ userId: user.id }, { isDefault: true }],
                    },
                });
                if (!category) {
                    category = await prisma.category.create({
                        data: {
                            name: item.categoryName.trim(),
                            type: "EXPENSE",
                            color: item.color || "#6366f1",
                            icon: item.icon || "Tag",
                            userId: user.id,
                        },
                    });
                }
                const b = await prisma.budget.upsert({
                    where: {
                        userId_categoryId_month_year: {
                            userId: user.id,
                            categoryId: category.id,
                            month: targetMonth,
                            year: targetYear,
                        },
                    },
                    update: { amount: parseFloat(item.amount) },
                    create: {
                        userId: user.id,
                        categoryId: category.id,
                        amount: parseFloat(item.amount),
                        month: targetMonth,
                        year: targetYear,
                    },
                });
                results.push(b);
            }
            return NextResponse.json({ success: true, count: results.length });
        }
        // Single item budget creation/update
        const { categoryId, amount, month, year } = body;
        if (!categoryId || amount === undefined) {
            return NextResponse.json({ error: "Category ID and budget amount are required." }, { status: 400 });
        }
        const budget = await prisma.budget.upsert({
            where: {
                userId_categoryId_month_year: {
                    userId: user.id,
                    categoryId,
                    month: targetMonth,
                    year: targetYear,
                },
            },
            update: {
                amount: parseFloat(amount),
            },
            create: {
                userId: user.id,
                categoryId,
                amount: parseFloat(amount),
                month: targetMonth,
                year: targetYear,
            },
            include: {
                category: true,
            },
        });
        return NextResponse.json({ budget });
    }
    catch (error) {
        console.error("Set Budget Error:", error);
        return NextResponse.json({ error: "Failed to set budget" }, { status: 500 });
    }
}
