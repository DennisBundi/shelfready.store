# Auth + Generate Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build email/password auth pages (login/signup) and the core generate page with a one-shot paywall tease.

**Architecture:** Shared `AuthForm` component handles both auth modes. The generate page is a client component managing local UI state (`idle → uploading → ready → generating → done | gated`). A server action gates the Gemini call behind a `demo_used` check.

**Tech Stack:** Next.js 14 App Router, Supabase SSR, @google/generative-ai (Gemini 2.0 Flash), Supabase Storage, Tailwind CSS, lucide-react

---

### Task 1: Add GEMINI_API_KEY to env files

**Files:**
- Modify: `.env.example`
- Modify: `.env.local` (add the real key)

**Step 1: Update .env.example**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
GEMINI_API_KEY=
```

**Step 2: Add real key to .env.local**

Add your Gemini API key (from https://aistudio.google.com/apikey):
```
GEMINI_API_KEY=your_key_here
```

**Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: add GEMINI_API_KEY to env example"
```

---

### Task 2: Create Supabase Storage bucket

Do this manually in the Supabase dashboard:

1. Go to Storage → New bucket
2. Name: `product-images`
3. Public: **off** (private bucket)
4. Run this RLS policy SQL in the SQL editor:

```sql
-- Allow authenticated users to upload to their own folder
create policy "users upload own images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to read their own images
create policy "users read own images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

No commit needed (infra change, not code).

---

### Task 3: AuthForm component

**Files:**
- Create: `src/components/auth/AuthForm.tsx`

**Step 1: Create the component**

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

type Props = { mode: "login" | "signup" }

export default function AuthForm({ mode }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push("/generate")
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold text-brand-navy mb-6">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {mode === "signup" && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Confirm password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full mt-1 bg-brand hover:bg-brand-hover text-white h-10">
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-4">
        {mode === "login" ? (
          <>Don&apos;t have an account?{" "}<Link href="/signup" className="text-brand hover:underline">Sign up</Link></>
        ) : (
          <>Already have an account?{" "}<Link href="/login" className="text-brand hover:underline">Sign in</Link></>
        )}
      </p>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/auth/AuthForm.tsx
git commit -m "feat: add AuthForm component (login/signup modes)"
```

---

### Task 4: Login and Signup pages

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/signup/page.tsx`

**Step 1: Login page**

```tsx
import AuthForm from "@/components/auth/AuthForm"

export const metadata = { title: "Sign in – ShelfReady" }

export default function LoginPage() {
  return <AuthForm mode="login" />
}
```

**Step 2: Signup page**

```tsx
import AuthForm from "@/components/auth/AuthForm"

export const metadata = { title: "Create account – ShelfReady" }

export default function SignupPage() {
  return <AuthForm mode="signup" />
}
```

**Step 3: Verify**

Run `npm run dev` and visit:
- `http://localhost:3000/login` — should show login form
- `http://localhost:3000/signup` — should show signup form with confirm password field
- After signing in, should redirect to `/generate` (which will 404 for now — that's fine)
- Visiting `/login` while signed in should redirect to `/generate`

**Step 4: Commit**

```bash
git add src/app/(auth)/login/page.tsx src/app/(auth)/signup/page.tsx
git commit -m "feat: add login and signup pages"
```

---

### Task 5: UploadZone component

**Files:**
- Create: `src/components/generate/UploadZone.tsx`

The upload zone handles file selection and drag-and-drop. It uploads to Supabase Storage under `{userId}/{timestamp}-{filename}` and calls back with the public URL.

**Step 1: Create the component**

```tsx
"use client"

import { useRef, useState } from "react"
import { Upload, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type Props = {
  userId: string
  onUpload: (url: string) => void
  onClear: () => void
  uploading: boolean
  onUploading: (v: boolean) => void
}

export default function UploadZone({ userId, onUpload, onClear, uploading, onUploading }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return
    setPreview(URL.createObjectURL(file))
    onUploading(true)

    const path = `${userId}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from("product-images").upload(path, file)

    onUploading(false)
    if (error) { setPreview(null); return }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path)
    onUpload(data.publicUrl)
  }

  function handleClear() {
    setPreview(null)
    onClear()
    if (inputRef.current) inputRef.current.value = ""
  }

  if (preview) {
    return (
      <div className="relative w-full aspect-square max-w-xs rounded-xl overflow-hidden border border-gray-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Product preview" className="w-full h-full object-contain bg-gray-50" />
        <button
          onClick={handleClear}
          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-50"
        >
          <X size={14} />
        </button>
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm text-gray-500">
            Uploading…
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      className={cn(
        "w-full max-w-xs aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
        dragOver ? "border-brand bg-brand-light" : "border-gray-300 hover:border-brand hover:bg-brand-light/50"
      )}
    >
      <Upload size={24} className="text-gray-400" />
      <p className="text-sm text-gray-500 text-center px-4">
        Drag & drop your product photo<br />or click to browse
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/generate/UploadZone.tsx
git commit -m "feat: add UploadZone component with Supabase Storage upload"
```

---

### Task 6: PresetPicker component

**Files:**
- Create: `src/components/generate/PresetPicker.tsx`

**Step 1: Create the component**

```tsx
import { cn } from "@/lib/utils"

export type Preset = "white-studio" | "gradient" | "lifestyle" | "minimal-dark"

const PRESETS: { id: Preset; label: string; description: string; bg: string }[] = [
  { id: "white-studio",  label: "White Studio",    description: "Clean white background", bg: "bg-white border-gray-200" },
  { id: "gradient",      label: "Gradient",         description: "Soft pastel gradient",   bg: "bg-gradient-to-br from-purple-100 to-pink-100" },
  { id: "lifestyle",     label: "Lifestyle Scene",  description: "Natural environment",    bg: "bg-gradient-to-br from-green-100 to-emerald-200" },
  { id: "minimal-dark",  label: "Minimal Dark",     description: "Dark moody backdrop",    bg: "bg-gray-800" },
]

type Props = {
  value: Preset | null
  onChange: (preset: Preset) => void
}

export default function PresetPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
      {PRESETS.map(preset => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onChange(preset.id)}
          className={cn(
            "rounded-xl border-2 p-3 text-left transition-all",
            value === preset.id
              ? "border-brand ring-2 ring-brand/20"
              : "border-gray-200 hover:border-gray-300"
          )}
        >
          <div className={cn("w-full aspect-video rounded-lg mb-2 border", preset.bg)} />
          <p className="text-xs font-medium text-gray-800">{preset.label}</p>
          <p className="text-xs text-gray-500">{preset.description}</p>
        </button>
      ))}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/generate/PresetPicker.tsx
