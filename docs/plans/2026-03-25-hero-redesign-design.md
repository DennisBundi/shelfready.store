# Hero Redesign Design

**Date:** 2026-03-25
**Status:** Approved

## Goal

Restructure the landing page into two sections:
1. A split hero (above fold) with headline + form on the left and a drag-to-compare slider on the right.
2. A before/after gallery section (below fold) replacing the current `BeforeAfterSection`.

---

## Section 1: Hero

### Layout
- Two-column grid on desktop (50/50), single column on mobile (text first, then slider).
- Dark navy background (`bg-brand-navy`) — unchanged from current hero.
- Existing decorative blobs retained.

### Left Column
- Eyebrow badge (unchanged)
- Headline + subheadline (unchanged)
- `WaitlistForm` component
- Trust line ("No credit card required · Free early access · Cancel anytime")
- Scroll indicator removed (no longer needed — form is above fold)

### Right Column: Drag-to-Compare Slider
- Rounded card, ~4/5 aspect ratio, max-width ~500px on desktop.
- "Before" layer: full-size `<Image>` of mannequin store photo (`/before.png`).
- "After" layer: full-size `<Image>` stacked on top, clipped via `clip-path: inset(0 {100-pos}% 0 0)`.
- `position` state (0–100, default 50) controlled by pointer/touch drag on the container.
- Drag handle: vertical white line + circular icon centered at the split point, absolutely positioned.
- "Before" / "After" labels pinned to bottom-left and bottom-right corners.
- Component: `CompareSlider.tsx` — `"use client"`, self-contained.

### Implementation Detail
```tsx
// clip-path reveals the "after" image as position increases
style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
```
Pointer events: `onPointerDown` on container → `setPointerCapture` → track `clientX` relative to container bounds → clamp to [0, 100].

---

## Section 2: Before/After Gallery

### Layout
- Background: `bg-[#f8faf9]` (unchanged).
- Section heading: "The old way vs. the ShelfReady way" (unchanged text).
- Gallery grid: `pairs` array → maps to static before/after card pairs.
- Single pair for now, centered at max-width ~800px. Grid is extensible (add objects to `pairs`).

### Card Pair Structure
- Before card (left): white border, "Before" badge, caption.
- After card (right): brand border, "With ShelfReady" badge, caption.
- Same card styling as current `BeforeAfterSection`.
- `ScrollReveal` animations retained on the heading and cards.

### Images
- Replace `/public/before.png` with the mannequin store photo.
- Replace `/public/after.png` with the AI-generated models photo.
- Source files:
  - `c:/Users/user/Downloads/WhatsApp Image 2026-03-25 at 11.28.11.jpeg` → `public/before.png`
  - `c:/Users/user/Downloads/Gemini_Generated_Image_mcrd6cmcrd6cmcrd.png` → `public/after.png`

---

## Files Changed

| File | Action |
|------|--------|
| `public/before.png` | Replace with mannequin photo |
| `public/after.png` | Replace with AI-generated models photo |
| `src/components/HeroSection.tsx` | Restructure to split layout, add `CompareSlider` |
| `src/components/CompareSlider.tsx` | New component — drag-to-compare slider |
| `src/components/BeforeAfterSection.tsx` | Replace with gallery structure using `pairs` array |

---

## Out of Scope
- Adding more before/after pairs (gallery is built to support it, content deferred)
- Any changes to `FeaturesSection`, `Footer`, `Navbar`, auth/app routes
