# Hero Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the landing page into a split hero (text left, drag-to-compare slider right) above the fold, and a before/after gallery section below.

**Architecture:** `HeroSection` becomes a two-column layout; a new `CompareSlider` client component handles the drag interaction via pointer events + CSS clip-path. `BeforeAfterSection` is replaced with a gallery driven by a `pairs` array. Images are replaced in `public/`.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, `next/image`

---

### Task 1: Copy new images into public/

**Files:**
- Modify: `public/before.png` (replace)
- Modify: `public/after.png` (replace)

**Step 1: Copy the before image**

Run from the project root:
```bash
cp "C:/Users/user/Downloads/WhatsApp Image 2026-03-25 at 11.28.11.jpeg" public/before.png
```

**Step 2: Copy the after image**

```bash
cp "C:/Users/user/Downloads/Gemini_Generated_Image_mcrd6cmcrd6cmcrd.png" public/after.png
```

**Step 3: Verify files exist**

```bash
ls -lh public/before.png public/after.png
```
Expected: both files listed with non-zero size.

**Step 4: Commit**

```bash
git add public/before.png public/after.png
git commit -m "chore: replace placeholder images with real before/after photos"
```

---

### Task 2: Create CompareSlider component

**Files:**
- Create: `src/components/CompareSlider.tsx`

**Step 1: Create the file**

```tsx
"use client"

import { useRef, useState, useCallback } from "react"
import Image from "next/image"

type Props = {
  beforeSrc: string
  afterSrc: string
  beforeAlt: string
  afterAlt: string
}

export default function CompareSlider({ beforeSrc, afterSrc, beforeAlt, afterAlt }: Props) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current
    if (!container) return
    const { left, width } = container.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((clientX - left) / width) * 100))
    setPosition(pct)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.buttons !== 1) return
    updatePosition(e.clientX)
  }, [updatePosition])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    updatePosition(e.clientX)
  }, [updatePosition])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden cursor-col-resize select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {/* Before layer (base) */}
      <Image
        src={beforeSrc}
        alt={beforeAlt}
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />

      {/* After layer (clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={afterSrc}
          alt={afterAlt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Drag handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M5 4l-3 4 3 4M11 4l3 4-3 4" stroke="#1A2E35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded pointer-events-none">
        Before
      </span>
      <span className="absolute bottom-3 right-3 bg-brand text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded pointer-events-none">
        After
      </span>
    </div>
  )
}
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 3: Commit**

```bash
git add src/components/CompareSlider.tsx
git commit -m "feat: add CompareSlider drag-to-compare component"
```

---

### Task 3: Refactor HeroSection to split layout

**Files:**
- Modify: `src/components/HeroSection.tsx`

**Step 1: Replace the file contents**

```tsx
import WaitlistForm from "./WaitlistForm"
import CompareSlider from "./CompareSlider"

