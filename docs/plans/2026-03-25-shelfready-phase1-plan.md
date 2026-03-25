# ShelfReady Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Evolve the existing ShelfReady waitlist site into a working SaaS — auth with logo onboarding, a 4-step generate form, Gemini image generation, and a gated results page.

**Architecture:** Route groups separate marketing (`(marketing)`), auth (`(auth)`), and app (`(app)`) with dedicated layouts. Middleware protects `(app)` routes using `@supabase/ssr` cookie-based sessions. The Gemini API is called server-side via a Next.js API route that uploads inputs/outputs to Supabase Storage.

**Tech Stack:** Next.js 14 App Router, `@supabase/ssr`, `@google/generative-ai`, shadcn/ui, Tailwind CSS, Lucide React

---

## Prerequisites (manual — do before starting)

1. **Copy logo file** — save `c:/Users/user/Downloads/shelfsready.png` to `public/logo.png` in the project
2. **Supabase dashboard** — run the SQL migrations in Task 4 before Tasks 5–10
3. **Supabase Storage** — create three private buckets: `logos`, `products`, `generations`
4. **Env vars** — add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=<from supabase dashboard → settings → api>
   GEMINI_API_KEY=<from aistudio.google.com>
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

---

## Task 1: Install dependencies + configure Tailwind

**Files:**
- Modify: `package.json`
- Modify: `tailwind.config.ts`

**Step 1: Install packages**

```bash
npm install @supabase/ssr @google/generative-ai lucide-react tailwindcss-animate class-variance-authority clsx tailwind-merge
```

Expected: packages added to `node_modules`, no errors.

**Step 2: Init shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Neutral**
- CSS variables: **Yes**

This creates `components/ui/` and updates `tailwind.config.ts` and `globals.css`.

**Step 3: Add brand tokens + accent/warning colors to `tailwind.config.ts`**

Replace the `colors` block in the theme extension:

```ts
colors: {
  brand: {
    DEFAULT: "#1D9E75",
    light:   "#E1F5EE",
    hover:   "#0F6E56",
    navy:    "#1A2E35",
  },
  accent:  "#7F77DD",
  warning: "#EF9F27",
},
```

Also add `tailwindcss-animate` to plugins:

```ts
plugins: [require("tailwindcss-animate")],
```

**Step 4: Verify build**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: install shadcn/ui, supabase/ssr, gemini SDK, add brand tokens"
```

---

## Task 2: Supabase SSR client + middleware

**Files:**
- Delete: `src/lib/supabase.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`
- Modify: `src/app/actions/waitlist.ts` (update import)

**Step 1: Create browser client `src/lib/supabase/client.ts`**

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 2: Create server client `src/lib/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
```

**Step 3: Create middleware client `src/lib/supabase/middleware.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect app routes
  const appRoutes = ["/generate", "/results", "/dashboard", "/onboarding"];
  const authRoutes = ["/login", "/signup"];

  if (!user && appRoutes.some((r) => pathname.startsWith(r))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && authRoutes.some((r) => pathname.startsWith(r))) {
    const url = request.nextUrl.clone();
    url.pathname = "/generate";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

**Step 4: Create root `src/middleware.ts`**

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Step 5: Update waitlist action import**

In `src/app/actions/waitlist.ts`, replace:
```ts
import { createSupabaseClient } from "@/lib/supabase";
```
with:
```ts
import { createClient } from "@/lib/supabase/server";
```

And replace every `createSupabaseClient()` call with `createClient()`.

**Step 6: Delete old client**

```bash
rm src/lib/supabase.ts
```

**Step 7: Verify build**

```bash
npm run build
```

Expected: builds clean. Fix any TypeScript errors before continuing.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: replace supabase anon client with @supabase/ssr + route protection middleware"
```

---

## Task 3: Route group restructure

**Files:**
- Create: `src/app/(marketing)/layout.tsx`
- Move: `src/app/page.tsx` → `src/app/(marketing)/page.tsx`
- Move: `src/app/privacy/` → `src/app/(marketing)/privacy/`
- Move: `src/app/terms/` → `src/app/(marketing)/terms/`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(app)/layout.tsx`

**Step 1: Create marketing layout `src/app/(marketing)/layout.tsx`**

```tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

(The existing `page.tsx` already renders `<Navbar>` and `<Footer>` directly — no change needed there.)

**Step 2: Move existing pages into (marketing) group**

```bash
# Windows bash
mkdir -p src/app/\(marketing\)
cp src/app/page.tsx src/app/\(marketing\)/page.tsx
cp -r src/app/privacy src/app/\(marketing\)/privacy
cp -r src/app/terms src/app/\(marketing\)/terms
rm src/app/page.tsx
rm -rf src/app/privacy
rm -rf src/app/terms
```

**Step 3: Create auth layout `src/app/(auth)/layout.tsx`**

Centered card wrapper — no navbar, clean white page.

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
```

**Step 4: Create app shell layout `src/app/(app)/layout.tsx`**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/components/app/AppNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
```

**Step 5: Create `src/components/app/AppNav.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";

export default function AppNav() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/generate">
          <Image src="/logo.png" alt="ShelfReady" width={120} height={32} className="h-8 w-auto" />
        </Link>
        <Link
          href="/api/auth/signout"
          className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
        >
          Sign out
        </Link>
      </nav>
    </header>
  );
}
```

**Step 6: Create sign-out route `src/app/api/auth/signout/route.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function GET() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

