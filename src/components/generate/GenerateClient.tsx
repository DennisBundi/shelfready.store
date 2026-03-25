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
