import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { DEFAULT_CATEGORIES } from "../lib/defaultCategories";

async function main() {
  console.log("🌱 Starting FinTrack database seeding for Hostel Student Persona...");

  // 1. Clean existing demo data if present
  const existingUser = await prisma.user.findUnique({
    where: { email: "demo@fintrack.com" },
  });

  if (existingUser) {
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // 2. Create Demo Hostel Student User
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Megha R",
      email: "demo@fintrack.com",
      passwordHash,
      currency: "₹",
    },
  });

  console.log(`👤 Created Demo Hostel Student User: ${user.email} (${user.id})`);

  // 3. Create Categories
  const categoryMap: Record<string, string> = {};

  for (const cat of DEFAULT_CATEGORIES) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        isDefault: true,
        userId: user.id,
      },
    });
    categoryMap[cat.name] = createdCat.id;
  }

  console.log("🏷️ Created Hostel Category definitions.");

  // 4. Create Budgets for Current Month (Total ₹6,000 Hostel Allowance)
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const hostelBudgets = [
    { categoryName: "Snacks & Mess Outings", amount: 1500 },
    { categoryName: "Transport", amount: 800 },
    { categoryName: "Mobile & Data Recharge", amount: 300 },
    { categoryName: "Personal Care & Toiletries", amount: 500 },
    { categoryName: "Entertainment", amount: 600 },
    { categoryName: "Education", amount: 500 },
    { categoryName: "Emergency Fund", amount: 800 },
    { categoryName: "Shopping", amount: 1000 },
  ];

  for (const b of hostelBudgets) {
    if (categoryMap[b.categoryName]) {
      await prisma.budget.create({
        data: {
          userId: user.id,
          categoryId: categoryMap[b.categoryName],
          amount: b.amount,
          month: currentMonth,
          year: currentYear,
        },
      });
    }
  }

  console.log("📊 Created ₹6,000 Hostel Category Budgets.");

  // 5. Create Transactions reflecting realistic hostel student spending
  const sampleTransactions = [
    // Monthly Allowance Income
    { cat: "Pocket Money / Allowance", amount: 6000, type: "INCOME", desc: "Monthly Hostel Allowance from Home", method: "Bank Transfer", daysAgo: 1 },
    { cat: "Pocket Money / Allowance", amount: 6000, type: "INCOME", desc: "Previous Month Hostel Allowance", method: "Bank Transfer", daysAgo: 31 },

    // Discretionary Hostel Expenses
    { cat: "Snacks & Mess Outings", amount: 180, type: "EXPENSE", desc: "Canteen Tea & Samosa with hostel friends", method: "UPI", daysAgo: 1 },
    { cat: "Snacks & Mess Outings", amount: 340, type: "EXPENSE", desc: "Late-night Swiggy Pizza with roommates", method: "UPI", daysAgo: 3 },
    { cat: "Snacks & Mess Outings", amount: 220, type: "EXPENSE", desc: "Cold Coffee & Maggi at Campus Canteen", method: "UPI", daysAgo: 6 },
    { cat: "Transport", amount: 120, type: "EXPENSE", desc: "Auto fare to Railway Station", method: "UPI", daysAgo: 2 },
    { cat: "Transport", amount: 250, type: "EXPENSE", desc: "City Bus Pass Monthly Renewal", method: "UPI", daysAgo: 5 },
    { cat: "Mobile & Data Recharge", amount: 299, type: "EXPENSE", desc: "Jio 2GB/day Monthly Data Recharge", method: "UPI", daysAgo: 4 },
    { cat: "Personal Care & Toiletries", amount: 380, type: "EXPENSE", desc: "Shampoo, Soap & Toothpaste from Store", method: "UPI", daysAgo: 7 },
    { cat: "Education", amount: 450, type: "EXPENSE", desc: "Engineering Lab Notes Printouts & Notebooks", method: "UPI", daysAgo: 8 },
    { cat: "Entertainment", amount: 250, type: "EXPENSE", desc: "Hostel Weekend Movie Ticket", method: "UPI", daysAgo: 9 },
    { cat: "Shopping", amount: 650, type: "EXPENSE", desc: "College Department Hoodie", method: "UPI", daysAgo: 11 },
    { cat: "Emergency Fund", amount: 500, type: "EXPENSE", desc: "Monthly Emergency Reserve Deposit", method: "Bank Transfer", daysAgo: 12 },
  ];

  for (const t of sampleTransactions) {
    const txDate = new Date();
    txDate.setDate(txDate.getDate() - t.daysAgo);

    if (categoryMap[t.cat]) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          categoryId: categoryMap[t.cat],
          amount: t.amount,
          type: t.type,
          date: txDate,
          description: t.desc,
          paymentMethod: t.method,
          notes: `Hostel student entry for ${t.desc}`,
        },
      });
    }
  }

  console.log(`💸 Seeded ${sampleTransactions.length} hostel transactions.`);

  // 6. Create Student Financial Goals
  const laptopGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Semester Project Laptop Savings",
      targetAmount: 45000,
      currentAmount: 28000,
      deadline: new Date(2026, 11, 31),
      category: "Education",
      status: "IN_PROGRESS",
    },
  });

  await prisma.goalContribution.createMany({
    data: [
      { goalId: laptopGoal.id, amount: 14000, note: "Stipend savings contribution" },
      { goalId: laptopGoal.id, amount: 14000, note: "Birthday gift allocation" },
    ],
  });

  await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Hostel Group Trip Reserve",
      targetAmount: 5000,
      currentAmount: 3500,
      deadline: new Date(2026, 10, 15),
      category: "Travel",
      status: "IN_PROGRESS",
    },
  });

  console.log("🎯 Created Student Financial Goals.");

  // 7. Create Recurring Transactions for Hostel Student
  const recurringItems = [
    { cat: "Pocket Money / Allowance", amount: 6000, type: "INCOME", freq: "MONTHLY", desc: "Monthly Hostel Allowance from Parents", nextDays: 29 },
    { cat: "Mobile & Data Recharge", amount: 299, type: "EXPENSE", freq: "MONTHLY", desc: "Jio Data Recharge", nextDays: 26 },
    { cat: "Entertainment", amount: 59, type: "EXPENSE", freq: "MONTHLY", desc: "Spotify Student Subscription", nextDays: 24 },
  ];

  for (const r of recurringItems) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + r.nextDays);

    if (categoryMap[r.cat]) {
      await prisma.recurringTransaction.create({
        data: {
          userId: user.id,
          categoryId: categoryMap[r.cat],
          amount: r.amount,
          type: r.type,
          frequency: r.freq,
          startDate: new Date(),
          nextDueDate: nextDate,
          description: r.desc,
          paymentMethod: "UPI",
        },
      });
    }
  }

  console.log("🔄 Created Student Recurring Transactions.");

  // 8. Create Welcome Notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Welcome to FinTrack Hostel Edition!",
      message: "Your dashboard is configured for your ₹6,000 monthly hostel budget with safe daily & weekly allowance tracking.",
      type: "SYSTEM",
    },
  });

  console.log("✅ FinTrack Hostel Student Database Seeding Complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
