# ShelfReady Waitlist Landing Page — Implementation Plan

## Stack
Next.js 14 (App Router), Tailwind CSS, Supabase, Vercel

## Steps

### Step 1 — Scaffold the project
- `npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- `npm install @supabase/supabase-js`

### Step 2 — Environment variables
- `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `.env.example`: template without values
- Update `.gitignore`

### Step 3 — Tailwind brand tokens
- `tailwind.config.ts`: extend colors with brand.primary, brand.light, brand.hover, brand.navy
- Font: fontFamily.sans → var(--font-geist-sans)

### Step 4 — Root layout
- `src/app/layout.tsx`: Geist Sans font, metadata, bg-white antialiased

### Step 5 — Supabase client
- `src/lib/supabase.ts`: factory function createSupabaseClient()

### Step 6 — Server Action
- `src/app/actions/waitlist.ts`: 'use server', insert to waitlist, return discriminated union
- Normalise email to lowercase, detect duplicate via Postgres error code 23505

### Step 7 — Logo component
- `src/components/Logo.tsx`: camera-box SVG + "Shelf" (#1A2E35) + "Ready" (#1D9E75)

### Step 8 — WaitlistForm (only 'use client' component)
- `src/components/WaitlistForm.tsx`: form states idle/loading/success/duplicate/error
- First name (optional) + email (required)

### Step 9 — Section components
- `src/components/Navbar.tsx`
- `src/components/HeroSection.tsx`
- `src/components/BeforeAfterSection.tsx`
- `src/components/FeaturesSection.tsx`
- `src/components/Footer.tsx`

### Step 10 — Root page
- `src/app/page.tsx`: assemble all sections

### Step 11 — Supabase SQL migration (manual)
```sql
CREATE TABLE waitlist (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email       TEXT        UNIQUE NOT NULL,
  first_name  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_only" ON waitlist FOR INSERT TO anon WITH CHECK (true);
```

### Step 12 — Vercel deploy
- Push to GitHub → import in Vercel → add env vars
