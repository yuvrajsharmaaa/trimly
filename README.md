# Trimly — URL Shortener

A production-ready URL shortening service built with **Next.js 14** (App Router), **React**, **Supabase**, and **Tailwind CSS**.

## ✨ Features

- 🔗 Create short URLs instantly
- 🎯 Custom URL slugs
- 📊 Click tracking and analytics
- 📱 Responsive design
- 🌍 Device and location statistics
- ⚡ Server-side redirects for SEO
- 🎨 Modern UI with Radix UI components

## 🚀 Quick Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Supabase account (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/yuvrajsharmaaa/trimly.git
cd trimly
npm ci
```

### 2. Environment Setup

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

Create these tables in your Supabase project:

**`urls` table:**
```sql
CREATE TABLE urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_url TEXT UNIQUE,
  custom_url TEXT UNIQUE,
  original_url TEXT NOT NULL,
  title TEXT,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**`clicks` table:**
```sql
CREATE TABLE clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES urls(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Production Build

```bash
npm run build
npm start
```

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript + JavaScript
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Analytics**: Recharts
- **Deployment**: Vercel

## 🔧 Recent Fixes & Improvements

This project has been cleaned up and optimized for production:

### Fixed Issues:
- ✅ React forwardRef warning in Button component
- ✅ Environment variable naming (migrated from `VITE_*` to `NEXT_PUBLIC_*`)
- ✅ Middleware redirect using NextResponse
- ✅ TypeScript type errors in Card and Button components
- ✅ ESLint configuration for Next.js best practices
- ✅ Escaped HTML entities in JSX
- ✅ Production build compilation errors

### Removed:
- ❌ Incorrect `vercel.json` SPA rewrite (conflicted with Next.js routing)
- ❌ Unused Vite configuration files
- ❌ React Router dependencies (replaced with Next.js navigation)

### Optimizations:
- ⚡ Server-side redirects via middleware for better SEO
- ⚡ Proper TypeScript typing for UI components
- ⚡ Clean ESLint rules with warnings for non-critical issues
- ⚡ Memoized components to reduce unnecessary re-renders

## 📁 Project Structure

```
trimly/
├── app/                      # Next.js App Router pages
│   ├── [shortcode]/          # Dynamic short URL redirect
│   ├── dashboard/            # Main dashboard
│   ├── link/[id]/            # Link analytics page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── src/
│   ├── components/           # React components
│   │   ├── ui/               # Radix UI components
│   │   ├── create-link.jsx   # Link creation dialog
│   │   ├── device-stats.jsx  # Device analytics
│   │   └── location-stats.jsx # Geographic analytics
│   ├── db/                   # Supabase API functions
│   │   ├── apiUrls.js        # URL CRUD operations
│   │   ├── apiClicks.js      # Click tracking
│   │   └── superbase.js      # Supabase client
│   └── hooks/                # Custom React hooks
├── api/                      # Serverless API routes
├── middleware.js             # Next.js middleware for redirects
└── package.json
```

## 🚢 Deploying to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

Vercel will automatically detect Next.js and configure optimal settings.

## 📝 Usage

1. **Create a short link**: Click "Create New Link" on the dashboard
2. **Custom slugs**: Optionally provide a custom slug
3. **Track analytics**: Click on any link card to see detailed stats
4. **Share**: Copy the short URL and share it anywhere

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Built with ❤️ by Yuvraj Sharma**
