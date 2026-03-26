import Image from "next/image"

export default function Logo({ className }: { className?: string; variant?: "light" | "dark" }) {
  return (
    <div className={`flex items-center ${className ?? ""}`}>
      <Image src="/logo.png" alt="ShelfReady" width={48} height={48} className="h-10 w-auto object-contain" priority />
    </div>
  )
}
