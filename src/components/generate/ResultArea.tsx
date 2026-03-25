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
      <div role="alert" className="w-full max-w-xs rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        {props.message}
      </div>
    )
  }

  if (props.state === "done") {
    return (
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.outputUrl} alt="Generated product photo" className="w-full h-full object-contain bg-gray-50" />
        </div>
        <a href={props.outputUrl} download target="_blank" rel="noreferrer" className="w-full">
          <Button className="w-full bg-brand hover:bg-brand-hover text-white gap-2">
            <Download size={14} aria-hidden="true" />
            Download photo
          </Button>
        </a>
      </div>
    )
  }

  // gated state
  return (
    <div className="relative w-full max-w-xs aspect-square rounded-xl overflow-hidden border border-gray-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.inputUrl}
        alt=""
        aria-hidden="true"
        className="w-full h-full object-contain bg-gray-50 blur-md scale-110"
      />
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
