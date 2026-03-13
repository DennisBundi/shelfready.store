# Luxeskinglow Store MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Luxeskinglow skincare storefront — browse, cart, and Paystack checkout — as a shippable Sprint 1 MVP.

**Architecture:** Next.js 14 App Router with TypeScript, Supabase for data/auth, Paystack for payments. Store is fully public (no auth required for customers). Cart state lives in Zustand with localStorage persistence.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase, Zustand, Paystack, Swiper.js, react-compare-image, react-image-magnify, react-hook-form, zod, lucide-react, react-hot-toast

---

## Task 1: Project Initialisation

**Files:**
- Create: `package.json` (via npx)
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `.env.local`
- Create: `.env.example`

**Step 1: Scaffold Next.js project**

Run from `C:/Users/user/Projects/Luxe_skinglow/`:
```bash
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```
Expected: Next.js 14 project created in current directory.

**Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr zustand react-image-magnify swiper react-compare-image next-mdx-remote date-fns react-hot-toast lucide-react react-hook-form @hookform/resolvers zod browser-image-compression
npm install --save-dev @types/react-image-magnify ts-node
```

**Step 3: Configure Tailwind theme**

Replace the `theme.extend` section in `tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8D5A3',
          dark: '#8B6914',
        },
        blush: {
          DEFAULT: '#F5E6E0',
          dark: '#E8C8BC',
        },
        ivory: {
          DEFAULT: '#FDFAF7',
          dark: '#F0EBE3',
        },
        charcoal: {
          DEFAULT: '#1A1A1A',
        },
      },
      fontFamily: {
        heading: ['var(--font-cormorant)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

**Step 4: Set up fonts in root layout**

Replace `app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Luxeskinglow',
    default: 'Luxeskinglow — Premium Skincare',
  },
  description: 'Discover luxury skincare products crafted for radiant, glowing skin.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${inter.variable} font-body bg-ivory text-charcoal`}>
        {children}
      </body>
    </html>
  )
}
```

**Step 5: Create `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_PUBLIC_KEY=pk_test_your_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Step 6: Create `.env.example`** (same as above but empty values)

**Step 7: Update `.gitignore`** — add:
```
.env.local
.env*.local
```

**Step 8: Configure `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
```

**Step 9: Verify dev server starts**

```bash
npm run dev
```
Expected: Server running at http://localhost:3000

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: initialise Next.js 14 project with Tailwind luxury theme"
```

---

## Task 2: Supabase Client Setup

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/types.ts`

**Step 1: Create browser client**

Create `lib/supabase/client.ts`:
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Create server client**

Create `lib/supabase/server.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — ignore
          }
        },
      },
    }
  )
}
```

**Step 3: Create TypeScript types**

Create `lib/supabase/types.ts`:
```ts
export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_price: number | null
  images: ProductImage[]
  category: string | null
  tags: string[] | null
  inventory_count: number
  low_stock_threshold: number
  is_active: boolean
  weight_grams: number | null
  created_at: string
  updated_at: string
}

export interface ProductImage {
  url: string
  alt: string
  is_primary: boolean
}

export interface Order {
  id: string
  reference: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  shipping_address: ShippingAddress
  items: OrderItem[]
  subtotal: number
  shipping_fee: number
  total: number
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paystack_data: Record<string, unknown> | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  product_id: string
  name: string
  price: number
  qty: number
  image: string
}

export interface ShippingAddress {
  street: string
  city: string
  county: string
  postal_code: string
}

export interface Review {
  id: string
  product_id: string
  customer_name: string | null
  rating: number
  comment: string | null
  before_image: string | null
  after_image: string | null
  is_approved: boolean
  created_at: string
}

export interface Customer {
  id: string
  email: string
  name: string | null
  phone: string | null
  total_orders: number
  total_spent: number
  first_order_at: string | null
  last_order_at: string | null
}
```

**Step 4: Commit**

```bash
git add lib/
git commit -m "feat: add Supabase client/server setup and TypeScript types"
```

---

## Task 3: Supabase Database Migration

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Create migration file**

Create `supabase/migrations/001_initial_schema.sql`:
```sql
-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null,
  compare_price numeric(10,2),
  images jsonb default '[]',
  category text,
  tags text[],
  inventory_count integer default 0,
  low_stock_threshold integer default 5,
  is_active boolean default true,
  weight_grams integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address jsonb,
  items jsonb not null,
  subtotal numeric(10,2),
  shipping_fee numeric(10,2) default 0,
  total numeric(10,2) not null,
  status text default 'pending',
  paystack_data jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Customers
create table customers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  phone text,
  total_orders integer default 0,
  total_spent numeric(10,2) default 0,
  first_order_at timestamptz,
  last_order_at timestamptz
);

-- Reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  customer_name text,
  rating integer check (rating between 1 and 5),
  comment text,
  before_image text,
  after_image text,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- Blog posts (Sprint 2 — schema only)
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  cover_image text,
  content_path text,
  published_at timestamptz,
  is_published boolean default false
);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at before update on products
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

-- RLS
alter table products enable row level security;
alter table orders enable row level security;
alter table customers enable row level security;
alter table reviews enable row level security;
alter table blog_posts enable row level security;

-- Products: public read active, service role full access
create policy "Public can read active products"
  on products for select
  using (is_active = true);

create policy "Service role full access on products"
  on products for all
  using (auth.role() = 'service_role');

-- Orders: service role only
create policy "Service role full access on orders"
  on orders for all
  using (auth.role() = 'service_role');

-- Customers: service role only
create policy "Service role full access on customers"
  on customers for all
  using (auth.role() = 'service_role');

-- Reviews: public read approved, public insert, service role full
create policy "Public can read approved reviews"
  on reviews for select
  using (is_approved = true);

create policy "Public can submit reviews"
  on reviews for insert
  with check (true);

create policy "Service role full access on reviews"
  on reviews for all
  using (auth.role() = 'service_role');

-- Blog: public read published
create policy "Public can read published posts"
  on blog_posts for select
  using (is_published = true);

create policy "Service role full access on blog_posts"
  on blog_posts for all
  using (auth.role() = 'service_role');

-- Supabase Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict do nothing;
```

