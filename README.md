# ROI AI-Powered Trading Platform

A high-performance Next.js 16+ web application integrated with Supabase for simulated AI trading, real-time earnings accumulation, deposits/withdrawals processing, referral structures, and multi-site configuration support.

## 📂 Project Overview

- **Core concept**: Users sign up, simulate investments with HSL-tailored premium dashboards, watch earnings grow in real time based on selected ROI packages, and request deposits and withdrawals using Easypaisa, JazzCash, or Cryptocurrencies.
- **Backend Stack**: Supabase (PostgreSQL with custom PL/pgSQL triggers, security-definer RPCs, Row Level Security policies, and audit logs).
- **Frontend Stack**: Next.js 16+ App Router, Vanilla CSS with curated dark glassmorphism styling, and custom hooks.

---

## 🛠️ Directory Structure

```text
├── .next/                  # Next.js build cache
├── app/                    # Next.js App Router pages, APIs, and routes
│   ├── api/                # Route handlers (auth, locations, etc.)
│   ├── auth/               # Login, Register, and recovery pages
│   ├── dashboard/          # Premium user/admin dashboard interface
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main landing page
├── components/             # Reusable UI components (Navbar, Sidebar, Charts)
├── config/                 # Configuration and settings templates
├── hooks/                  # React custom hooks (useAuth, useSession)
├── lib/                    # Shared utilities, API clients (supabase client)
├── public/                 # Static assets (images, icons, fonts)
├── styles/                 # Custom Vanilla CSS files & global styling rules
├── supabase/               # Database schemas, RPC functions, and migrations
│   ├── migrations/         # Sequential database schema migration scripts
│   └── config.toml         # Supabase CLI configuration
├── utils/                  # Utility helpers
└── package.json            # NPM dependencies & scripts
```

---

## 🚀 Setup & Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

3. **Apply Database Migrations**:
   Using Supabase CLI:
   ```bash
   npx supabase db push
   ```
   Or manually execute SQL scripts from `supabase/migrations/` sequentially inside your Supabase Studio SQL Editor.

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## 🔐 Database Fixes & Maintenance

If you experience issues where new users are registered in `auth.users` but their corresponding records are missing from `public.users`:
- Run the migration script `supabase/migrations/026_fix_signup_trigger_referral_conflict.sql` in your Supabase SQL Editor.
- This fixes unique constraints conflict when `auth.users` is deleted and recreated (re-signs up), and resolves missing `site_id` columns in referral creations.

---

<!--
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
-->