**Step 7: Verify build + routes work**

```bash
npm run build && npm run dev
```

Visit `http://localhost:3000` — landing page should load. Visit `/generate` — should redirect to `/login`.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: restructure into route groups (marketing), (auth), (app) with dedicated layouts"
```

---

## Task 4: Database migrations (manual — run in Supabase SQL editor)

Go to Supabase dashboard → SQL Editor → New query. Run each block separately.

**Step 1: Create profiles table + trigger**

```sql
create table if not exists profiles (
  id           uuid primary key references auth.users on delete cascade,
  email        text not null,
  logo_url     text,
  demo_used    boolean not null default false,
  tier         text not null default 'free',
  created_at   timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

**Step 2: Create generations table**

```sql
create table if not exists generations (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles on delete cascade,
  input_image_url   text not null,
  output_image_urls text[] not null default '{}',
  prompt_config     jsonb not null default '{}',
  created_at        timestamptz not null default now()
);
```

**Step 3: Enable RLS + policies**

```sql
alter table profiles enable row level security;
alter table generations enable row level security;

create policy "users read own profile"
  on profiles for select using (auth.uid() = id);
create policy "users update own profile"
  on profiles for update using (auth.uid() = id);

create policy "users read own generations"
  on generations for select using (auth.uid() = user_id);
create policy "users insert own generations"
  on generations for insert with check (auth.uid() = user_id);
```

**Step 4: Create storage buckets**

In Supabase dashboard → Storage → New bucket for each:
- `logos` — private
- `products` — private
- `generations` — private

Then run these RLS policies for storage:

```sql
-- logos bucket: users manage their own
create policy "users upload own logo"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users read own logo"
  on storage.objects for select
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

-- products bucket
create policy "users upload own product"
  on storage.objects for insert
  with check (bucket_id = 'products' and auth.uid()::text = (storage.foldername(name))[1]);

-- generations bucket (service role writes, users read own)
create policy "users read own generations"
  on storage.objects for select
  using (bucket_id = 'generations' and auth.uid()::text = (storage.foldername(name))[1]);
```

**Step 5: Verify**

In Supabase Table Editor — confirm `profiles` and `generations` tables exist. Test trigger: create a user via Supabase Auth dashboard → confirm a `profiles` row is auto-created.

---

## Task 5: Signup page

**Files:**
- Create: `src/app/(auth)/signup/page.tsx`
- Create: `src/components/auth/SignupForm.tsx`

**Step 1: Create `src/components/auth/SignupForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="ShelfReady" width={140} height={40} className="h-10 w-auto" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-[20px] font-medium text-brand-navy mb-1">Create your account</h1>
        <p className="text-[13px] text-gray-500 mb-5">Start with one free generation — no card needed.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              placeholder="Min. 6 characters"
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white rounded-lg py-2.5 text-[13px] font-medium hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account →"}
          </button>
        </form>

        <p className="text-center text-[12px] text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Create `src/app/(auth)/signup/page.tsx`**

```tsx
import SignupForm from "@/components/auth/SignupForm";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return <SignupForm />;
}
```

**Step 3: Manual test**

```bash
npm run dev
```

Visit `http://localhost:3000/signup`. Fill form and submit. Should redirect to `/onboarding`. Confirm `profiles` row created in Supabase Table Editor.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add signup page with Supabase auth"
```

---

## Task 6: Login page

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/components/auth/LoginForm.tsx`