**Step 2: Run migration in Supabase**

Go to your Supabase project → SQL Editor → paste and run the migration file contents.

Expected: All 5 tables created, RLS enabled, policies set.

**Step 3: Verify tables exist**

In Supabase Table Editor, confirm: `products`, `orders`, `customers`, `reviews`, `blog_posts` all visible.

**Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase schema migration with RLS policies"
```

---

## Task 4: Cart Store (Zustand)

**Files:**
- Create: `lib/cart-store.ts`
- Create: `hooks/useCart.ts`

**Step 1: Create Zustand cart store**

Create `lib/cart-store.ts`:
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  slug: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  get total(): number
  get itemCount(): number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
      },

      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: qty } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      get total() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
    }),
    {
      name: 'luxeskinglow-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
```

**Step 2: Create useCart hook**

Create `hooks/useCart.ts`:
```ts
'use client'

import { useCartStore } from '@/lib/cart-store'

export function useCart() {
  const store = useCartStore()
  return {
    items: store.items,
    isOpen: store.isOpen,
    total: store.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    itemCount: store.items.reduce((sum, i) => sum + i.quantity, 0),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    openCart: store.openCart,
    closeCart: store.closeCart,
  }
}
```

**Step 3: Commit**

```bash
git add lib/cart-store.ts hooks/useCart.ts
git commit -m "feat: add Zustand cart store with localStorage persistence"
```

---

## Task 5: Store Layout, Nav & CartDrawer

**Files:**
- Create: `app/(store)/layout.tsx`
- Create: `components/store/Navbar.tsx`
- Create: `components/store/Footer.tsx`
- Create: `components/store/CartDrawer.tsx`
- Create: `components/store/FloatingCartButton.tsx`

**Step 1: Create store layout**

Create `app/(store)/layout.tsx`:
```tsx
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import CartDrawer from '@/components/store/CartDrawer'
import FloatingCartButton from '@/components/store/FloatingCartButton'
import { Toaster } from 'react-hot-toast'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <FloatingCartButton />
      <Toaster position="top-right" />
    </>
  )
}
```

**Step 2: Create Navbar**

Create `components/store/Navbar.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { ShoppingBag, Menu } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useState } from 'react'

export default function Navbar() {
  const { itemCount, openCart } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-40 bg-ivory/95 backdrop-blur-sm border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-heading text-2xl font-semibold text-charcoal tracking-wide">
            Luxeskinglow
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-sm text-charcoal/70 hover:text-gold transition-colors">
              Shop
            </Link>
            <Link href="/products?category=serums" className="text-sm text-charcoal/70 hover:text-gold transition-colors">
              Serums
            </Link>
            <Link href="/products?category=moisturisers" className="text-sm text-charcoal/70 hover:text-gold transition-colors">
              Moisturisers
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={openCart}
              className="relative p-2 text-charcoal hover:text-gold transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-charcoal"
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gold/20 flex flex-col gap-4">
            <Link href="/products" className="text-sm text-charcoal/70" onClick={() => setMobileOpen(false)}>Shop All</Link>
            <Link href="/products?category=serums" className="text-sm text-charcoal/70" onClick={() => setMobileOpen(false)}>Serums</Link>
            <Link href="/products?category=moisturisers" className="text-sm text-charcoal/70" onClick={() => setMobileOpen(false)}>Moisturisers</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
```

**Step 3: Create Footer**

Create `components/store/Footer.tsx`:
```tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-charcoal text-ivory/80 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading text-2xl text-ivory mb-4">Luxeskinglow</h3>
            <p className="text-sm text-ivory/60">Premium skincare for radiant, glowing skin.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ivory mb-4 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-gold transition-colors">All Products</Link></li>
              <li><Link href="/products?category=serums" className="hover:text-gold transition-colors">Serums</Link></li>
              <li><Link href="/products?category=moisturisers" className="hover:text-gold transition-colors">Moisturisers</Link></li>
              <li><Link href="/products?category=bundles" className="hover:text-gold transition-colors">Bundles</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ivory mb-4 uppercase tracking-wider">Help</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shipping" className="hover:text-gold transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-gold transition-colors">Returns</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-ivory/10 text-center text-xs text-ivory/40">
          © {new Date().getFullYear()} Luxeskinglow. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
```

**Step 4: Create CartDrawer**

Create `components/store/CartDrawer.tsx`:
```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-charcoal/50 z-50"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-ivory z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <h2 className="font-heading text-2xl text-charcoal">Your Cart</h2>
          <button onClick={closeCart} className="p-2 hover:text-gold transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-charcoal/50">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="font-heading text-xl">Your cart is empty</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="text-sm text-gold hover:text-gold-dark underline"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 bg-blush rounded-lg p-3">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-charcoal hover:text-gold line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gold font-semibold mt-1">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded hover:bg-gold/20 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded hover:bg-gold/20 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1 text-charcoal/40 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gold/20 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-charcoal/70">Subtotal</span>
              <span className="font-semibold text-charcoal">KES {total.toLocaleString()}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-gold hover:bg-gold-dark text-white text-center py-3 rounded-lg font-medium transition-colors"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-center text-sm text-charcoal/60 hover:text-gold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
```

**Step 5: Create FloatingCartButton**

