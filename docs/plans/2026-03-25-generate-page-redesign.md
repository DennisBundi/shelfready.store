# Generate Page Redesign + Bug Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix broken logo and upload, then redesign the generate page as a polished 3-step wizard.

**Architecture:** Logo component gets a `variant` prop for dark/light backgrounds. UploadZone switches from `getPublicUrl` to `createSignedUrl` so private bucket images are accessible. The generate server action uses `createSignedUrl` for output URLs too. GenerateClient is replaced with a step-wizard layout (step 1: upload, step 2: style, step 3: result) inside a white card.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, lucide-react, Supabase Storage

---

### Task 1: Fix Logo component — add variant prop

**Files:**
- Modify: `src/components/Logo.tsx`

The marketing Navbar uses Logo on a dark (`brand-navy`) background so "Shelf" is white — correct.
The app AppNav uses Logo on a white background so "Shelf" must be dark (`brand-navy`).
Add a `variant?: "light" | "dark"` prop. Default is `"light"` (white text, preserves marketing nav). `"dark"` switches "Shelf" to `brand-navy`.

**Step 1: Update Logo.tsx**

```tsx
export default function Logo({ className, variant = "light" }: { className?: string; variant?: "light" | "dark" }) {
  const textColor = variant === "dark" ? "#1A2E35" : "#ffffff"
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="3" y="9" width="30" height="22" rx="3" stroke="#1D9E75" strokeWidth="2.2" fill="none" />
        <path d="M3 15 L18 12 L33 15" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="18" y1="9" x2="18" y2="12" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="18" cy="23" r="5.5" stroke="#1D9E75" strokeWidth="2" fill="none" />
        <circle cx="18" cy="23" r="2" fill="#1D9E75" />
        <rect x="26" y="17" width="3" height="2" rx="1" fill="#1D9E75" />
      </svg>
      <span className="text-xl font-bold tracking-tight leading-none">
        <span style={{ color: textColor }}>Shelf</span>
        <span style={{ color: "#1D9E75" }}>Ready</span>
      </span>
    </div>
  )
}
```

**Step 2: Verify marketing Navbar still works**

Open `src/components/Navbar.tsx` — it uses `<Logo />` with no props, which defaults to `variant="light"` (white text on dark navy). No change needed there.

**Step 3: Commit**

```bash
git add src/components/Logo.tsx
git commit -m "feat: add variant prop to Logo for light/dark backgrounds"
```

---

### Task 2: Fix AppNav — replace broken Image with Logo component

**Files:**
- Modify: `src/components/app/AppNav.tsx`

**Step 1: Rewrite AppNav.tsx**

```tsx
import Link from "next/link"
import Logo from "@/components/Logo"

export default function AppNav() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/generate">
          <Logo variant="dark" />
        </Link>
        <Link
          href="/api/auth/signout"
          prefetch={false}
          className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
        >
          Sign out
        </Link>
      </nav>
    </header>
  )
}
```

**Step 2: Verify**

Run `npm run dev` and visit `http://localhost:3000/generate` (or whichever port). The navbar should show the ShelfReady logo with dark "Shelf" text and green "Ready" text. No broken image.

**Step 3: Commit**

```bash
git add src/components/app/AppNav.tsx
git commit -m "fix: replace broken logo.png with Logo component in AppNav"
```

---

### Task 3: Fix UploadZone — use createSignedUrl instead of getPublicUrl

**Files:**
- Modify: `src/components/generate/UploadZone.tsx`

The bucket is private. `getPublicUrl` returns a URL that returns 400. Switch to `createSignedUrl` which returns a time-limited authenticated URL the server action can fetch.

**Step 1: Replace the getPublicUrl call**

Find this block (around line 41-42):
```ts
const { data } = supabase.storage.from("product-images").getPublicUrl(path)
onUpload(data.publicUrl)
```

Replace with:
```ts
const { data: signedData, error: signedError } = await supabase.storage
  .from("product-images")
  .createSignedUrl(path, 3600)

if (signedError || !signedData) { setPreview(null); return }
onUpload(signedData.signedUrl)
```

**Step 2: Commit**

```bash
git add src/components/generate/UploadZone.tsx
git commit -m "fix: use createSignedUrl for private bucket in UploadZone"
```

---

### Task 4: Fix generate server action — use createSignedUrl for output URL

**Files:**
- Modify: `src/app/actions/generate.ts`

The output image is also in the private bucket. Replace `getPublicUrl` with `createSignedUrl` (24-hour TTL so users can download their result).

**Step 1: Replace lines 102-112**

Find:
```ts
const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(outputPath)

// Save generation record (demo_used already flipped atomically above)
await supabase.from("generations").insert({
  user_id: user.id,
  input_image_url: input.inputImageUrl,
  output_image_urls: [urlData.publicUrl],
  prompt_config: { preset: input.preset },
})

return { gated: false, outputUrl: urlData.publicUrl }
```

Replace with:
```ts
const { data: signedOutput, error: signedErr } = await supabase.storage
  .from("product-images")
  .createSignedUrl(outputPath, 86400) // 24 hours

if (signedErr || !signedOutput) throw new Error("Could not sign output URL")

// Save generation record (demo_used already flipped atomically above)
await supabase.from("generations").insert({
  user_id: user.id,
  input_image_url: input.inputImageUrl,
  output_image_urls: [signedOutput.signedUrl],
  prompt_config: { preset: input.preset },
})

return { gated: false, outputUrl: signedOutput.signedUrl }
```

