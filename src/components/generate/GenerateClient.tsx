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
