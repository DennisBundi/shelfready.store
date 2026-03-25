# Design: Generate Page Redesign + Bug Fixes

**Date:** 2026-03-25
**Status:** Approved

## Bug Fixes

### Logo broken
`AppNav` uses `<Image src="/logo.png">` but no `logo.png` exists in `/public/`. Fix by replacing with the existing `Logo` SVG component from `src/components/Logo.tsx`. The Logo component's "Shelf" text is white (`#ffffff`) — change it to `brand-navy` (`#1A2E35`) for visibility on the white navbar background.

### Upload silently fails
The `product-images` Supabase Storage bucket is private. `getPublicUrl()` returns a URL that is not accessible without auth. The server action's `fetch(inputImageUrl)` then fails silently.

Fix in `UploadZone.tsx`: after a successful upload, call `createSignedUrl(path, 3600)` instead of `getPublicUrl(path)`. Pass the signed URL to `onUpload`.

Fix in `generate.ts`: after uploading the output image, call `createSignedUrl(outputPath, 86400)` (24-hour TTL) for the result URL returned to the client.

---

## Generate Page Redesign

### Layout
Centered white card (`max-w-lg`, rounded-2xl, shadow-sm) on the existing gray background. The card contains all 3 steps.

### Step Indicator
3 dots at the top of the card:
- Completed step: filled brand-green circle
- Current step: filled brand-green circle with ring
- Upcoming step: outline circle (gray)

### Step 1 — Upload
- Heading: "Upload your product"
- Subtext: "A clean photo on any background works best"
- Upload zone: full-width, `aspect-video` (wider, less square) — drag & drop or click to browse
- Preview replaces the zone once image is selected
- "Continue →" button — disabled until `imageUrl` is set and upload is complete

### Step 2 — Choose Style
- "← Back" text button top-left
- Heading: "Choose a style"
- Subtext: "Pick the background for your product shot"
- 2×2 preset grid (full card width)
- "Generate Photo" button — disabled until a preset is selected

### Step 3 — Result
- Step indicator hidden
- Done state: output image (full width) + "Download photo" button + "Generate another →" link that resets to Step 1
- Gated state: blurred input image + upgrade overlay (unchanged from current)
- Error state: error message + "Try again" button that returns to Step 2

### State machine
`upload → style → result`

Local `step` state (`1 | 2 | 3`) replaces the existing `UIState` enum. Existing `imageUrl`, `preset`, `uiState` (generating/done/gated/error), `outputUrl`, and `errorMsg` states are preserved.

---

## Files Changed
- `src/components/app/AppNav.tsx` — use Logo component, fix text color
- `src/components/Logo.tsx` — change "Shelf" color to brand-navy for light backgrounds
- `src/components/generate/UploadZone.tsx` — switch to createSignedUrl
- `src/app/actions/generate.ts` — switch output URL to createSignedUrl
- `src/components/generate/GenerateClient.tsx` — full redesign with step wizard
