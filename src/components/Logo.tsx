export default function Logo({ className, variant = "light" }: { className?: string; variant?: "light" | "dark" }) {
  const textColor = variant === "dark" ? "#1A2E35" : "#ffffff"
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="3" y="9" width="30" height="22" rx="3" stroke="#1D9E75" strokeWidth="2.2" fill="none" />
        <path d="M3 15 L18 12 L33 15" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="18" y1="9" x2="18" y2="12" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="18" cy="23" r="5.5" stroke="#1D9E75" strokeWidth="2" fill="none" />
        <circle cx="18" cy="23" r="2" fill="#1D9E75" />
        <rect x="26" y="17" width="3" height="2" rx="1" fill="#1D9E75" />
      </svg>
      <span className="text-xl font-bold tracking-tight leading-none">
        <span style={{ color: textColor }}>Shelf</span>
        <span style={{ color: "#1D9E75" }}>Ready</span>
      </span>
    </div>
  )
}
