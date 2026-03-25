# Design: Auth Pages + Generate Page

**Date:** 2026-03-25
**Status:** Approved

## Scope

Three new route areas:
- `/login` and `/signup` — email/password auth in the `(auth)` route group
- `/generate` — core app page in the `(app)` route group

---

## Auth Pages

### Routes
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`

### Behaviour
- **Signup:** email + password + confirm password → `supabase.auth.signUp()` → redirect to `/generate`
- **Login:** email + password → `supabase.auth.signInWithPassword()` → redirect to `/generate`
- Each page links to the other
- Inline error messages (no toasts)
- Single shared `AuthForm` component handles both modes

### Components
- `src/components/auth/AuthForm.tsx` — accepts a `mode: "login" | "signup"` prop

---

## Generate Page

### Route
- `src/app/(app)/generate/page.tsx`

### Flow
1. **Upload zone** — drag & drop or click, shows preview. Uploads to Supabase Storage → returns `input_image_url`
2. **Preset picker** — 4 visual cards: "White Studio", "Gradient", "Lifestyle Scene", "Minimal Dark". Selection stored in `prompt_config`
3. **Generate button** — disabled until image + preset are both selected
4. **Result area** — rendered below the form after generation

### UI States
`idle` → `uploading` → `ready` → `generating` → `done | gated`

### Server Action
`src/app/actions/generate.ts`
- Receives `{ inputImageUrl, promptConfig, userId }`
- Checks `profiles.demo_used` for the current user
- If `demo_used = true`: inserts a generation record with `output_image_urls = []`, returns `{ gated: true }`
- If `demo_used = false`: calls Gemini API, stores result URLs, flips `demo_used = true`, returns `{ gated: false, urls: [...] }`

---

## Paywall Tease

### Trigger
User has already completed one generation (`demo_used = true`) and attempts another.

### Behaviour
- User goes through the full flow (upload, preset, generate) normally
- Server action short-circuits before calling Gemini — returns `{ gated: true }`
- Client blurs the user's own uploaded image (CSS blur + dark overlay) — not a stock placeholder
- Overlay displays:
  - Headline: "Unlock your full result"
  - Subtext: "Upgrade to Pro for unlimited generations"
  - Upgrade CTA button
- Intent is captured: a `generations` row is inserted with `output_image_urls = []`

### Why this works
The user invests emotionally in their specific product image before hitting the gate — maximising upgrade intent at peak excitement.

---

## Data Layer

| Action | DB change |
|---|---|
| Signup | `profiles` row auto-created via trigger |
| Successful generation | `generations` row inserted, `profiles.demo_used` set to `true` |
| Gated generation attempt | `generations` row inserted with empty `output_image_urls` |

---

## Out of Scope
- Upgrade/payment flow (separate feature)
- Generation history page
- Onboarding flow