**Step 1: Create `src/components/auth/LoginForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/generate");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="ShelfReady" width={140} height={40} className="h-10 w-auto" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-[20px] font-medium text-brand-navy mb-1">Welcome back</h1>
        <p className="text-[13px] text-gray-500 mb-5">Sign in to your ShelfReady account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white rounded-lg py-2.5 text-[13px] font-medium hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <p className="text-center text-[12px] text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-brand hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Create `src/app/(auth)/login/page.tsx`**

```tsx
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return <LoginForm />;
}
```

**Step 3: Manual test**

Visit `http://localhost:3000/login`. Sign in with the account created in Task 5. Should redirect to `/generate`. Signing in while already logged in should also go to `/generate`.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add login page"
```

---

## Task 7: Onboarding page (logo upload)

**Files:**
- Create: `src/app/(auth)/onboarding/page.tsx`
- Create: `src/components/auth/OnboardingForm.tsx`

**Step 1: Create `src/components/auth/OnboardingForm.tsx`**

```tsx
"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload } from "lucide-react";

export default function OnboardingForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("Logo must be under 5MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function handleContinue() {
    setUploading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError("Upload failed. Please try again.");
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("logos")
        .getPublicUrl(path);

      await supabase
        .from("profiles")
        .update({ logo_url: publicUrl })
        .eq("id", user.id);
    }

    router.push("/generate");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="ShelfReady" width={140} height={40} className="h-10 w-auto" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-[20px] font-medium text-brand-navy mb-1">Upload your logo</h1>
        <p className="text-[13px] text-gray-500 mb-5">
          We'll embed it into your generated images. You can skip this and add it later.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-brand hover:bg-brand-light/30 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Logo preview" className="h-16 w-auto object-contain" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-[13px] text-gray-500">Click to upload</span>
              <span className="text-[11px] text-gray-400">PNG or JPG · max 5MB</span>
            </>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && (
          <p className="text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-3">{error}</p>
        )}

        <button
          onClick={handleContinue}
          disabled={uploading}
          className="w-full mt-4 bg-brand text-white rounded-lg py-2.5 text-[13px] font-medium hover:bg-brand-hover transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Continue →"}
        </button>

        <button
          onClick={() => router.push("/generate")}
          className="w-full mt-2 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Create `src/app/(auth)/onboarding/page.tsx`**

```tsx
import OnboardingForm from "@/components/auth/OnboardingForm";

export const metadata = { title: "Set up your account" };

export default function OnboardingPage() {
  return <OnboardingForm />;
}
```

**Step 3: Manual test**

After signup, upload a logo PNG. Check Supabase Storage → `logos` bucket — file should appear at `{user_id}/logo.png`. Check `profiles` table — `logo_url` should be set. Skip button should also work.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add onboarding page with logo upload to Supabase Storage"
```

---

## Task 8: Generate form UI

**Files:**
- Create: `src/app/(app)/generate/page.tsx`
- Create: `src/components/app/GenerateForm.tsx`

**Step 1: Create `src/components/app/GenerateForm.tsx`**

```tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check } from "lucide-react";

const STEPS = ["Category", "Setting", "Style", "Photo"] as const;

const OPTIONS = {
  category: ["Clothing", "Shoes", "Accessories", "Electronics", "Home Goods", "Other"],
  setting:  ["Studio white", "Outdoor lifestyle", "Flat lay", "Urban street"],
  style:    ["Minimalist", "Luxury", "Vibrant/Bold", "Casual"],
} as const;

