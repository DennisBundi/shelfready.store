"use server"

import { GoogleGenAI, Modality } from "@google/genai"
import { createClient } from "@/lib/supabase/server"
import type { Preset } from "@/components/generate/PresetPicker"

const GEMINI_MODEL = "gemini-2.0-flash-preview-image-generation"

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

  // Atomically claim the demo slot. Returns the row only if demo_used was false.
  const { data: claimed, error: claimError } = await supabase
    .from("profiles")
    .update({ demo_used: true })
    .eq("id", user.id)
    .eq("demo_used", false)
    .select("id")

  if (claimError) return { error: "Could not load profile" }

  if (!claimed || claimed.length === 0) {
    // Could be gated (demo_used=true) or no profile row (new user edge case)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return { error: "Profile not found. Please sign out and sign back in." }
    }

    // Profile exists — demo_used is true, user is gated
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
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

    // Fetch the uploaded image as base64
    const imageRes = await fetch(input.inputImageUrl)
    const imageBuffer = await imageRes.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString("base64")
    const mimeType = imageRes.headers.get("content-type") ?? "image/jpeg"

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: PRESET_PROMPTS[input.preset] + " Keep the product exactly as-is, only change the background and lighting." },
        ],
      }],
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    })

    // Extract generated image from response
    const parts = result.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find(p => p.inlineData)
    if (!imagePart?.inlineData) return { error: "No image returned from Gemini" }

    // Upload generated image to Storage
    const outputPath = `${user.id}/output-${Date.now()}.jpg`
    const outputBuffer = Buffer.from(imagePart.inlineData.data ?? "", "base64")
    const { error: uploadError } = await supabase.storage
      .from("Product-images")
      .upload(outputPath, outputBuffer, { contentType: imagePart.inlineData.mimeType ?? "image/jpeg" })
    if (uploadError) throw uploadError
    const { data: signedOutput, error: signedErr } = await supabase.storage
      .from("Product-images")
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
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[generate] Gemini error:", msg)
    return { error: `Generation failed: ${msg}` }
  }
}
