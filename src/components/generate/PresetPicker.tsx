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
            "rounded-xl border-2 p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
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
