"use client"

import { useEffect, useRef, useState, useMemo } from "react"
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
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  async function handleFile(file: File) {
    setUploadError(null)
    if (!file.type.startsWith("image/")) return
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image must be under 10 MB")
      return
    }
    setPreview(URL.createObjectURL(file))
    onUploading(true)

    const path = `${userId}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from("product-images").upload(path, file)

    onUploading(false)
    if (error) { setPreview(null); return }

    const { data: signedData, error: signedError } = await supabase.storage
      .from("product-images")
      .createSignedUrl(path, 3600)

    if (signedError || !signedData) { setPreview(null); return }
    onUpload(signedData.signedUrl)
  }

  function handleClear() {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setUploadError(null)
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
          aria-label="Remove image"
          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-50"
        >
          <X size={14} aria-hidden="true" />
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
      role="button"
      tabIndex={0}
      aria-label="Upload product image"
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click() } }}
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
      {uploadError && (
        <p role="alert" className="text-xs text-red-500 px-4 text-center">{uploadError}</p>
      )}
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
