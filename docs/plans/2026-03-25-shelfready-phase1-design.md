# ShelfReady — Phase 1 Design

**Date:** 2026-03-25
**Scope:** Demo experience — auth, logo onboarding, generate flow, Gemini integration, usage gating
**Project:** ShelfReady (AI Product Photography SaaS) — evolving the existing waitlist site into a full product

---

## Decisions

- **Same repo** as the existing waitlist landing page (`C:\Users\user\Projects\ShelfReady`)
- **Landing page kept** at `/` — add app routes alongside it
- **Supabase client** upgraded from plain `@supabase/supabase-js` to `@supabase/ssr`
- **UI:** shadcn/ui on top of Tailwind, themed to existing brand tokens
- **Route structure:** Next.js route groups with dedicated layouts per section

---

## 1. Project Structure

```
src/
  app/
    (marketing)/           ← public pages, uses marketing layout
      page.tsx             ← / reworked landing page
      pricing/page.tsx
      privacy/page.tsx
      terms/page.tsx
      layout.tsx           ← Navbar + Footer
    (auth)/                ← unauthenticated only
      login/page.tsx
      signup/page.tsx
      onboarding/page.tsx  ← logo upload post-signup
      layout.tsx           ← centered card layout, no nav
    (app)/                 ← protected, requires session
      generate/page.tsx
      results/page.tsx
      dashboard/page.tsx
      layout.tsx           ← app shell: top bar + user menu
    layout.tsx             ← root: fonts, globals
    globals.css
  components/
    ui/                    ← shadcn/ui primitives
    marketing/             ← existing landing page sections
    app/                   ← GenerateForm, ResultsGrid, etc.
  lib/
    supabase/
      client.ts            ← browser client (@supabase/ssr)
      server.ts            ← server client (@supabase/ssr)
      middleware.ts        ← middleware client
  middleware.ts            ← root: protect (app) routes
```

### New packages
- `@supabase/ssr` — cookie-based auth for App Router
- `shadcn/ui` + `tailwindcss-animate`
- `@google/generative-ai` — Gemini SDK
- `lucide-react` — icons

### Brand tokens (Tailwind config)
| Token | Value | Use |
|---|---|---|
| `brand.DEFAULT` | `#1D9E75` | Primary teal |
| `brand.dark` | `#0F6E56` | Hover states |
| `brand.light` | `#E1F5EE` | Selected chip bg |
| `brand.navy` | `#1A2E35` | Headings |
| `accent` | `#7F77DD` | Upgrade/premium |
| `warning` | `#EF9F27` | Add-on / amber |

### Logo
File: `public/logo.png` (camera-in-box icon, "Shelf" navy + "Ready" teal, subtitle "AI Product Photography")

---

## 2. Auth & Onboarding

### Flow
```
/signup → Supabase createUser() → redirect /onboarding
/onboarding → upload logo (optional) → create/update profiles row → redirect /generate
/login → Supabase signInWithPassword() → redirect /generate (or /dashboard if demo_used)
```

### Route protection (middleware.ts)
| Route | No session | Has session |
|---|---|---|
| `/(app)/*` | → `/login` | allowed |
| `/login`, `/signup` | allowed | → `/generate` |
| `/onboarding` | → `/login` | allowed |

### profiles row creation
Database trigger fires on `auth.users` insert — inserts `profiles` row with `id` + `email`. Onboarding step updates `logo_url` only.

---

## 3. Generate Flow

### `/generate` — GenerateForm (client component)

4-step wizard, all state local, no page navigation between steps.

| Step | UI | Options |
|---|---|---|
| 1 — Category | 2×3 chip grid | Clothing · Shoes · Accessories · Electronics · Home Goods · Other |
| 2 — Setting | 2×2 chip grid | Studio white · Outdoor lifestyle · Flat lay · Urban street |
| 3 — Style | 2×2 chip grid | Minimalist · Luxury · Vibrant/Bold · Casual |
| 4 — Upload | Drag-drop zone | JPG/PNG · max 10MB · preview thumbnail |

- Progress: 4 dots top-right of card header, filled teal as steps complete
- Submit: "Generate 3 variations" — full width teal, enabled only on step 4
- Selected chip style: teal border + `brand.light` background fill

### `POST /api/generate` — server route

```
1. Auth check → 401 if no session
2. Demo gate → fetch profiles.demo_used; if true return 402
3. Receive multipart: { productImage, category, setting, style }
4. Upload productImage → storage: products/{user_id}/{uuid}.jpg
5. Fetch logo from profiles.logo_url (if set)
6. Construct prompt from template
7. Call Gemini (gemini-2.0-flash-preview-image-generation)
   parts: [text prompt, productImage inline, logo inline (if exists)]
   responseModalities: ["IMAGE", "TEXT"]
8. Upload each output image → storage: generations/{user_id}/{uuid}.jpg
9. Insert row into generations table
10. Set profiles.demo_used = true
11. Return { outputImageUrls: string[], generationId: string }
```

### Prompt template
```
You are a professional fashion/product photographer.
I am providing a product image. Transform it into a high-end
lifestyle shoot with the following specs:
- Product type: {category}
- Setting: {setting}
- Style: {style}
- Generate 3 distinct variations from different angles
- Embed the attached brand logo naturally as a wall sign
  or display element in the background
- Output: Professional, e-commerce-ready, gallery-quality images
```

### `/results?id={generationId}`

- Fetches generation row server-side
- 3-column grid: variations 1 & 2 visible + download button; variation 3 blurred (opacity-40) + lock icon
- If `tier='premium'`: all 3 unlocked, no banner
- Upgrade banner (purple `#7F77DD`) below grid for free users → `/pricing`

### Error handling
| Scenario | Behaviour |
|---|---|
| No logo uploaded | Generation proceeds, soft warning shown |
| Gemini returns < 3 images | Show however many returned |
| Gemini API error | Toast: "Generation failed, please try again" |
| File > 10MB | Client-side rejection before upload |

---

## 4. Database & Storage

### SQL migrations

```sql
-- profiles
create table profiles (
  id           uuid primary key references auth.users on delete cascade,
  email        text not null,
  logo_url     text,
  demo_used    boolean not null default false,
  tier         text not null default 'free',
  created_at   timestamptz not null default now()
);

-- trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- generations
create table generations (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles on delete cascade,
  input_image_url   text not null,
  output_image_urls text[] not null default '{}',
  prompt_config     jsonb not null default '{}',
  created_at        timestamptz not null default now()
);

-- RLS
alter table profiles enable row level security;
alter table generations enable row level security;

create policy "users read own profile"    on profiles for select using (auth.uid() = id);
create policy "users update own profile"  on profiles for update using (auth.uid() = id);
create policy "users read own generations"   on generations for select using (auth.uid() = user_id);
create policy "users insert own generations" on generations for insert with check (auth.uid() = user_id);
```

### Storage buckets
| Bucket | Access | Path pattern |
|---|---|---|
| `logos` | Private | `logos/{user_id}/*` |
| `products` | Private | `products/{user_id}/*` |
| `generations` | Private (service role writes) | `generations/{user_id}/*` |

### Environment variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Out of scope for Phase 1
- Paystack payments (Phase 2)
- Batch upload (Phase 2)
- Dashboard generation history (Phase 3)
- Before/after landing page demo section (Phase 3)
