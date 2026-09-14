import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET(req) {
    try {
        const user = await requireAuthUser();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const type = searchParams.get("type") || "ALL"; // ALL | INCOME | EXPENSE
        const categoryId = searchParams.get("categoryId") || "";
        const period = searchParams.get("period") || "ALL"; // ALL | THIS_WEEK | THIS_MONTH | LAST_MONTH | LAST_3_MONTHS | THIS_YEAR | CUSTOM
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");
        const sortBy = searchParams.get("sortBy") || "date"; // date | amount
        const sortOrder = searchParams.get("sortOrder") || "desc"; // asc | desc
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const where = { userId: user.id };
        if (type !== "ALL") {
            where.type = type;
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (search) {
            where.OR = [
                { description: { contains: search } },
                { notes: { contains: search } },
                { category: { name: { contains: search } } },
            ];
        }
        // Date filtering logic
        const now = new Date();
        if (period === "THIS_WEEK") {
            const day = now.getDay();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0, 0);
            where.date = { gte: firstDay };
        }
        else if (period === "THIS_MONTH") {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            where.date = { gte: firstDay };
        }
        else if (period === "LAST_MONTH") {
            const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
            const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            where.date = { gte: firstDay, lte: lastDay };
        }
        else if (period === "LAST_3_MONTHS") {
            const firstDay = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0, 0);
            where.date = { gte: firstDay };
        }
        else if (period === "THIS_YEAR") {
            const firstDay = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
            where.date = { gte: firstDay };
        }
        else if (period === "CUSTOM" && startDateParam && endDateParam) {
            where.date = {
                gte: new Date(startDateParam),
                lte: new Date(endDateParam),
            };
        }
        const total = await prisma.transaction.count({ where });
        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                category: {
                    select: { id: true, name: true, color: true, icon: true },
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        return NextResponse.json({
            transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("Fetch Transactions Error:", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
export async function POST(req) {
    try {
        const user = await requireAuthUser();
        const { amount, type, categoryId, date, description, paymentMethod = "UPI", notes } = await req.json();
        if (!amount || !type || !categoryId || !description) {
            return NextResponse.json({ error: "Amount, type, category, and description are required." }, { status: 400 });
        }
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 });
        }
        // Verify category belongs to user or is a default category to prevent cross-tenant data pollution
        const validCategory = await prisma.category.findFirst({
            where: {
                id: categoryId,
                OR: [{ userId: user.id }, { isDefault: true }],
            },
        });
        if (!validCategory) {
            return NextResponse.json({ error: "Invalid category selected." }, { status: 400 });
        }
        const transaction = await prisma.transaction.create({
            data: {
                userId: user.id,
                amount: parseFloat(amount),
                type,
                categoryId: validCategory.id,
                date: date ? new Date(date) : new Date(),
                description: description.trim(),
                paymentMethod,
                notes: notes ? notes.trim() : null,
            },
            include: {
                category: true,
            },
        });
        return NextResponse.json({ transaction });
    }
    catch (error) {
        console.error("Create Transaction Error:", error);
        return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
    }
}
