"use server"

import { HfInference } from "@huggingface/inference"
import { createClient } from "@/lib/supabase/server"
import type { Preset } from "@/components/generate/PresetPicker"

const PRESET_PROMPTS: Record<Preset, string> = {
  "white-studio":  "Place this product on a clean white studio background with soft professional lighting. Keep the product exactly as-is, only change the background and lighting.",
  "gradient":      "Place this product on a soft pastel gradient background, pink to purple, editorial style. Keep the product exactly as-is, only change the background and lighting.",
  "lifestyle":     "Place this product in a natural lifestyle setting with warm ambient light. Keep the product exactly as-is, only change the background and lighting.",
  "minimal-dark":  "Place this product on a dark minimal background with dramatic moody lighting. Keep the product exactly as-is, only change the background and lighting.",
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

  // Call Hugging Face instruct-pix2pix (image-to-image editing)
  try {
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

    // Fetch the uploaded image as a blob
    const imageRes = await fetch(input.inputImageUrl)
    const imageBlob = await imageRes.blob()

    const resultBlob = await hf.imageToImage({
      model: "timbrooks/instruct-pix2pix",
      inputs: imageBlob,
      parameters: {
        prompt: PRESET_PROMPTS[input.preset],
        num_inference_steps: 20,
        image_guidance_scale: 1.5,
        guidance_scale: 7.5,
      },
    })

    // Upload generated image to Storage
    const outputPath = `${user.id}/output-${Date.now()}.jpg`
    const outputBuffer = Buffer.from(await resultBlob.arrayBuffer())
    const { error: uploadError } = await supabase.storage
      .from("Product-images")
      .upload(outputPath, outputBuffer, { contentType: "image/jpeg" })
    if (uploadError) throw uploadError

    const { data: signedOutput, error: signedErr } = await supabase.storage
      .from("Product-images")
      .createSignedUrl(outputPath, 86400) // 24 hours
    if (signedErr || !signedOutput) throw new Error("Could not sign output URL")

    // Save generation record
    await supabase.from("generations").insert({
      user_id: user.id,
      input_image_url: input.inputImageUrl,
      output_image_urls: [signedOutput.signedUrl],
      prompt_config: { preset: input.preset },
    })

    return { gated: false, outputUrl: signedOutput.signedUrl }
  } catch (err) {
    // Roll back demo slot so the user can try again
    await supabase
      .from("profiles")
      .update({ demo_used: false })
      .eq("id", user.id)

    const msg = err instanceof Error ? err.message : String(err)
    console.error("[generate] HF error:", msg)
    return { error: `Generation failed: ${msg}` }
  }
}