type Selections = {
  category: string;
  setting: string;
  style: string;
};

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg border text-[13px] font-medium transition-all text-left ${
        selected
          ? "border-brand bg-brand-light text-brand-navy"
          : "border-gray-200 bg-white text-gray-700 hover:border-brand/50"
      }`}
    >
      {label}
    </button>
  );
}

export default function GenerateForm() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Selections>({
    category: "Clothing",
    setting: "",
    style: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function select(field: keyof Selections, value: string) {
    setSelections((s) => ({ ...s, [field]: value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setError("Image must be under 10MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("productImage", file);
    formData.append("category", selections.category);
    formData.append("setting", selections.setting);
    formData.append("style", selections.style);

    const res = await fetch("/api/generate", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 402) {
        router.push("/pricing");
        return;
      }
      setError(data.error ?? "Generation failed. Please try again.");
      setLoading(false);
      return;
    }

    router.push(`/results?id=${data.generationId}`);
  }

  const stepFields: (keyof Selections)[] = ["category", "setting", "style"];
  const currentField = stepFields[step] as keyof typeof OPTIONS | undefined;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-medium text-brand-navy">Generate images</h1>
          <p className="text-[13px] text-gray-500">Your free generation — 3 variations</p>
        </div>
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < step ? "bg-brand" : i === step ? "bg-brand" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {/* Step label */}
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-3">
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </p>

        {/* Steps 0–2: chip grids */}
        {step < 3 && currentField && (
          <div className="grid grid-cols-2 gap-2">
            {(OPTIONS[currentField as keyof typeof OPTIONS] as readonly string[]).map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={selections[currentField as keyof Selections] === opt}
                onClick={() => select(currentField as keyof Selections, opt)}
              />
            ))}
          </div>
        )}

        {/* Step 3: upload */}
        {step === 3 && (
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-2 hover:border-brand hover:bg-brand-light/20 transition-colors"
            >
              {preview ? (
                <img src={preview} alt="Product preview" className="max-h-40 object-contain rounded-lg" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-[13px] text-gray-600 font-medium">Upload product photo</span>
                  <span className="text-[11px] text-gray-400">JPG or PNG · max 10MB</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={handleFile} className="hidden" />
          </div>
        )}

        {error && (
          <p className="text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-3">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex gap-2 mt-5">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 border border-gray-200 rounded-lg py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step < 3 && !selections[stepFields[step]]}
              className="flex-1 bg-brand text-white rounded-lg py-2.5 text-[13px] font-medium hover:bg-brand-hover transition-colors disabled:opacity-40"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              className="flex-1 bg-brand text-white rounded-lg py-2.5 text-[13px] font-medium hover:bg-brand-hover transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                "Generate 3 variations →"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create `src/app/(app)/generate/page.tsx`**

```tsx
import GenerateForm from "@/components/app/GenerateForm";

export const metadata = { title: "Generate" };

export default function GeneratePage() {
  return <GenerateForm />;
}
```

**Step 3: Manual test**

Visit `http://localhost:3000/generate`. Step through all 4 steps — chips select/deselect, back/next navigate, upload previews image. "Generate" button stays disabled until a file is chosen. Do not submit yet (API route not built).

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add 4-step generate form UI with chip selection and file upload"
```

---

## Task 9: Gemini API route

**Files:**
- Create: `src/app/api/generate/route.ts`
- Create: `src/lib/gemini.ts`

**Step 1: Create Gemini helper `src/lib/gemini.ts`**

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export function buildPrompt(category: string, setting: string, style: string): string {
  return `You are a professional fashion/product photographer.
I am providing a product image. Transform it into a high-end lifestyle shoot with the following specs:
- Product type: ${category}
- Setting: ${setting}
- Style: ${style}
- Generate 3 distinct variations from different angles
- Embed the attached brand logo naturally as a wall sign or display element in the background
- Output: Professional, e-commerce-ready, gallery-quality images`;
}

export async function generateImages(
  prompt: string,
  productImageBytes: ArrayBuffer,
  productMimeType: string,
  logoImageBytes?: ArrayBuffer,
  logoMimeType?: string
) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-preview-image-generation",
  });

  const parts: any[] = [
    { text: prompt },
    {
      inlineData: {
        mimeType: productMimeType,
        data: Buffer.from(productImageBytes).toString("base64"),
      },
    },
  ];

  if (logoImageBytes && logoMimeType) {
    parts.push({
      inlineData: {
        mimeType: logoMimeType,
        data: Buffer.from(logoImageBytes).toString("base64"),
      },
    });
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"],
    } as any,
  });

  const images: { data: string; mimeType: string }[] = [];
  for (const part of result.response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData) {
      images.push({ data: part.inlineData.data, mimeType: part.inlineData.mimeType });
    }
  }

  return images;
}
```

