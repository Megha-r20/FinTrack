# FinTrack - Personal Expense Tracker & Workspace Financial Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)](#license)

**FinTrack** is a production-grade, privacy-focused personal expense tracker and shared financial workspace manager. Built with Next.js 16 App Router, Prisma ORM, and SQLite database persistence, FinTrack simplifies daily money management, household/shared hostel expense splitting, recurring bill tracking, and AI-powered financial advisory.

---

## 🌟 Key Features

### 📊 Expense & Income Management
* **Real-Time Transaction Logging**: Track daily income and expenses with categories, descriptions, amounts, payment methods, and dates.
* **Category Budgeting**: Set monthly spending limits per category with dynamic progress indicators and instant overspending warnings.
* **Search & Filters**: Multi-criteria search by date range, category, payment type, or keyword.

### 👥 Shared Workspaces & Household Splitting
* **Multi-Member Workspaces**: Create or join shared workspaces (e.g. household, roommates, trip budgets) using unique invite codes.
* **Workspace Administration**: Full edit, deletion, and member management controls for workspace owners.
* **Role-Based Controls**: Easily switch between personal finance and shared team/roommate workspaces.

### 💬 WhatsApp Expense Tracking Bot
* **Instant WhatsApp Logging**: Log expenses directly via WhatsApp text messages (e.g. `Lunch $15` or `Uber $22`).
* **Secure Bot Webhooks**: Connect your WhatsApp bot token to FinTrack's `/api/bot/webhook` API for zero-friction mobile expense entry.

### 🤖 AI Financial Advisor
* **Smart Budget Insights**: Receive automated, personalized financial recommendations based on monthly spending habits.
* **Interactive AI Assistant**: Chat with the FinTrack AI Advisor to get tips on debt reduction, budget allocation, and savings optimization.

### 🎯 Financial Goals & Savings Tracking
* **Savings Goal Milestone Progress**: Set custom financial targets (e.g., Emergency Fund, Vacation, New Laptop) with target dates.
* **Contribution Tracking**: Log direct payments toward goals and monitor visual progress bars.

### 🔄 Recurring Bills & Subscriptions
* **Subscription Audit**: Audit active monthly subscriptions (Netflix, Spotify, Cloud Storage) to detect unused or duplicate expenses.
* **Recurring Income/Bills**: Schedule automated reminders for rent, utilities, and salary deposits.

### 🔐 Privacy & Security
* **App Lock Overlay**: Protect sensitive financial data with PIN lock security and automatic inactivity timeout.
* **Local Database Storage**: Full data privacy powered by Prisma ORM and SQLite (`dev.db`).

### 🌙 Dark Mode & Responsive UI
* **Custom Theme Engine**: Seamless toggle between sleek Dark Mode (`#141010` / `#810100`) and Light Mode (`#FAF8F5`).
* **Mobile First Design**: Fully responsive navigation drawer and floating quick-add action modal.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
* **Frontend**: [React 19](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)
* **Charts & Visuals**: [Recharts](https://recharts.org/)
* **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with [SQLite](https://sqlite.org/)
* **Authentication**: JWT-based auth with React Context Provider (`AuthContext.jsx`)
* **State Management**: React Context (`ThemeContext`, `ToastContext`, `AuthContext`)

---

## 📁 Project Structure

```text
fintrack/
├── app/
│   ├── (auth)/             # Login and Register pages
│   ├── (dashboard)/        # Main dashboard, transactions, budgets, goals, analytics
│   ├── api/                # Production Next.js API route handlers
│   │   ├── auth/           # Login, register, me, logout endpoints
│   │   ├── transactions/   # CRUD endpoints for income/expenses
│   │   ├── workspaces/     # Workspace CRUD, join, switch handlers
│   │   ├── bot/            # WhatsApp webhook & token management
│   │   └── ai/             # AI Advisor & savings forecast APIs
│   ├── favicon.ico         # App tab favicon
│   ├── icon.png            # FinTrack logo tab icon
│   ├── layout.jsx          # Root layout with fonts, metadata & providers
│   └── page.jsx            # Modern landing page
├── components/             # Reusable UI components
│   ├── Sidebar.jsx         # Navigation sidebar drawer
│   ├── Navbar.jsx          # Header with workspace switcher & theme toggle
│   ├── Logo.jsx             # FinTrack brand logo component
│   ├── WorkspaceSwitcher.jsx# Workspace management modal
│   └── AppLockOverlay.jsx  # PIN lock screen overlay
├── context/                # Auth, Theme, and Toast React Contexts
├── prisma/                 # Prisma database schema & dev.db database
│   └── schema.prisma
├── public/                 # Static brand assets, logo, manifest.json
├── dist/                   # Production build distribution output
├── next.config.js          # Next.js configuration
└── package.json            # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.17.0` or higher
* **npm**: `v9.0.0` or higher

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Megha-r20/FinTrack.git
   cd fintrack
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup (Prisma & SQLite)**
   Sync the database schema with your local SQLite database:
   ```bash
   npx prisma db push
   ```

4. **Environment Configuration**
   Create a `.env` file in the root directory (or use default configuration):
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="fintrack_production_jwt_secret_key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Build for Production**
   To compile the production bundle into the `dist/` directory:
   ```bash
   npm run build
   ```

---

## 💬 Setting Up WhatsApp Expense Bot

1. Open **FinTrack Dashboard** and navigate to **Profile & Settings** > **WhatsApp Integration**.
2. Generate your unique **WhatsApp Access Token**.
3. Point your WhatsApp Webhook provider (e.g. Twilio or Meta WhatsApp Business API) to:
   ```text
   POST https://your-domain.com/api/bot/webhook
   ```
4. Start texting expenses directly to your bot number:
   - `Coffee $4.50`
   - `Groceries 120`
   - `Salary 3500`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
