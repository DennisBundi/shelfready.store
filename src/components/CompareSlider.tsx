"use client"

import { useRef, useState, useCallback } from "react"
import Image from "next/image"

type Props = {
  beforeSrc: string
  afterSrc: string
  beforeAlt: string
  afterAlt: string
}

export default function CompareSlider({ beforeSrc, afterSrc, beforeAlt, afterAlt }: Props) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current
    if (!container) return
    const { left, width } = container.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((clientX - left) / width) * 100))
    setPosition(pct)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.buttons !== 1) return
    updatePosition(e.clientX)
  }, [updatePosition])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    updatePosition(e.clientX)
  }, [updatePosition])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden cursor-col-resize select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {/* Before layer (base) */}
      <Image
        src={beforeSrc}
        alt={beforeAlt}
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />

      {/* After layer (clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={afterSrc}
          alt={afterAlt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Drag handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M5 4l-3 4 3 4M11 4l3 4-3 4" stroke="#1A2E35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded pointer-events-none">
        Before
      </span>
      <span className="absolute bottom-3 right-3 bg-brand text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded pointer-events-none">
        After
      </span>
    </div>
  )
}