export default function HeroSection() {
  return (
    <section className="relative bg-brand-navy min-h-screen flex items-center px-4 sm:px-6 overflow-hidden">

      {/* Decorative background blobs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-brand rounded-full blur-3xl opacity-10 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-brand rounded-full blur-3xl opacity-10 pointer-events-none" />

      <div className="relative w-full max-w-6xl mx-auto py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: text + form */}
          <div className="flex flex-col gap-5">
            <span className="animate-fade-in-up anim-delay-100 inline-flex items-center gap-2 text-xs font-semibold bg-brand/20 text-brand px-4 py-2 rounded-full border border-brand/30 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block animate-pulse-dot" />
              AI Product Photography — Launching Soon
            </span>

            <h1 className="animate-fade-in-up anim-delay-200 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
              Skip the model.{" "}
              <span className="text-brand">Skip the studio.</span>
              {" "}Just great product photos.
            </h1>

            <p className="animate-fade-in-up anim-delay-300 text-base sm:text-lg text-gray-400 max-w-lg leading-relaxed">
              Upload your product and ShelfReady&apos;s AI places it on a realistic
              model, in a professional lifestyle scene — ready in seconds.
              Used by online sellers worldwide.
            </p>

            <div id="waitlist" className="animate-fade-in-up anim-delay-400 w-full">
              <WaitlistForm />
            </div>

            <p className="animate-fade-in anim-delay-500 text-xs text-gray-500 flex items-center gap-2">
              <span>No credit card required</span>
              <span className="w-1 h-1 rounded-full bg-gray-600 inline-block" />
              <span>Free early access</span>
              <span className="w-1 h-1 rounded-full bg-gray-600 inline-block" />
              <span>Cancel anytime</span>
            </p>
          </div>

          {/* Right: compare slider */}
          <div className="animate-fade-in-up anim-delay-300 w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <CompareSlider
              beforeSrc="/before.png"
              afterSrc="/after.png"
              beforeAlt="Clothing on mannequins in a store — the old way"
              afterAlt="AI-generated model wearing the same clothing in a lifestyle scene"
            />
            <p className="text-center text-xs text-gray-600 mt-3">
              Drag to compare → real result from ShelfReady
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 3: Check in browser**

Open `http://localhost:3001`. Verify:
- Two-column layout on a wide viewport
- Slider is visible and draggable
- Form is above the fold on a 1280px wide screen
- On a narrow viewport (devtools mobile), stacks vertically

**Step 4: Commit**

```bash
git add src/components/HeroSection.tsx
git commit -m "feat: restructure hero to split layout with compare slider"
```

---

### Task 4: Replace BeforeAfterSection with gallery

**Files:**
- Modify: `src/components/BeforeAfterSection.tsx`

**Step 1: Replace the file contents**

```tsx
import Image from "next/image"
import ScrollReveal from "./ScrollReveal"

type Pair = {
  beforeSrc: string
  afterSrc: string
  beforeAlt: string
  afterAlt: string
  beforeCaption: string
  afterCaption: string
}

const pairs: Pair[] = [
  {
    beforeSrc: "/before.png",
    afterSrc: "/after.png",
    beforeAlt: "Clothing on mannequins in a store",
    afterAlt: "AI-generated model in a lifestyle scene",
    beforeCaption: "Mannequin shoot — flat lighting, no lifestyle feel. Costs $500–$2,000 and takes days.",
    afterCaption: "AI-generated model, lifestyle background, professional lighting — ready in seconds.",
  },
]

export default function BeforeAfterSection() {
  return (
    <section className="bg-[#f8faf9] min-h-screen flex items-center py-20 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto">

        <ScrollReveal className="reveal">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-brand-navy mb-2">
            The old way vs. the ShelfReady way
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto text-sm">
            Same product. Same colors. The only difference? One took a $1,500 shoot. The other took seconds.
          </p>
        </ScrollReveal>

        <div className="flex flex-col gap-16">
          {pairs.map((pair, i) => (
            <div key={i} className="grid sm:grid-cols-2 gap-4 items-start">

              {/* Before */}
              <ScrollReveal className="reveal-left">
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={pair.beforeSrc}
                      alt={pair.beforeAlt}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-xs font-bold text-white uppercase tracking-widest px-3 py-1.5 rounded">
                      Before
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-brand-navy mb-1">The Old Way</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{pair.beforeCaption}</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* After */}
              <ScrollReveal className="reveal-right">
                <div className="bg-white border-2 border-brand shadow-sm rounded-lg overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={pair.afterSrc}
                      alt={pair.afterAlt}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute top-3 left-3 bg-brand text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded">
                      With ShelfReady
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-brand mb-1">With ShelfReady</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{pair.afterCaption}</p>
                  </div>
                </div>
              </ScrollReveal>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 3: Check in browser**

Scroll past the hero. Verify:
- Gallery heading and subtext render correctly
- Before/after cards display the new images
- ScrollReveal animations trigger on scroll

**Step 4: Commit**

```bash
git add src/components/BeforeAfterSection.tsx
git commit -m "feat: replace BeforeAfterSection with extensible pairs gallery"
```

---

## Done

Run `npm run lint` to catch any remaining issues, then do a final visual check at mobile (375px), tablet (768px), and desktop (1280px) widths.
