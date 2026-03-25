# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint validation
```

No test suite is configured.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
```

## Architecture

**ShelfReady** is a pre-launch waitlist landing page for an AI product photography SaaS. It is a Next.js 14 App Router project — not a full application, just a marketing site with a single form submission.

### Pages
- `/` — Main landing page (all sections assembled in `src/app/page.tsx`)
- `/privacy` and `/terms` — Static legal pages

### Data Flow: Waitlist Signup
1. `WaitlistForm.tsx` (only `"use client"` component) — client-side validation → calls server action
2. `src/app/actions/waitlist.ts` — server action: validates, inserts into Supabase `waitlist` table, sends confirmation email via Resend
3. Returns discriminated union: `success | duplicate | error`

### Key Patterns
- **Server components by default** — only `WaitlistForm`, `ScrollReveal`, and `ScrollToTop` use `"use client"`
- **Supabase client** is created via factory function in `src/lib/supabase.ts` (not a singleton, to avoid edge-case issues)
- **Email sending is non-blocking** — a Resend failure won't fail the signup
- **Duplicate detection** via Postgres error code `23505` (unique constraint on `email`)

### Database
The `waitlist` table must be created manually in Supabase:
```sql
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
RLS policy: anonymous users can `INSERT` only (no reads).

### Brand Tokens (Tailwind)
- `brand.DEFAULT` — `#1D9E75` (primary green)
- `brand.light` — `#E1F5EE`
- `brand.hover` — `#0F6E56`
- `brand.navy` — `#1A2E35` (headings/dark)
- Font: Geist Sans via `--font-geist-sans` CSS variable

### Animations
Defined in `src/app/globals.css`:
- `fade-in-up` — staggered hero entrance (100–500ms delays via `animation-delay`)
- `ScrollReveal` component — `IntersectionObserver` at 15% threshold for scroll-triggered reveals
- CSS scroll snap on the homepage sections