Create `components/store/FloatingCartButton.tsx`:
```tsx
'use client'

import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

export default function FloatingCartButton() {
  const { itemCount, openCart } = useCart()

  return (
    <button
      onClick={openCart}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gold hover:bg-gold-dark text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      aria-label="Open cart"
    >
      <ShoppingBag size={22} />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-charcoal text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
          {itemCount}
        </span>
      )}
    </button>
  )
}
```

**Step 6: Verify layout renders**

```bash
npm run dev
```
Visit http://localhost:3000 — navbar and footer should be visible. Click floating cart button — drawer should open.

**Step 7: Commit**

```bash
git add app/ components/
git commit -m "feat: add store layout, navbar, footer, cart drawer, and floating cart button"
```

---

## Task 6: ProductCard Component

**Files:**
- Create: `components/store/ProductCard.tsx`

**Step 1: Create ProductCard**

Create `components/store/ProductCard.tsx`:
```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/lib/supabase/types'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

function getDiscountPercent(price: number, comparePrice: number | null): number | null {
  if (!comparePrice || comparePrice <= price) return null
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCart()
  const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0]
  const discount = getDiscountPercent(product.price, product.compare_price)
  const isLowStock = product.inventory_count > 0 && product.inventory_count <= product.low_stock_threshold
  const isOutOfStock = product.inventory_count === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isOutOfStock) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage?.url ?? '',
      slug: product.slug,
    })
    openCart()
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link href={`/products/${product.slug}`} className="group relative block">
      <div className="bg-blush border border-ivory-dark rounded-xl overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

          {/* Discount ribbon */}
          {discount && (
            <div className="absolute top-3 left-3 bg-gold text-white text-xs font-semibold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}

          {/* Low stock badge */}
          {isLowStock && (
            <div className="absolute top-3 right-3 bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded">
              Only {product.inventory_count} left!
            </div>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
              <span className="text-white font-medium text-sm">Out of Stock</span>
            </div>
          )}

          {/* Quick Add hover button */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-0 left-0 right-0 bg-gold text-white text-sm font-medium py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              Quick Add
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-heading text-lg text-charcoal line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gold font-semibold">KES {product.price.toLocaleString()}</span>
            {product.compare_price && (
              <span className="text-charcoal/40 line-through text-sm">
                KES {product.compare_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
```

**Step 2: Commit**

```bash
git add components/store/ProductCard.tsx
git commit -m "feat: add ProductCard component with hover quick-add and discount ribbon"
```

---

## Task 7: Homepage

**Files:**
- Create: `app/(store)/page.tsx`
- Create: `components/store/HeroSlider.tsx`
- Create: `components/store/TestimonialsCarousel.tsx`
- Create: `components/store/BeforeAfterSlider.tsx`

**Step 1: Create HeroSlider**

Create `components/store/HeroSlider.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'

const slides = [
  {
    id: 1,
    bg: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1920&q=80',
    headline: 'Glow From Within',
    subtext: 'Discover serums crafted for luminous, healthy skin',
  },
  {
    id: 2,
    bg: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1920&q=80',
    headline: 'Luxury Skincare',
    subtext: 'Premium formulas for every skin type',
  },
  {
    id: 3,
    bg: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=1920&q=80',
    headline: 'Real Results',
    subtext: 'Trusted by thousands of happy customers',
  },
]

export default function HeroSlider() {
  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, Navigation, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={{
          nextEl: '.hero-next',
          prevEl: '.hero-prev',
        }}
        loop
        className="h-[80vh]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="relative h-full flex items-center justify-center"
              style={{
                backgroundImage: `url(${slide.bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-charcoal/50" />

              {/* Gold glow */}
              <div className="absolute inset-0 hero-glow" />

              {/* Content */}
              <div className="relative z-10 text-center text-white px-4">
                <h1 className="font-heading text-5xl md:text-7xl font-light mb-4 leading-tight">
                  {slide.headline}
                </h1>
                <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg mx-auto">
                  {slide.subtext}
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-full font-medium transition-colors text-sm uppercase tracking-wider"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}

        <button className="hero-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-gold/80 hover:bg-gold text-white flex items-center justify-center transition-colors">
          ‹
        </button>
        <button className="hero-next absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-gold/80 hover:bg-gold text-white flex items-center justify-center transition-colors">
          ›
        </button>
      </Swiper>

      <style jsx global>{`
        .hero-glow {
          background: radial-gradient(ellipse at center, rgba(201, 168, 76, 0.15) 0%, transparent 70%);
          animation: pulse-glow 4s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
```

**Step 2: Create TestimonialsCarousel**

Create `components/store/TestimonialsCarousel.tsx`:
```tsx
'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { Star } from 'lucide-react'
import 'swiper/css'

const testimonials = [
  { id: 1, name: 'Amina K.', city: 'Nairobi', rating: 5, quote: 'My skin has never looked better! The Vitamin C serum is absolutely incredible.' },
  { id: 2, name: 'Grace M.', city: 'Mombasa', rating: 5, quote: 'I saw results within the first week. Luxeskinglow is now my go-to for skincare.' },
  { id: 3, name: 'Wanjiru N.', city: 'Kisumu', rating: 5, quote: 'The moisturiser is so lightweight yet deeply hydrating. Love every product I have tried.' },
  { id: 4, name: 'Fatuma O.', city: 'Nakuru', rating: 5, quote: 'Finally found products that work for my sensitive skin. Highly recommend the bundle!' },
]

export default function TestimonialsCarousel() {
  return (
    <section className="py-20 bg-blush">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-4xl md:text-5xl text-center text-charcoal mb-12">
          What Our Customers Say
        </h2>
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          slidesPerView={1}
          spaceBetween={24}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.id}>
              <div className="bg-ivory rounded-xl p-6 shadow-sm h-full">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-charcoal/80 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-charcoal text-sm">{t.name}</p>
                  <p className="text-charcoal/50 text-xs">{t.city}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
```

**Step 3: Create BeforeAfterSlider**

Create `components/store/BeforeAfterSlider.tsx`:
```tsx
'use client'

import ReactCompareImage from 'react-compare-image'

const transformations = [
  {
    id: 1,
    before: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    after: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80',
    label: '4 weeks with Vitamin C Serum',
  },
  {
    id: 2,
    before: 'https://images.unsplash.com/photo-1603217039863-aa0c865404f7?w=600&q=80',
    after: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&q=80',
    label: '6 weeks with Hydration Bundle',
  },
]

export default function BeforeAfterSlider() {
  return (
    <section className="py-20 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-4xl md:text-5xl text-center text-gold mb-4">
          Real Results
        </h2>
        <p className="text-center text-charcoal/60 mb-12 text-sm">Drag the slider to see the transformation</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {transformations.map((t) => (
            <div key={t.id}>
              <ReactCompareImage
                leftImage={t.before}
                rightImage={t.after}
                leftImageLabel="Before"
                rightImageLabel="After"
                sliderLineColor="#C9A84C"
                sliderHandleColor="#C9A84C"
              />
              <p className="text-center text-sm text-charcoal/60 mt-3">{t.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Step 4: Create Homepage**

Create `app/(store)/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import HeroSlider from '@/components/store/HeroSlider'
import ProductCard from '@/components/store/ProductCard'
import BeforeAfterSlider from '@/components/store/BeforeAfterSlider'
import TestimonialsCarousel from '@/components/store/TestimonialsCarousel'
import type { Product } from '@/lib/supabase/types'

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(4)
  return (data as Product[]) ?? []
}

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <>
      <HeroSlider />

      {/* Featured Products */}
      <section className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-4xl md:text-5xl text-center text-charcoal mb-4">
            Bestsellers
          </h2>
          <p className="text-center text-charcoal/60 mb-12 text-sm">
            Loved by thousands — discover your new skincare ritual
          </p>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-charcoal/40">Products coming soon.</p>
          )}
        </div>
      </section>

      <BeforeAfterSlider />
      <TestimonialsCarousel />
    </>
  )
}
```

**Step 5: Verify homepage renders**

```bash
npm run dev
```
Visit http://localhost:3000 — hero slider, products section, before/after, testimonials should all be visible.

**Step 6: Commit**

```bash
git add app/ components/
git commit -m "feat: add homepage with hero slider, featured products, before/after, and testimonials"
```

---

## Task 8: Product Grid Page

**Files:**
- Create: `app/(store)/products/page.tsx`
- Create: `hooks/useProducts.ts`

**Step 1: Create useProducts hook**

Create `hooks/useProducts.ts`:
```ts
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/supabase/types'

interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  sort?: 'newest' | 'price_asc' | 'price_desc'
}

export function useProducts(filters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const supabase = createClient()
      let query = supabase.from('products').select('*').eq('is_active', true)

      if (filters.category) query = query.eq('category', filters.category)
      if (filters.minPrice) query = query.gte('price', filters.minPrice)
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
      if (filters.inStockOnly) query = query.gt('inventory_count', 0)

      if (filters.sort === 'price_asc') query = query.order('price', { ascending: true })
      else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data } = await query
      setProducts((data as Product[]) ?? [])
      setLoading(false)
    }
    fetch()
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.inStockOnly, filters.sort])

  return { products, loading }
}
```

**Step 2: Create Products page**

Create `app/(store)/products/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/store/ProductCard'
import { SlidersHorizontal } from 'lucide-react'

const CATEGORIES = ['Serums', 'Moisturisers', 'Bundles']

export default function ProductsPage() {
  const [category, setCategory] = useState<string | undefined>()
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [showFilters, setShowFilters] = useState(false)

  const { products, loading } = useProducts({ category, inStockOnly, sort })

  return (
    <div className="pt-16 min-h-screen bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl text-charcoal">All Products</h1>
            <p className="text-charcoal/60 text-sm mt-1">{products.length} products</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="text-sm border border-gold/30 rounded-lg px-3 py-2 bg-ivory text-charcoal focus:outline-none focus:border-gold"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-charcoal/70 hover:text-gold transition-colors md:hidden"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-56 flex-shrink-0`}>
            <div className="bg-blush rounded-xl p-6 space-y-6 sticky top-20">
              <div>
                <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-3">Category</h3>
                <button
                  onClick={() => setCategory(undefined)}
                  className={`block text-sm mb-2 ${!category ? 'text-gold font-medium' : 'text-charcoal/70 hover:text-gold'} transition-colors`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(category === cat.toLowerCase() ? undefined : cat.toLowerCase())}
                    className={`block text-sm mb-2 ${category === cat.toLowerCase() ? 'text-gold font-medium' : 'text-charcoal/70 hover:text-gold'} transition-colors`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-3">Availability</h3>
                <label className="flex items-center gap-2 text-sm text-charcoal/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-gold"
                  />
                  In stock only
                </label>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-blush rounded-xl aspect-square animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-charcoal/40">
                <p className="font-heading text-2xl mb-2">No products found</p>
                <button onClick={() => { setCategory(undefined); setInStockOnly(false) }} className="text-sm text-gold hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Verify products page**

Visit http://localhost:3000/products — grid should show, filters should work.

**Step 4: Commit**

```bash
git add app/\(store\)/products/page.tsx hooks/useProducts.ts
git commit -m "feat: add product grid page with category filters and sort"
```

---

## Task 9: Product Detail Page

**Files:**
- Create: `app/(store)/products/[slug]/page.tsx`
- Create: `components/store/ProductZoom.tsx`

**Step 1: Create ProductZoom**

Create `components/store/ProductZoom.tsx`:
```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@/lib/supabase/types'

interface ProductZoomProps {
  images: ProductImage[]
  productName: string
}

export default function ProductZoom({ images, productName }: ProductZoomProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = images[activeIdx]

  if (!images.length) return null

  return (
    <div>
      <div className="relative aspect-square rounded-xl overflow-hidden bg-blush mb-3">
        <Image
          src={active.url}
          alt={active.alt || productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIdx ? 'border-gold' : 'border-transparent'
              }`}
            >
              <Image src={img.url} alt={img.alt || productName} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Create Product Detail page**

Create `app/(store)/products/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductZoom from '@/components/store/ProductZoom'
import AddToCartButton from '@/components/store/AddToCartButton'
import ProductCard from '@/components/store/ProductCard'
import { Star } from 'lucide-react'
import type { Product, Review } from '@/lib/supabase/types'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const supabase = createClient()
  const { data } = await supabase.from('products').select('slug').eq('is_active', true)
  return (data ?? []).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!product) return {}

  const primaryImage = (product.images as any[])?.[0]

  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: {
      images: primaryImage ? [primaryImage.url] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const supabase = createClient()

  const [{ data: product }, { data: reviews }, { data: related }] = await Promise.all([
    supabase.from('products').select('*').eq('slug', params.slug).single(),
    supabase.from('reviews').select('*').eq('product_id', params.slug).eq('is_approved', true),
    supabase.from('products').select('*').eq('is_active', true).neq('slug', params.slug).limit(4),
  ])

  if (!product) notFound()

  const p = product as Product
  const r = (reviews ?? []) as Review[]
  const rel = (related ?? []) as Product[]
  const avgRating = r.length ? r.reduce((s, rv) => s + rv.rating, 0) / r.length : null

  return (
    <div className="pt-16 min-h-screen bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Product */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <ProductZoom images={p.images} productName={p.name} />

          <div>
            <p className="text-xs text-gold uppercase tracking-widest mb-2">{p.category}</p>
            <h1 className="font-heading text-4xl text-charcoal mb-2">{p.name}</h1>

            {avgRating && (
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(avgRating) ? 'fill-gold text-gold' : 'text-charcoal/20'} />
                ))}
                <span className="text-xs text-charcoal/50 ml-1">({r.length} reviews)</span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-semibold text-gold">KES {p.price.toLocaleString()}</span>
              {p.compare_price && (
                <span className="text-lg text-charcoal/40 line-through">KES {p.compare_price.toLocaleString()}</span>
              )}
            </div>

            <p className="text-sm text-charcoal/60 mb-2">
              {p.inventory_count > 0
                ? p.inventory_count <= p.low_stock_threshold
                  ? `⚠️ Only ${p.inventory_count} left in stock`
                  : `✓ ${p.inventory_count} in stock`
                : '✗ Out of stock'}
            </p>

            <AddToCartButton product={p} />
          </div>
        </div>

        {/* Reviews */}
        {r.length > 0 && (
          <section className="mb-20">
            <h2 className="font-heading text-3xl text-charcoal mb-8">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {r.map((review) => (
                <div key={review.id} className="bg-blush rounded-xl p-6">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={14} className="fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-charcoal/80 mb-3">"{review.comment}"</p>
                  <p className="text-xs text-charcoal/50 font-medium">{review.customer_name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {rel.length > 0 && (
          <section>
            <h2 className="font-heading text-3xl text-charcoal mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {rel.map((rp) => <ProductCard key={rp.id} product={rp} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Create AddToCartButton (client component)**

Create `components/store/AddToCartButton.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/lib/supabase/types'
import toast from 'react-hot-toast'

export default function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const { addItem, openCart } = useCart()
  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0]
  const isOutOfStock = product.inventory_count === 0

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: primaryImage?.url ?? '',
        slug: product.slug,
      })
    }
    openCart()
    toast.success(`${product.name} added to cart`)
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-charcoal/70">Qty:</span>
        <div className="flex items-center border border-gold/30 rounded-lg">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:text-gold">−</button>
          <span className="px-4 py-2 text-sm">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:text-gold">+</button>
        </div>
      </div>
      <button
        onClick={handleAdd}
        disabled={isOutOfStock}
        className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark disabled:bg-charcoal/20 disabled:cursor-not-allowed text-white py-4 rounded-xl font-medium transition-colors"
      >
        <ShoppingBag size={18} />
        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  )
}
```

**Step 4: Verify product detail page**

After seeding (Task 13), visit http://localhost:3000/products/[a-product-slug] — image, price, add to cart should work.

**Step 5: Commit**

```bash
git add app/ components/
git commit -m "feat: add product detail page with image zoom, reviews, and related products"
```

---

## Task 10: Checkout Page

**Files:**
- Create: `app/(store)/checkout/page.tsx`
- Create: `app/(store)/checkout/success/page.tsx`
- Create: `components/store/CheckoutForm.tsx`

**Step 1: Create CheckoutForm**

Create `components/store/CheckoutForm.tsx`:
```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import Image from 'next/image'
import { useState } from 'react'