**Step 2: Create `src/app/api/generate/route.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { buildPrompt, generateImages } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

// Service role client — bypasses RLS for storage writes
function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Demo gate
  const { data: profile } = await supabase
    .from("profiles")
    .select("demo_used, logo_url, tier")
    .eq("id", user.id)
    .single();

  if (profile?.demo_used && profile?.tier === "free") {
    return NextResponse.json({ error: "Demo already used" }, { status: 402 });
  }

  // 3. Parse form data
  const formData = await request.formData();
  const productImage = formData.get("productImage") as File | null;
  const category = formData.get("category") as string;
  const setting = formData.get("setting") as string;
  const style = formData.get("style") as string;

  if (!productImage || !category || !setting || !style) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (productImage.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Image too large" }, { status: 400 });
  }

  const service = serviceClient();

  // 4. Upload product image
  const productBytes = await productImage.arrayBuffer();
  const productPath = `${user.id}/${crypto.randomUUID()}.jpg`;
  await service.storage.from("products").upload(productPath, Buffer.from(productBytes), {
    contentType: productImage.type,
  });
  const { data: { publicUrl: inputImageUrl } } = service.storage
    .from("products")
    .getPublicUrl(productPath);

  // 5. Fetch logo if set
  let logoBytes: ArrayBuffer | undefined;
  let logoMimeType: string | undefined;
  if (profile?.logo_url) {
    try {
      const res = await fetch(profile.logo_url);
      logoBytes = await res.arrayBuffer();
      logoMimeType = res.headers.get("content-type") ?? "image/png";
    } catch {
      // Logo fetch failed — continue without it
    }
  }

  // 6. Call Gemini
  const prompt = buildPrompt(category, setting, style);
  let generatedImages: { data: string; mimeType: string }[];
  try {
    generatedImages = await generateImages(
      prompt,
      productBytes,
      productImage.type,
      logoBytes,
      logoMimeType
    );
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }

  if (generatedImages.length === 0) {
    return NextResponse.json({ error: "No images returned. Please try again." }, { status: 500 });
  }

  // 7. Upload generated images to storage
  const outputImageUrls: string[] = [];
  for (const img of generatedImages) {
    const ext = img.mimeType.split("/")[1] ?? "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    await service.storage
      .from("generations")
      .upload(path, Buffer.from(img.data, "base64"), { contentType: img.mimeType });
    const { data: { publicUrl } } = service.storage.from("generations").getPublicUrl(path);
    outputImageUrls.push(publicUrl);
  }

  // 8. Insert generation row
  const { data: generation } = await service
    .from("generations")
    .insert({
      user_id: user.id,
      input_image_url: inputImageUrl,
      output_image_urls: outputImageUrls,
      prompt_config: { category, setting, style },
    })
    .select("id")
    .single();

  // 9. Mark demo as used
  await service
    .from("profiles")
    .update({ demo_used: true })
    .eq("id", user.id);

  return NextResponse.json({ generationId: generation?.id, outputImageUrls });
}
```

**Step 3: Manual test**

Start dev server. Complete the generate form and submit. Watch the network tab — the POST to `/api/generate` should return `{ generationId, outputImageUrls }`. Check Supabase Storage `generations` bucket for uploaded images. Check `generations` table for the row.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Gemini image generation API route with Supabase Storage upload"
```

---

## Task 10: Results page

**Files:**
- Create: `src/app/(app)/results/page.tsx`
- Create: `src/components/app/ResultsGallery.tsx`

**Step 1: Create `src/components/app/ResultsGallery.tsx`**

```tsx
"use client";

import { Download, Lock } from "lucide-react";
import Link from "next/link";

type Props = {
  outputImageUrls: string[];
  isPremium: boolean;
};