git commit -m "feat: add PresetPicker component with 4 presets"
```

---

### Task 7: Generate server action

**Files:**
- Create: `src/app/actions/generate.ts`

This action:
1. Checks `demo_used` on the user's profile
2. If gated: inserts an empty generation record, returns `{ gated: true }`
3. If not gated: calls Gemini to generate a styled product image, stores the result in Storage, inserts a full generation record, flips `demo_used`, returns `{ gated: false, urls: [...] }`

**Step 1: Create the action**

```ts
"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/lib/supabase/server"
import type { Preset } from "@/components/generate/PresetPicker"

const PRESET_PROMPTS: Record<Preset, string> = {
  "white-studio":  "Place this product on a clean white studio background with soft professional lighting.",
  "gradient":      "Place this product on a soft pastel gradient background, pink to purple, editorial style.",
  "lifestyle":     "Place this product in a natural lifestyle setting with warm ambient light.",
  "minimal-dark":  "Place this product on a dark minimal background with dramatic moody lighting.",
}

type GenerateInput = {
  inputImageUrl: string
  preset: Preset
}

type GenerateResult =
  | { gated: true }
  | { gated: false; outputUrl: string }
  | { error: string }

export async function generateImage(input: GenerateInput): Promise<GenerateResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Check demo gate
  const { data: profile } = await supabase
    .from("profiles")
    .select("demo_used")
    .eq("id", user.id)
    .single()

  if (profile?.demo_used) {
    // Capture intent — empty generation record
    await supabase.from("generations").insert({
      user_id: user.id,
      input_image_url: input.inputImageUrl,
      output_image_urls: [],
      prompt_config: { preset: input.preset, gated: true },
    })
    return { gated: true }
  }

  // Call Gemini
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    // Fetch the uploaded image as base64
    const imageRes = await fetch(input.inputImageUrl)
    const imageBuffer = await imageRes.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString("base64")
    const mimeType = imageRes.headers.get("content-type") ?? "image/jpeg"

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: PRESET_PROMPTS[input.preset] + " Keep the product exactly as-is, only change the background and lighting." },
        ],
      }],
      generationConfig: {
        // @ts-expect-error - responseModalities is available in gemini-2.0-flash-exp
        responseModalities: ["image", "text"],
      },
    })

    // Extract generated image from response
    const parts = result.response.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData)
    if (!imagePart?.inlineData) return { error: "No image returned from Gemini" }

    // Upload generated image to Storage
    const outputPath = `${user.id}/output-${Date.now()}.jpg`
    const outputBuffer = Buffer.from(imagePart.inlineData.data, "base64")
    await supabase.storage.from("product-images").upload(outputPath, outputBuffer, {
      contentType: imagePart.inlineData.mimeType,
    })
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(outputPath)

    // Save generation record + flip demo_used
    await supabase.from("generations").insert({
      user_id: user.id,
      input_image_url: input.inputImageUrl,
      output_image_urls: [urlData.publicUrl],
      prompt_config: { preset: input.preset },
    })

    await supabase.from("profiles").update({ demo_used: true }).eq("id", user.id)

    return { gated: false, outputUrl: urlData.publicUrl }
  } catch (err) {
    console.error("[generate] Gemini error:", err)
    return { error: "Generation failed, please try again" }
  }
}
```

**Step 2: Commit**

```bash
git add src/app/actions/generate.ts
git commit -m "feat: add generate server action with Gemini + paywall gate"
```

---

### Task 8: ResultArea component

**Files:**
- Create: `src/components/generate/ResultArea.tsx`

**Step 1: Create the component**

```tsx
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props =
  | { state: "generating" }
  | { state: "done"; outputUrl: string; inputUrl: string }
  | { state: "gated"; inputUrl: string }
  | { state: "error"; message: string }