**Step 2: Commit**

```bash
git add src/app/actions/generate.ts
git commit -m "fix: use createSignedUrl for output image in generate action"
```

---

### Task 5: Redesign GenerateClient — 3-step wizard

**Files:**
- Modify: `src/components/generate/GenerateClient.tsx`

Full rewrite. Replace the flat vertical layout with a white card containing a 3-step wizard. Step 1: upload. Step 2: choose style. Step 3: result.

**Step 1: Rewrite GenerateClient.tsx**

```tsx
"use client"

import { useState } from "react"
import UploadZone from "./UploadZone"
import PresetPicker, { type Preset } from "./PresetPicker"
import ResultArea from "./ResultArea"
import { Button } from "@/components/ui/button"
import { generateImage } from "@/app/actions/generate"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = 1 | 2 | 3
type GenerateState = "idle" | "generating" | "done" | "gated" | "error"

type Props = { userId: string }

function StepDots({ step }: { step: Step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {([1, 2, 3] as Step[]).map(s => (
        <div
          key={s}
          className={cn(
            "rounded-full transition-all duration-200",
            s < step
              ? "w-2 h-2 bg-brand"
              : s === step
              ? "w-2.5 h-2.5 bg-brand ring-2 ring-brand/30 ring-offset-1"
              : "w-2 h-2 border-2 border-gray-300 bg-white"
          )}
        />
      ))}
    </div>
  )
}

export default function GenerateClient({ userId }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [preset, setPreset] = useState<Preset | null>(null)
  const [uploading, setUploading] = useState(false)
  const [generateState, setGenerateState] = useState<GenerateState>("idle")
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleGenerate() {
    if (!imageUrl || !preset) return
    setGenerateState("generating")
    setStep(3)

    const result = await generateImage({ inputImageUrl: imageUrl, preset })

    if ("error" in result) {
      setErrorMsg(result.error)
      setGenerateState("error")
    } else if (result.gated) {
      setGenerateState("gated")
    } else {
      setOutputUrl(result.outputUrl)
      setGenerateState("done")
    }
  }

  function handleReset() {
    setStep(1)
    setImageUrl(null)
    setPreset(null)
    setGenerateState("idle")
    setOutputUrl(null)
    setErrorMsg(null)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        {/* Step 1: Upload */}
        {step === 1 && (
          <>
            <StepDots step={1} />
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-brand-navy">Upload your product</h2>
              <p className="text-sm text-gray-500 mt-1">A clean photo on any background works best</p>
            </div>
            <UploadZone
              userId={userId}
              onUpload={url => setImageUrl(url)}
              onClear={() => setImageUrl(null)}
              uploading={uploading}
              onUploading={setUploading}
            />
            <div className="mt-6">
              <Button
                onClick={() => setStep(2)}
                disabled={!imageUrl || uploading}
                className="w-full bg-brand hover:bg-brand-hover text-white h-11 font-medium gap-2"
              >
                Continue <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Choose Style */}
        {step === 2 && (
          <>
            <StepDots step={2} />
            <div className="mb-4">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={14} aria-hidden="true" /> Back
              </button>
            </div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-brand-navy">Choose a style</h2>
              <p className="text-sm text-gray-500 mt-1">Pick the background for your product shot</p>
            </div>
            <PresetPicker value={preset} onChange={setPreset} />
            <div className="mt-6">
              <Button
                onClick={handleGenerate}
                disabled={!preset}
                className="w-full bg-brand hover:bg-brand-hover text-white h-11 font-medium"
              >
                Generate Photo
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Result */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-4">
            <ResultArea
              {...(generateState === "generating"
                ? { state: "generating" }
                : generateState === "done" && outputUrl
                ? { state: "done", outputUrl, inputUrl: imageUrl! }
                : generateState === "gated"
                ? { state: "gated", inputUrl: imageUrl! }
                : { state: "error", message: errorMsg ?? "Something went wrong" })}
            />
            {generateState === "done" && (
              <button
                onClick={handleReset}
                className="text-sm text-brand hover:underline"
              >
                Generate another →
              </button>
            )}
            {generateState === "error" && (
              <Button
                onClick={() => { setStep(2); setGenerateState("idle") }}
                variant="outline"
                className="w-full max-w-xs"
              >
                Try again
              </Button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
```

**Step 2: Also update UploadZone aspect ratio**

In `src/components/generate/UploadZone.tsx`, change the drop zone and preview wrapper from `aspect-square` to `aspect-video` for a wider, less boxy feel:

- Line with `"relative w-full aspect-square max-w-xs rounded-xl..."` → change `aspect-square max-w-xs` to `aspect-video`
- Line with `"w-full max-w-xs aspect-square rounded-xl border-2..."` → change `max-w-xs aspect-square` to `aspect-video`

**Step 3: Verify full flow**

Run `npm run dev` and test:
1. Visit `/generate` — should see white card, step 1 with upload zone
2. Upload an image — preview shows, "Continue" button activates
3. Click Continue — step 2 appears with preset cards and step dots update
4. Click Back — returns to step 1 with image still set
5. Select a preset — "Generate Photo" button activates
6. Click Generate — step 3 shows spinner
7. Result appears (done or gated)
8. "Generate another" resets to step 1

**Step 4: Commit**

```bash
git add src/components/generate/GenerateClient.tsx src/components/generate/UploadZone.tsx
git commit -m "feat: redesign generate page as 3-step wizard"
```
