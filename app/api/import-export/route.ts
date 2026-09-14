import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuthUser();

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    const exportData = transactions.map((t) => ({
      ID: t.id,
      Date: t.date.toISOString().split("T")[0],
      Type: t.type,
      Category: t.category.name,
      Amount: t.amount,
      Description: t.description,
      PaymentMethod: t.paymentMethod,
      Notes: t.notes || "",
    }));

    return NextResponse.json({
      filename: `fintrack_transactions_${new Date().toISOString().split("T")[0]}.csv`,
      data: exportData,
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthUser();
    const { rows } = await req.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided for import." }, { status: 400 });
    }

    // Get user categories
    const userCategories = await prisma.category.findMany({
      where: { OR: [{ userId: user.id }, { isDefault: true }] },
    });

    const categoryMap = new Map<string, string>();
    userCategories.forEach((c) => categoryMap.set(c.name.toLowerCase(), c.id));

    // Fallback category
    let defaultOtherCat = userCategories.find((c) => c.name.toLowerCase() === "other")?.id;
    if (!defaultOtherCat && userCategories.length > 0) {
      defaultOtherCat = userCategories[0].id;
    }

    const importedRecords = [];
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      const dateStr = row.Date || row.date;
      const typeStr = (row.Type || row.type || "EXPENSE").toString().toUpperCase();
      const catStr = (row.Category || row.category || "Other").toString().trim();
      const amountVal = parseFloat(row.Amount || row.amount);
      const descStr = (row.Description || row.description || "Imported Transaction").toString().trim();
      const paymentMethod = row.PaymentMethod || row.paymentMethod || "UPI";
      const notes = row.Notes || row.notes || "Imported via CSV";

      if (isNaN(amountVal) || amountVal <= 0) {
        errors.push({ row: rowNum, error: `Invalid amount "${row.Amount || row.amount}"` });
        continue;
      }

      if (!dateStr || isNaN(Date.parse(dateStr))) {
        errors.push({ row: rowNum, error: `Invalid date "${dateStr}"` });
        continue;
      }

      let categoryId = categoryMap.get(catStr.toLowerCase()) || defaultOtherCat;

      if (!categoryId) {
        // Create new custom category automatically
        const newCat = await prisma.category.create({
          data: {
            name: catStr,
            type: typeStr === "INCOME" ? "INCOME" : "EXPENSE",
            color: "#64748b",
            icon: "Tag",
            userId: user.id,
          },
        });
        categoryId = newCat.id;
        categoryMap.set(catStr.toLowerCase(), newCat.id);
      }

      importedRecords.push({
        userId: user.id,
        amount: amountVal,
        type: typeStr === "INCOME" ? "INCOME" : "EXPENSE",
        categoryId,
        date: new Date(dateStr),
        description: descStr,
        paymentMethod,
        notes,
      });
    }

    if (importedRecords.length > 0) {
      await prisma.transaction.createMany({
        data: importedRecords,
      });
    }

    return NextResponse.json({
      successCount: importedRecords.length,
      errorCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: "Failed to import CSV transactions" }, { status: 500 });
  }
}
