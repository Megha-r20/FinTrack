import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { DEFAULT_CATEGORIES } from "../lib/defaultCategories";

async function main() {
  console.log("🌱 Starting FinTrack database seeding...");

  // 1. Clean existing demo data if present
  const existingUser = await prisma.user.findUnique({
    where: { email: "demo@fintrack.com" },
  });

  if (existingUser) {
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // 2. Create Demo User
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Megha R",
      email: "demo@fintrack.com",
      passwordHash,
      currency: "₹",
    },
  });

  console.log(`👤 Created Demo User: ${user.email} (${user.id})`);

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

  console.log("🏷️ Created Category definitions.");

  // 4. Create Budgets for Current Month & Year
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const budgets = [
    { categoryName: "Food", amount: 10000 },
    { categoryName: "Transport", amount: 4000 },
    { categoryName: "Entertainment", amount: 3500 },
    { categoryName: "Shopping", amount: 6000 },
    { categoryName: "Bills", amount: 5000 },
    { categoryName: "Subscriptions", amount: 2000 },
  ];

  for (const b of budgets) {
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

  console.log("📊 Created Monthly Category Budgets.");

  // 5. Create Transactions across past 90 days
  const sampleTransactions = [
    // Income
    { cat: "Salary", amount: 95000, type: "INCOME", desc: "Monthly Salary Credit", method: "Bank Transfer", daysAgo: 1 },
    { cat: "Freelance", amount: 18500, type: "INCOME", desc: "UI/UX Design Contract", method: "UPI", daysAgo: 5 },
    { cat: "Investments", amount: 4200, type: "INCOME", desc: "Dividend payout", method: "Bank Transfer", daysAgo: 12 },
    { cat: "Salary", amount: 95000, type: "INCOME", desc: "Previous Month Salary Credit", method: "Bank Transfer", daysAgo: 31 },
    { cat: "Freelance", amount: 14000, type: "INCOME", desc: "Mobile App Consulting", method: "UPI", daysAgo: 38 },

    // Rent & Fixed Bills
    { cat: "Rent", amount: 22000, type: "EXPENSE", desc: "Apartment Rent Payment", method: "Bank Transfer", daysAgo: 2 },
    { cat: "Bills", amount: 2450, type: "EXPENSE", desc: "Electricity & Utility Bill", method: "UPI", daysAgo: 4 },
    { cat: "Bills", amount: 999, type: "EXPENSE", desc: "Airtel Fiber Broadband", method: "Credit Card", daysAgo: 6 },
    { cat: "Rent", amount: 22000, type: "EXPENSE", desc: "Last Month Apartment Rent", method: "Bank Transfer", daysAgo: 32 },

    // Food & Groceries
    { cat: "Food", amount: 1850, type: "EXPENSE", desc: "Whole Foods Weekly Groceries", method: "Credit Card", daysAgo: 3 },
    { cat: "Food", amount: 640, type: "EXPENSE", desc: "Dinner with team at Nando's", method: "UPI", daysAgo: 7 },
    { cat: "Food", amount: 420, type: "EXPENSE", desc: "Blue Tokai Coffee & Pastry", method: "UPI", daysAgo: 8 },
    { cat: "Food", amount: 2400, type: "EXPENSE", desc: "Supermarket Household Stockup", method: "Debit Card", daysAgo: 11 },
    { cat: "Food", amount: 890, type: "EXPENSE", desc: "Weekend Sushi Ordering", method: "UPI", daysAgo: 14 },
    { cat: "Food", amount: 1600, type: "EXPENSE", desc: "Organic Produce Delivery", method: "UPI", daysAgo: 18 },

    // Transport
    { cat: "Transport", amount: 450, type: "EXPENSE", desc: "Uber ride to Client Meeting", method: "UPI", daysAgo: 2 },
    { cat: "Transport", amount: 1800, type: "EXPENSE", desc: "Petrol Refill - Shell Station", method: "Credit Card", daysAgo: 9 },
    { cat: "Transport", amount: 350, type: "EXPENSE", desc: "Metro Pass Top-up", method: "UPI", daysAgo: 15 },

    // Shopping & Subscriptions
    { cat: "Shopping", amount: 3499, type: "EXPENSE", desc: "Nike Running Shoes", method: "Credit Card", daysAgo: 5 },
    { cat: "Shopping", amount: 1290, type: "EXPENSE", desc: "Tech Accessories & Cables", method: "UPI", daysAgo: 13 },
    { cat: "Subscriptions", amount: 649, type: "EXPENSE", desc: "Netflix 4K Premium Plan", method: "Credit Card", daysAgo: 3 },
    { cat: "Subscriptions", amount: 299, type: "EXPENSE", desc: "Spotify Family Subscription", method: "Credit Card", daysAgo: 10 },
    { cat: "Subscriptions", amount: 1499, type: "EXPENSE", desc: "ChatGPT Plus & AI Tools", method: "Credit Card", daysAgo: 16 },

    // Entertainment & Health
    { cat: "Entertainment", amount: 1200, type: "EXPENSE", desc: "IMAX Movie Tickets & Snacks", method: "UPI", daysAgo: 8 },
    { cat: "Entertainment", amount: 1800, type: "EXPENSE", desc: "Concert Ticket booking", method: "Credit Card", daysAgo: 22 },
    { cat: "Health", amount: 2500, type: "EXPENSE", desc: "Monthly Cult.fit Gym Membership", method: "Credit Card", daysAgo: 4 },
    { cat: "Health", amount: 750, type: "EXPENSE", desc: "Pharmacy Medicine Purchase", method: "UPI", daysAgo: 17 },
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
          notes: `Seeded entry for ${t.desc}`,
        },
      });
    }
  }

  console.log(`💸 Seeded ${sampleTransactions.length} sample transactions.`);

  // 6. Create Financial Goals
  const emergencyGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Emergency Reserve Fund",
      targetAmount: 150000,
      currentAmount: 85000,
      deadline: new Date(2026, 11, 31),
      category: "Savings",
      status: "IN_PROGRESS",
    },
  });

  await prisma.goalContribution.createMany({
    data: [
      { goalId: emergencyGoal.id, amount: 25000, note: "Initial seed deposit" },
      { goalId: emergencyGoal.id, amount: 30000, note: "Bonus allocation" },
      { goalId: emergencyGoal.id, amount: 30000, note: "Monthly savings transfer" },
    ],
  });

  const macbookGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: "MacBook Pro M3 Max",
      targetAmount: 220000,
      currentAmount: 140000,
      deadline: new Date(2026, 9, 31),
      category: "Gadgets",
      status: "IN_PROGRESS",
    },
  });

  await prisma.goalContribution.createMany({
    data: [
      { goalId: macbookGoal.id, amount: 70000, note: "Old laptop trade-in & savings" },
      { goalId: macbookGoal.id, amount: 70000, note: "Freelance project payment" },
    ],
  });

  await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Goa Annual Vacation",
      targetAmount: 45000,
      currentAmount: 45000,
      deadline: new Date(2026, 10, 15),
      category: "Travel",
      status: "COMPLETED",
    },
  });

  console.log("🎯 Created Financial Goals and Contributions.");

  // 7. Create Recurring Transactions
  const recurringItems = [
    { cat: "Rent", amount: 22000, type: "EXPENSE", freq: "MONTHLY", desc: "Apartment Rent", nextDays: 16 },
    { cat: "Subscriptions", amount: 649, type: "EXPENSE", freq: "MONTHLY", desc: "Netflix Subscription", nextDays: 27 },
    { cat: "Bills", amount: 999, type: "EXPENSE", freq: "MONTHLY", desc: "Airtel Broadband Internet", nextDays: 24 },
    { cat: "Salary", amount: 95000, type: "INCOME", freq: "MONTHLY", desc: "Primary Employer Salary", nextDays: 29 },
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
          paymentMethod: "Bank Transfer",
        },
      });
    }
  }

  console.log("🔄 Created Recurring Transactions.");

  // 8. Create Initial Welcome Notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Welcome to FinTrack!",
      message: "Your financial dashboard has been initialized with demo metrics and AI insights.",
      type: "SYSTEM",
    },
  });

  console.log("✅ FinTrack Database Seeding Complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