export default function ResultsGallery({ outputImageUrls, isPremium }: Props) {
  async function handleDownload(url: string, index: number) {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `shelfready-variation-${index + 1}.jpg`;
    a.click();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-medium text-brand-navy">Your results</h1>
          <p className="text-[13px] text-gray-500">
            {isPremium ? "All variations unlocked" : "2 of 3 variations unlocked"}
          </p>
        </div>
        <Link
          href="/generate"
          className="text-[13px] text-brand hover:underline"
        >
          ← New generation
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[0, 1, 2].map((i) => {
          const url = outputImageUrls[i];
          const locked = !isPremium && i === 2;

          return (
            <div key={i} className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-square group">
              {url ? (
                <>
                  <img
                    src={url}
                    alt={`Variation ${i + 1}`}
                    className={`w-full h-full object-cover transition-all ${locked ? "opacity-40 blur-sm" : ""}`}
                  />
                  {locked ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="bg-white/90 rounded-full p-2">
                        <Lock className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="text-[11px] font-medium text-gray-700 bg-white/90 px-2 py-0.5 rounded-full">
                        Upgrade to unlock
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownload(url, i)}
                      className="absolute bottom-2 right-2 bg-white/90 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-gray-700" />
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[12px] text-gray-400">
                  Not generated
                </div>
              )}
              <div className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-0.5 text-[11px] font-medium text-gray-600">
                {i + 1}
              </div>
            </div>
          );
        })}
      </div>

      {!isPremium && (
        <div className="rounded-xl bg-accent p-5 text-white">
          <p className="text-[16px] font-medium mb-1">Unlock everything</p>
          <p className="text-[13px] text-white/80 mb-4">
            All 3 variations + batch upload for your whole catalogue. From $9/month.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-white text-accent rounded-lg px-4 py-2 text-[13px] font-medium hover:bg-white/90 transition-colors"
          >
            See pricing →
          </Link>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Create `src/app/(app)/results/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResultsGallery from "@/components/app/ResultsGallery";

export const metadata = { title: "Results" };

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const id = searchParams.id;
  if (!id) redirect("/generate");

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: generation }, { data: profile }] = await Promise.all([
    supabase.from("generations").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("profiles").select("tier").eq("id", user.id).single(),
  ]);

  if (!generation) redirect("/generate");

  return (
    <ResultsGallery
      outputImageUrls={generation.output_image_urls}
      isPremium={profile?.tier === "premium"}
    />
  );
}
```

**Step 3: Manual end-to-end test**

1. Sign up, upload logo, complete generate form, submit
2. Should redirect to `/results?id=...`
3. Images should display — variations 1 & 2 visible, variation 3 blurred with lock icon
4. Download button should appear on hover for unlocked variations
5. Upgrade banner should be visible at bottom

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add results page with gated variation 3 and upgrade banner"
```

---

## Task 11: Update Navbar + .env.example + CLAUDE.md

**Files:**
- Modify: `src/components/Navbar.tsx`
- Modify: `.env.example`
- Modify: `CLAUDE.md`

**Step 1: Update Navbar to show Sign in / Try free**

Replace the single "Join Waitlist" button with two auth links:

```tsx
import Logo from "./Logo";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-brand-navy/90 backdrop-blur-sm border-b border-white/10">
      <nav aria-label="Main" className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-medium text-white/70 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-xs font-semibold bg-brand text-white px-3 py-1.5 rounded-full tracking-wide hover:bg-brand-hover transition-colors"
          >
            Try free
          </Link>
        </div>
      </nav>
    </header>
  );
}
```

**Step 2: Update `.env.example`**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 3: Update `CLAUDE.md`** — add new packages and routes under the Architecture section.

**Step 4: Final build check**

```bash
npm run build
```

Expected: clean build, no TypeScript errors.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: update navbar with auth links, update env.example and CLAUDE.md"
```

---

## Done — Phase 1 complete

At this point the following works end-to-end:
- `/` — landing page with Sign in / Try free in navbar
- `/signup` → `/onboarding` → `/generate` — auth + logo upload flow
- `/login` → `/generate` — returning user flow
- `/generate` — 4-step chip form with product image upload
- `POST /api/generate` — Gemini call, Storage upload, demo gate
- `/results?id=...` — gallery with gated variation 3, upgrade banner
- Middleware protects all app routes, redirects auth routes if logged in

**Phase 2 next:** Paystack subscription, premium tier unlock, batch upload.