export default function ResultArea(props: Props) {
  if (props.state === "generating") {
    return (
      <div className="w-full max-w-xs aspect-square rounded-xl bg-gray-100 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Generating your photo…</p>
      </div>
    )
  }

  if (props.state === "error") {
    return (
      <div className="w-full max-w-xs rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        {props.message}
      </div>
    )
  }

  if (props.state === "done") {
    return (
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.outputUrl} alt="Generated product" className="w-full h-full object-contain bg-gray-50" />
        </div>
        <a href={props.outputUrl} download target="_blank" rel="noreferrer" className="w-full">
          <Button className="w-full bg-brand hover:bg-brand-hover text-white gap-2">
            <Download size={14} />
            Download photo
          </Button>
        </a>
      </div>
    )
  }

  // gated state
  return (
    <div className="relative w-full max-w-xs aspect-square rounded-xl overflow-hidden border border-gray-200">
      {/* Blurred version of their own uploaded image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.inputUrl}
        alt="Preview"
        className="w-full h-full object-contain bg-gray-50 blur-md scale-110"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-brand-navy/60 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-white font-semibold text-lg leading-tight">Unlock your full result</p>
        <p className="text-white/80 text-sm">Upgrade to Pro for unlimited generations</p>
        <Button className="bg-white text-brand-navy hover:bg-gray-100 font-semibold mt-1">
          Upgrade to Pro
        </Button>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/generate/ResultArea.tsx
git commit -m "feat: add ResultArea component (done/gated/generating/error states)"
```

---

### Task 9: Generate page — wire everything together

**Files:**
- Create: `src/app/(app)/generate/page.tsx`

This is the main page. It's a server component that fetches the user, then renders a client component with all state logic.

**Step 1: Create client component `src/components/generate/GenerateClient.tsx`**

```tsx
"use client"

import { useState } from "react"
import UploadZone from "./UploadZone"
import PresetPicker, { type Preset } from "./PresetPicker"
import ResultArea from "./ResultArea"
import { Button } from "@/components/ui/button"
import { generateImage } from "@/app/actions/generate"

type UIState = "idle" | "uploading" | "ready" | "generating" | "done" | "gated" | "error"

type Props = { userId: string }

export default function GenerateClient({ userId }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [preset, setPreset] = useState<Preset | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uiState, setUiState] = useState<UIState>("idle")
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const canGenerate = !!imageUrl && !!preset && !uploading && uiState !== "generating"

  async function handleGenerate() {
    if (!imageUrl || !preset) return
    setUiState("generating")
    setErrorMsg(null)

    const result = await generateImage({ inputImageUrl: imageUrl, preset })

    if ("error" in result) {
      setErrorMsg(result.error)
      setUiState("error")
    } else if (result.gated) {
      setUiState("gated")
    } else {
      setOutputUrl(result.outputUrl)
      setUiState("done")
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-brand-navy">Generate your product photo</h1>
        <p className="text-gray-500 text-sm mt-1">Upload your product, pick a style, done.</p>
      </div>

      <UploadZone
        userId={userId}
        onUpload={url => { setImageUrl(url); setUiState("ready") }}
        onClear={() => { setImageUrl(null); setUiState("idle") }}
        uploading={uploading}
        onUploading={setUploading}
      />

      {imageUrl && (
        <PresetPicker value={preset} onChange={setPreset} />
      )}

      {imageUrl && (
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full max-w-xs bg-brand hover:bg-brand-hover text-white h-10 font-medium"
        >
          Generate photo
        </Button>
      )}

      {(uiState === "generating" || uiState === "done" || uiState === "gated" || uiState === "error") && (
        <ResultArea
          {...(uiState === "generating" ? { state: "generating" } :
               uiState === "done" && outputUrl ? { state: "done", outputUrl, inputUrl: imageUrl! } :
               uiState === "gated" ? { state: "gated", inputUrl: imageUrl! } :
               { state: "error", message: errorMsg ?? "Something went wrong" })}
        />
      )}
    </div>
  )
}
```

**Step 2: Create the page**

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import GenerateClient from "@/components/generate/GenerateClient"

export const metadata = { title: "Generate – ShelfReady" }

export default async function GeneratePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <GenerateClient userId={user.id} />
}
```

**Step 3: Verify**

Run `npm run dev` and test the full flow:
1. Visit `http://localhost:3000/login` → sign in
2. Should land on `/generate`
3. Upload a product image → preview appears
4. Select a preset
5. Hit "Generate" → spinner while generating → image result appears
6. Hit "Generate" again → gated state (blurred image + upgrade CTA)
7. Sign out → redirected to `/login`
8. Visit `/generate` without being signed in → redirected to `/login`

**Step 4: Commit**

```bash
git add src/app/(app)/generate/page.tsx src/components/generate/GenerateClient.tsx
git commit -m "feat: wire generate page with upload, preset picker, and result area"
```
