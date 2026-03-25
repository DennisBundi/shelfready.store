# Project Brainstorm: ShelfReady — Waitlist Landing Page

## Problem Statement
Online sellers (Etsy, Shopify, Amazon, Instagram) need professional product photos but can't afford models, photographers, or studios. ShelfReady uses AI to generate lifestyle product shots — model and background included — in seconds.

## Target Users
- Individual online sellers (Etsy, Shopify, social commerce)
- Small e-commerce businesses globally
- Anyone currently spending $500–$2,000 per shoot or using plain white-background DIY photos
- No technical skills required — if you can upload a file, you can use ShelfReady

## Core Value Proposition
Upload your product. AI places it on a model and in a lifestyle scene. Professional-quality photos in seconds, at a fraction of the cost. No booking, no studio, no photographer.

## MVP Features (Waitlist Landing Page)
- [ ] Navbar — "ShelfReady" logo (Shelf black, Ready #1D9E75), "Launching soon" tag
- [ ] Hero section — headline, subtext, email + first name (optional) input, "Join Waitlist" CTA
- [ ] Before/After comparison cards — "The old way" vs "With ShelfReady"
- [ ] Three feature highlight cards — AI models, studio backgrounds, fraction of the cost
- [ ] Footer — one-liner with brand name and status
- [ ] Supabase `waitlist` table — columns: `id`, `email`, `first_name`, `created_at`
- [ ] Form submit — insert to Supabase, show success message
- [ ] Duplicate email handling — "You're already on the list!"
- [ ] Basic email validation (client-side)
- [ ] Mobile responsive layout
- [ ] Vercel deploy-ready (env vars for Supabase URL + anon key)

## Nice-to-Have (Post-MVP)
- Referral system ("Share your link, move up the waitlist")
- Waitlist counter ("Join 1,200+ sellers already waiting")
- Short product demo video or animated GIF in hero
- Admin dashboard to view/export waitlist emails
- Launch announcement email via Resend or Postmark

## Out of Scope
- User authentication
- Actual AI photo generation (product not yet built)
- Pricing page
- Blog or content pages
- Payment integration

## Tech Stack
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 14 (App Router) | SSR-ready, Vercel-native, strong ecosystem |
| Styling | Tailwind CSS | Fast utility-first styling, easy responsive design |
| Database | Supabase (Postgres) | Managed DB + auto REST API, free tier is enough |
| Supabase client | `@supabase/supabase-js` | Official client, simple insert API |
| Font | Geist Sans (via `next/font`) | Clean, modern, built into Next.js |
| Hosting | Vercel | Zero-config Next.js deploy, free tier |
| Env management | `.env.local` + Vercel env vars | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

## Supabase Setup Plan
1. Create new Supabase project
2. Run migration to create `waitlist` table:
   ```sql
   CREATE TABLE waitlist (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     first_name TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
3. Add Row Level Security (RLS) — allow inserts from anon role only
4. Copy project URL and anon key into `.env.local`

## Brand Tokens
| Token | Value |
|-------|-------|
| Primary green | `#1D9E75` |
| Light green (bg tints) | `#E1F5EE` |
| Dark green (hover) | `#0F6E56` |
| Background | White |
| Logo — "Shelf" | Black |
| Logo — "Ready" | `#1D9E75` |
| Font | Geist Sans |

## Key Risks & Unknowns
- Supabase anon key is public — RLS policy must restrict inserts to email field only (no reads from client)
- Duplicate email constraint must be enforced at DB level (`UNIQUE`) and handled gracefully in UI
- No rate limiting on the insert endpoint — could be abused; acceptable for MVP but worth noting

## Next Step
Run `/plan` to create a detailed implementation plan from this brainstorm.