const schema = z.object({
  full_name: z.string().min(2, 'Full name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().regex(/^(\+254|0)[0-9]{9}$/, 'Enter a valid Kenyan phone number'),
  street: z.string().min(3, 'Street address required'),
  city: z.string().min(2, 'City required'),
  county: z.string().min(2, 'County required'),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const SHIPPING_FEE = 300

export default function CheckoutForm() {
  const { items, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const grandTotal = total + SHIPPING_FEE

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!items.length) return
    setLoading(true)

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: data.full_name,
          customer_email: data.email,
          customer_phone: data.phone,
          shipping_address: {
            street: data.street,
            city: data.city,
            county: data.county,
            postal_code: data.postal_code ?? '',
          },
          notes: data.notes ?? '',
          items,
          subtotal: total,
          shipping_fee: SHIPPING_FEE,
          total: grandTotal,
        }),
      })

      const json = await res.json()
      if (json.authorization_url) {
        window.location.href = json.authorization_url
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full border border-gold/30 rounded-lg px-4 py-3 text-sm bg-ivory focus:outline-none focus:border-gold transition-colors'
  const errorClass = 'text-red-500 text-xs mt-1'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="font-heading text-2xl text-charcoal mb-6">Shipping Details</h2>

        <div>
          <input {...register('full_name')} placeholder="Full Name" className={inputClass} />
          {errors.full_name && <p className={errorClass}>{errors.full_name.message}</p>}
        </div>
        <div>
          <input {...register('email')} type="email" placeholder="Email Address" className={inputClass} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
        <div>
          <input {...register('phone')} placeholder="Phone (+254...)" className={inputClass} />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
        <div>
          <input {...register('street')} placeholder="Street Address" className={inputClass} />
          {errors.street && <p className={errorClass}>{errors.street.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input {...register('city')} placeholder="City" className={inputClass} />
            {errors.city && <p className={errorClass}>{errors.city.message}</p>}
          </div>
          <div>
            <input {...register('county')} placeholder="County" className={inputClass} />
            {errors.county && <p className={errorClass}>{errors.county.message}</p>}
          </div>
        </div>
        <input {...register('postal_code')} placeholder="Postal Code (optional)" className={inputClass} />
        <textarea {...register('notes')} placeholder="Order notes (optional)" rows={3} className={inputClass} />

        <button
          type="submit"
          disabled={loading || !items.length}
          className="w-full bg-gold hover:bg-gold-dark disabled:bg-charcoal/20 text-white py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Lock size={16} />
          {loading ? 'Processing...' : `Pay KES ${grandTotal.toLocaleString()}`}
        </button>

        <div className="flex items-center justify-center gap-4 text-xs text-charcoal/40 mt-2">
          <span className="flex items-center gap-1"><Lock size={12} /> Secure Checkout</span>
          <span>Powered by Paystack</span>
        </div>
      </form>

      {/* Order Summary */}
      <div className="bg-blush rounded-xl p-6 h-fit">
        <h2 className="font-heading text-2xl text-charcoal mb-6">Order Summary</h2>
        <ul className="space-y-3 mb-6">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 items-center">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal line-clamp-1">{item.name}</p>
                <p className="text-xs text-charcoal/50">x{item.quantity}</p>
              </div>
              <p className="text-sm text-gold font-semibold">KES {(item.price * item.quantity).toLocaleString()}</p>
            </li>
          ))}
        </ul>
        <div className="border-t border-gold/20 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-charcoal/70">
            <span>Subtotal</span>
            <span>KES {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-charcoal/70">
            <span>Shipping</span>
            <span>KES {SHIPPING_FEE.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-charcoal border-t border-gold/20 pt-2 mt-2">
            <span>Total</span>
            <span className="text-gold">KES {grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Create Checkout page**

Create `app/(store)/checkout/page.tsx`:
```tsx
import CheckoutForm from '@/components/store/CheckoutForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Checkout' }

export default function CheckoutPage() {
  return (
    <div className="pt-16 min-h-screen bg-ivory">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CheckoutForm />
      </div>
    </div>
  )
}
```

**Step 3: Create Success page**

Create `app/(store)/checkout/success/page.tsx`:
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/hooks/useCart'
import type { Order } from '@/lib/supabase/types'

export default function CheckoutSuccessPage() {
  const params = useSearchParams()
  const reference = params.get('reference')
  const { clearCart } = useCart()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    clearCart()
    if (!reference) { setLoading(false); return }

    async function fetchOrder() {
      const supabase = createClient()
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('reference', reference)
        .single()
      setOrder(data as Order)
      setLoading(false)
    }
    fetchOrder()
  }, [reference])

  return (
    <div className="pt-16 min-h-screen bg-ivory flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4 py-16">
        <div className="flex justify-center mb-6">
          <CheckCircle size={64} className="text-gold animate-bounce" />
        </div>
        <h1 className="font-heading text-4xl text-charcoal mb-4">Order Confirmed!</h1>
        {loading ? (
          <p className="text-charcoal/60">Loading order details...</p>
        ) : order ? (
          <>
            <p className="text-charcoal/70 mb-2">Order #{order.reference}</p>
            <p className="text-charcoal/70 mb-6">
              Total: <span className="font-semibold text-gold">KES {order.total.toLocaleString()}</span>
            </p>
            <p className="text-sm text-charcoal/50 mb-8">
              You will receive a confirmation email at {order.customer_email}
            </p>
          </>
        ) : (
          <p className="text-charcoal/60 mb-8">Your order has been placed successfully.</p>
        )}
        <Link href="/products" className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-full font-medium transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add app/ components/
git commit -m "feat: add checkout page with react-hook-form validation and order summary"
```

---

## Task 11: Paystack API Routes

**Files:**
- Create: `app/api/paystack/initialize/route.ts`
- Create: `app/api/paystack/webhook/route.ts`
- Create: `lib/paystack.ts`

**Step 1: Create Paystack helper**

Create `lib/paystack.ts`:
```ts
export function generateReference(): string {
  return `LXG-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export async function initializeTransaction(params: {
  email: string
  amount: number
  reference: string
  callback_url: string
  metadata?: Record<string, unknown>
}) {
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...params,
      amount: Math.round(params.amount * 100), // kobo
    }),
  })
  return res.json()
}
```

**Step 2: Create initialize route**

Create `app/api/paystack/initialize/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateReference, initializeTransaction } from '@/lib/paystack'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer_name, customer_email, customer_phone, shipping_address, notes, items, subtotal, shipping_fee, total } = body

    const reference = generateReference()

    // Create order
    const { error: orderError } = await supabase.from('orders').insert({
      reference,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      notes,
      items,
      subtotal,
      shipping_fee,
      total,
      status: 'pending',
    })

    if (orderError) throw orderError

    // Init Paystack
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const paystackRes = await initializeTransaction({
      email: customer_email,
      amount: total,
      reference,
      callback_url: `${siteUrl}/checkout/success?reference=${reference}`,
      metadata: { order_reference: reference, customer_name },
    })

    if (!paystackRes.data?.authorization_url) {
      throw new Error('Failed to get Paystack authorization URL')
    }

    return NextResponse.json({
      authorization_url: paystackRes.data.authorization_url,
      reference,
    })
  } catch (err) {
    console.error('[paystack/initialize]', err)
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 })
  }
}
```

**Step 3: Create webhook route**

Create `app/api/paystack/webhook/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  // Verify signature
  const expected = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex')

  if (signature !== expected) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === 'charge.success') {
    const { reference, metadata } = event.data
    const { customer } = event.data

    // Update order status
    const { data: order } = await supabase
      .from('orders')
      .update({ status: 'paid', paystack_data: event.data })
      .eq('reference', reference)
      .select('*')
      .single()

    if (order) {
      // Decrement inventory
      for (const item of order.items) {
        await supabase.rpc('decrement_inventory', {
          p_product_id: item.product_id,
          p_qty: item.qty,
        })
      }

      // Upsert customer
      await supabase.from('customers').upsert(
        {
          email: customer.email,
          name: customer.email, // will update properly once we have name
          total_orders: 1,
          total_spent: order.total,
          last_order_at: new Date().toISOString(),
        },
        {
          onConflict: 'email',
          ignoreDuplicates: false,
        }
      )
    }
  }

  return NextResponse.json({ received: true })
}
```

**Step 4: Add decrement_inventory Supabase function**

Run in Supabase SQL Editor:
```sql
create or replace function decrement_inventory(p_product_id uuid, p_qty integer)
returns void as $$
begin
  update products
  set inventory_count = greatest(0, inventory_count - p_qty)
  where id = p_product_id;
end;
$$ language plpgsql security definer;
```

**Step 5: Commit**

```bash
git add app/api/ lib/paystack.ts
git commit -m "feat: add Paystack initialize and webhook API routes"
```

---

## Task 12: SEO & Sitemap

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

**Step 1: Add JSON-LD to root layout**

Add to `app/layout.tsx` before closing `</body>`:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Luxeskinglow',
      url: process.env.NEXT_PUBLIC_SITE_URL,
      description: 'Premium skincare marketplace',
    }),
  }}
