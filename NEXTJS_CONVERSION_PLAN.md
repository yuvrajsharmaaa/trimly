# Next.js Conversion Plan

## Converting Trimly from Vite + React to Next.js 14 + Supabase

### Phase 1: Setup Next.js Project Structure
1. Create Next.js configuration files
2. Setup App Router directory structure
3. Configure Tailwind CSS for Next.js
4. Setup Supabase client

### Phase 2: Convert Pages
1. Landing page (app/page.tsx)
2. Dashboard (app/dashboard/page.tsx)
3. Link details (app/link/[id]/page.tsx)
4. Dynamic redirect (app/[shortcode]/page.tsx)

### Phase 3: Convert Components
1. Update all components for Next.js (client/server separation)
2. Convert hooks to be Next.js compatible
3. Update routing from React Router to Next.js navigation

### Phase 4: API & Database
1. Keep Supabase as-is
2. Create API routes if needed
3. Server-side data fetching

### Phase 5: Configuration
1. next.config.js
2. tsconfig.json / jsconfig.json
3. Environment variables
4. Vercel deployment config

Let's begin!
