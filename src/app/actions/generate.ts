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
