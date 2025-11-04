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
   - eviction: O(1). Delete the first key from `map.keys()` iterator.
- TTL: Each entry records an expiry timestamp; stale entries are lazily cleaned on access.

Pseudocode (sketch):

```pseudo
class LRU(capacity, ttlMs):
   map := Map()
   get(k):
      if not map.has(k): return null
      (v, exp) := map.get(k)
      if now()>exp: map.delete(k); return null
      map.delete(k); map.set(k,(v,exp)) // refresh recency
      return v
   set(k,v):
      if map.has(k): map.delete(k)
      map.set(k,(v,now()+ttlMs))
      if map.size>capacity:
         evict := map.keys().next().value
         map.delete(evict)
```

Design note: This is a lightweight, dependency‑free cache suitable for a SPA. At higher scale, use edge/CDN caching or a shared server cache.

### 2) Base62 Short‑Code Generation

- Alphabet Σ = [A–Z, a–z, 0–9] (62 chars). Generate k‑length codes by uniform random sampling.
- Complexity: O(k) time; O(1) space.
- Why Base62: Compact, URL‑safe, human‑readable; common in production shorteners.
- Collision handling: After generation, query `urls` for existence; on collision, regenerate (bounded retries). With |Σ|^k large (e.g., 62^6 ≈ 5.68e10), expected collisions are negligible at modest scale.

### 3) URL Normalization and Validation

- Normalization: Ensure protocol; if missing, prepend `https://`. Trim whitespace; canonicalize host if needed.
- Validation: Regex constraints for custom slugs (e.g., `^[A-Za-z0-9-_]{3,30}$`), length checks for original URLs.
- Complexity: O(n) on input length. Prevents malformed input and improves UX.

### 4) Collision Resolution (Create URL)

- Strategy: Generate → Check → Retry. On each collision, retry up to N times; surface a clear error if exhausted.
- Expected complexity: O(1) attempts with large keyspace; worst case bounded by N.

### 5) Case‑Insensitive Lookup (Redirect)

- Query: `short_url ILIKE :id OR custom_url ILIKE :id` (via Supabase). This tolerates user‑entered casing differences.
- Indexing note: For high scale, consider functional indexes (e.g., on `lower(short_url)`) or normalize slugs on write to enable exact matches.

### 6) Server‑Side Redirect (Vercel Function)

- Flow:
   1. Extract `shortcode` from `/[shortcode]`.
   2. Query Supabase for match (case‑insensitive) in `urls`.
   3. If found: compute `Location` header (ensure protocol), return HTTP 301; in background, insert a `clicks` row.
   4. If not found: return a styled 404 page.
- Complexity: O(1) average with proper DB indexing; dominated by network I/O.
- Rationale: Server‑side redirects work without client JS, aid SEO, and allow better caching semantics.

### 7) Click Logging (Best‑Effort, Async)

- Captures: `url_id`, `ip_address`, `user_agent`, `referrer`, `country` (from Vercel headers if available).
- Insert occurs without blocking the redirect response. Errors are logged and ignored.
- Complexity: O(1) per request; eventual consistency.

### 8) React Memoization (useMemo/useCallback)

- Concept: Cache derived values and stable handlers to avoid recomputation and child re‑renders—a dynamic‑programming style optimization in the UI layer.
- Usage: Dashboard aggregations, filtered lists, stable callbacks for forms.
- Benefit: Smoother rendering with growing datasets.

### 9) Error Handling & Edge Cases

- Empty/malformed URLs → validation errors.
- Missing protocol → auto‑prepend `https://`.
- Duplicate custom slug → immediate feedback; suggest alternatives.
- Unknown shortcode → 404 page.
- Case variance → handled by ILIKE lookup.
- Very long URLs → length checks to protect DB and UI.

### 10) Complexity Summary

- Generate short code: O(k) + expected O(1) uniqueness check.
- Redirect lookup: O(1) expected (indexed DB query).
- Cache get/set/evict: O(1) average.
- Normalize/validate: O(n) on input.

### 11) DAA Principles Demonstrated

- Probabilistic analysis for collision risk in random code generation.
- LRU replacement policy with TTL for bounded, fresh caching.
- Memoization as a DP‑style optimization in UI rendering.
- Separation of concerns: critical path (redirect) vs. side effect (analytics) to minimize tail latency.
- Defensive input processing with regex and normalization.

### Example Walkthrough

1) Input: `www.youtube.com/watch?v=abc` → normalize to `https://www.youtube.com/watch?v=abc`.
2) Generate Base62 slug `1y6oJV`; check DB; insert.
3) Visiting `/1y6oJV` → server function queries, returns 301 to original URL; logs click asynchronously.

---

## Contributing

Contributions are welcome! Please open an issue or submit a PR.

## License

MIT — see `LICENSE` for details.