/>
```

**Step 2: Create sitemap**

Create `app/sitemap.ts`:
```ts
import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const productUrls = (products ?? []).map((p) => ({
    url: `${siteUrl}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
  }))

  return [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/products`, lastModified: new Date() },
    ...productUrls,
  ]
}
```

**Step 3: Create robots.ts**

Create `app/robots.ts`:
```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/checkout/', '/api/'] },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
```

**Step 4: Commit**

```bash
git add app/sitemap.ts app/robots.ts app/layout.tsx
git commit -m "feat: add sitemap, robots.txt, and JSON-LD schema"
```

---

## Task 13: Seed Data

**Files:**
- Create: `scripts/seed.ts`
- Create: `tsconfig.scripts.json`

**Step 1: Create seed script**

Create `scripts/seed.ts`:
```ts
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const products = [
  {
    name: 'Vitamin C Brightening Serum',
    slug: 'vitamin-c-brightening-serum',
    description: 'A potent 20% Vitamin C serum that visibly brightens skin and reduces dark spots within 4 weeks.',
    price: 2500,
    compare_price: 3200,
    category: 'serums',
    tags: ['vitamin-c', 'brightening', 'anti-aging'],
    inventory_count: 50,
    low_stock_threshold: 5,
    images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80', alt: 'Vitamin C Serum', is_primary: true }],
    is_active: true,
  },
  {
    name: 'Hyaluronic Acid Deep Hydration Serum',
    slug: 'hyaluronic-acid-serum',
    description: 'Triple-weight hyaluronic acid that plumps and hydrates all skin layers for 72-hour moisture.',
    price: 2200,
    compare_price: null,
    category: 'serums',
    tags: ['hyaluronic-acid', 'hydration', 'plumping'],
    inventory_count: 35,
    low_stock_threshold: 5,
    images: [{ url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80', alt: 'Hyaluronic Serum', is_primary: true }],
    is_active: true,
  },
  {
    name: 'Retinol Night Renewal Serum',
    slug: 'retinol-night-renewal-serum',
    description: 'Gentle 0.5% retinol encapsulated for slow release — reduces fine lines while you sleep.',
    price: 3200,
    compare_price: 4000,
    category: 'serums',
    tags: ['retinol', 'anti-aging', 'night'],
    inventory_count: 3,
    low_stock_threshold: 5,
    images: [{ url: 'https://images.unsplash.com/photo-1621232559379-6c99d89e6adf?w=800&q=80', alt: 'Retinol Serum', is_primary: true }],
    is_active: true,
  },
  {
    name: 'Ceramide Barrier Moisturiser',
    slug: 'ceramide-barrier-moisturiser',
    description: 'Rich ceramide complex that repairs and strengthens the skin barrier for dry and sensitive skin.',
    price: 1800,
    compare_price: null,
    category: 'moisturisers',
    tags: ['ceramide', 'barrier', 'dry-skin'],
    inventory_count: 60,
    low_stock_threshold: 5,
    images: [{ url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', alt: 'Ceramide Moisturiser', is_primary: true }],
    is_active: true,
  },
  {
    name: 'SPF 50+ Lightweight Sunscreen',
    slug: 'spf50-lightweight-sunscreen',
    description: 'Invisible, non-greasy broad-spectrum SPF 50+ — perfect under makeup.',
    price: 1500,
    compare_price: 1900,
    category: 'moisturisers',
    tags: ['spf', 'sunscreen', 'daily'],
    inventory_count: 80,
    low_stock_threshold: 10,
    images: [{ url: 'https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?w=800&q=80', alt: 'SPF Sunscreen', is_primary: true }],
    is_active: true,
  },
  {
    name: 'Niacinamide Pore Minimiser',
    slug: 'niacinamide-pore-minimiser',
    description: '10% niacinamide + zinc that visibly minimises pores and controls excess sebum.',
    price: 1900,
    compare_price: null,
    category: 'serums',
    tags: ['niacinamide', 'pores', 'oily-skin'],
    inventory_count: 45,
    low_stock_threshold: 5,
    images: [{ url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=800&q=80', alt: 'Niacinamide', is_primary: true }],
    is_active: true,
  },
  {
    name: 'Glow Starter Bundle',
    slug: 'glow-starter-bundle',
    description: 'Everything you need to start your glow journey: Vitamin C Serum + Hyaluronic Serum + SPF 50.',
    price: 5500,
    compare_price: 6200,
    category: 'bundles',
    tags: ['bundle', 'starter', 'glow'],
    inventory_count: 20,
    low_stock_threshold: 5,
    images: [{ url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80', alt: 'Glow Starter Bundle', is_primary: true }],
    is_active: true,
  },
  {
    name: 'Anti-Ageing Power Bundle',
    slug: 'anti-ageing-power-bundle',
    description: 'The ultimate anti-ageing routine: Retinol Serum + Ceramide Moisturiser + Vitamin C Serum.',
    price: 7200,
    compare_price: 9400,
    category: 'bundles',
    tags: ['bundle', 'anti-aging', 'retinol'],
    inventory_count: 15,
    low_stock_threshold: 5,
    images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80', alt: 'Anti-Ageing Bundle', is_primary: true }],
    is_active: true,
  },
]

const reviews = [
  {
    product_slug: 'vitamin-c-brightening-serum',
    customer_name: 'Amina Wanjiru',
    rating: 5,
    comment: 'This serum completely transformed my skin in 4 weeks. The dark spots are visibly lighter and my skin glows!',
    is_approved: true,
  },
  {
    product_slug: 'hyaluronic-acid-serum',
    customer_name: 'Grace Muthoni',
    rating: 5,
    comment: 'My skin feels incredibly plump and hydrated. I wake up looking refreshed every morning.',
    is_approved: true,
  },
  {
    product_slug: 'ceramide-barrier-moisturiser',
    customer_name: 'Fatuma Odhiambo',
    rating: 4,
    comment: 'Perfect for my dry skin. No more tight feeling after washing my face. Really happy with this!',
    is_approved: true,
  },
]

async function seed() {
  console.log('🌱 Seeding Luxeskinglow database...')

  // Insert products
  const { data: insertedProducts, error: productError } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'slug' })
    .select()

  if (productError) {
    console.error('❌ Products error:', productError)
    return
  }
  console.log(`✅ ${insertedProducts?.length} products inserted`)

  // Insert reviews
  for (const review of reviews) {
    const product = insertedProducts?.find((p) => p.slug === review.product_slug)
    if (!product) continue

    const { error } = await supabase.from('reviews').insert({
      product_id: product.id,
      customer_name: review.customer_name,
      rating: review.rating,
      comment: review.comment,
      is_approved: review.is_approved,
    })
    if (error) console.error('Review error:', error)
  }
  console.log(`✅ ${reviews.length} reviews inserted`)

  console.log('🎉 Seed complete!')
}

seed().catch(console.error)
```

**Step 2: Add ts-node config**

Create `tsconfig.scripts.json`:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "outDir": "dist-scripts"
  },
  "include": ["scripts/**/*", "lib/**/*"]
}
```

**Step 3: Add seed script to package.json**

In `package.json` scripts:
```json
"seed": "ts-node --project tsconfig.scripts.json scripts/seed.ts"
```

**Step 4: Run seed**

```bash
npm run seed
```
Expected:
```
🌱 Seeding Luxeskinglow database...
✅ 8 products inserted
✅ 3 reviews inserted
🎉 Seed complete!
```

**Step 5: Verify in Supabase**

Check Supabase Table Editor → products table should have 8 rows.

**Step 6: Commit**

```bash
git add scripts/ tsconfig.scripts.json package.json
git commit -m "feat: add seed script with 8 products and 3 reviews"
```

---

## Task 14: Final Verification

**Step 1: Start dev server and smoke test all routes**

```bash
npm run dev
```

Check each route:
- [ ] `http://localhost:3000` — homepage loads with hero, products, before/after, testimonials
- [ ] `http://localhost:3000/products` — product grid loads, filters work
- [ ] `http://localhost:3000/products/vitamin-c-brightening-serum` — product detail loads
- [ ] Add to cart — cart drawer opens, item shown
- [ ] `http://localhost:3000/checkout` — form renders, order summary shows cart items
- [ ] `http://localhost:3000/sitemap.xml` — XML sitemap generated

**Step 2: Build check**

```bash
npm run build
```
Expected: Build completes with no errors.

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: Sprint 1 MVP complete — Luxeskinglow store with Paystack checkout"
```

---

## Environment Setup Reminder

Before running the dev server, ensure `.env.local` has:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings (keep secret!)
- `PAYSTACK_SECRET_KEY` — from Paystack dashboard (test key: `sk_test_...`)
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — from Paystack dashboard (test key: `pk_test_...`)
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev

---

## Sprint 2 Preview

After this MVP ships:
- Admin dashboard (Supabase Auth, products CRUD, orders management, analytics)
- Blog (MDX)
- Connect TechScrafts/TEC Linear workspace for issue tracking
