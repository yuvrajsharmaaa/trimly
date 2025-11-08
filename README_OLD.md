# URL Shortener

A modern URL shortening service built with React, Vite, and Supabase. Create short, custom URLs and track their performance with detailed analytics.

## Features

- 🔗 Create short URLs instantly
- 🎯 Custom URL slugs
- 📊 Track clicks and analytics
- 👤 User authentication
- 📱 Responsive design
- 🌐 Device and location statistics
# Trimly – URL Shortener

A modern, production‑ready URL shortening service built with React, Vite, and Supabase. Create short, custom URLs and track their performance with lightweight analytics.

This README includes a detailed, academically styled explanation of the Data Structures and Algorithms (DAA) used in the project, with rationale, complexity, and examples.

## Features

- 🔗 Create short URLs instantly
- 🎯 Custom URL slugs
- 📊 Click tracking and lightweight analytics
- 📱 Responsive design
- 🌐 Device and location hints (best‑effort)

## Tech Stack

- Frontend: React + Vite
- UI: shadcn/ui, Tailwind CSS
- Backend: Supabase (PostgreSQL)
- Hosting: Vercel (static frontend + serverless redirect function)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Supabase project (free tier is fine)

### Installation

1) Clone and install

```bash
git clone https://github.com/yuvrajsharmaaa/trimly.git
cd trimly
npm install
```

2) Create `.env.local` in the project root

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3) Run locally

```bash
npm run dev
```

App will be available at http://localhost:5173

## Environment & Database Setup

Create two tables in Supabase:

- `urls(id uuid pk, short_url text unique, custom_url text unique, original_url text not null, clicks int default 0, created_at timestamptz default now())`
- `clicks(id uuid pk, url_id uuid references urls(id), ip_address text, user_agent text, referrer text, country text, created_at timestamptz default now())`

Row‑Level Security (RLS): for this public demo, permissive policies allow public SELECT/INSERT/UPDATE/DELETE on `urls` and SELECT/INSERT on `clicks`. For production, tighten policies as needed.

---

## Data Structures and Algorithms (DAA)

This section explains the core DSA choices, how they support functionality, and why they were selected. It is written for clarity and academic review.

### 1) LRU Cache with TTL (client API layer)

- Data structure: JavaScript `Map` used as a bounded LRU cache with per‑entry TTL.
- Purpose: Reduce repeat DB reads for hot entries (e.g., recent short‑code lookups and dashboard lists), lowering latency and cost.
- Why `Map`: It preserves insertion order, enabling O(1) amortized eviction of the oldest (least‑recently used) key.
- Operations (average case):
   - get(key): O(1). If found and not expired, re‑insert to refresh recency and return value; drop if expired.
   - set(key, value): O(1). Insert, then evict the LRU key if over capacity.
   # Trimly — URL Shortener (Next.js)

   This repository contains a Next.js app (app router) that implements a URL shortener with Supabase.

   Quick setup

   1. Clone and install

   ```bash
   git clone https://github.com/yuvrajsharmaaa/trimly.git
   cd trimly
   npm ci
   ```

   2. Create an environment file `.env.local` in the project root with your Supabase credentials:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   3. Run locally

   ```bash
   npm run dev
   # open http://localhost:3000
   ```

   Production

   ```bash
   npm run build
   npm start
   ```

   Notes
   - This project uses Next.js (not Vite). I removed an SPA-style `vercel.json` rewrite that conflicted with Next routing.
   - If you want a Vite-based frontend, we can extract the UI into a Vite project later.

   If you want, I can now tidy unused files and improve folder structure (small, safe changes).
- Expected complexity: O(1) attempts with large keyspace; worst case bounded by N.
