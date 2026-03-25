import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ShelfReady — AI Product Photography for Online Sellers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#1A2E35",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Left — text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            maxWidth: "560px",
          }}
        >
          {/* Logo wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Camera-box icon */}
            <svg width="52" height="52" viewBox="0 0 36 36" fill="none">
              <rect x="3" y="9" width="30" height="22" rx="3" stroke="#1D9E75" strokeWidth="2.2" fill="none" />
              <path d="M3 15 L18 12 L33 15" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="18" y1="9" x2="18" y2="12" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="18" cy="23" r="5.5" stroke="#1D9E75" strokeWidth="2" fill="none" />
              <circle cx="18" cy="23" r="2" fill="#1D9E75" />
              <rect x="26" y="17" width="3" height="2" rx="1" fill="#1D9E75" />
            </svg>
            <span style={{ fontSize: "36px", fontWeight: "800", letterSpacing: "-1px" }}>
              <span style={{ color: "#ffffff" }}>Shelf</span>
              <span style={{ color: "#1D9E75" }}>Ready</span>
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: "800",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              color: "#ffffff",
            }}
          >
            Skip the studio.{" "}
            <span style={{ color: "#1D9E75" }}>Just great product photos.</span>
          </div>

          {/* Subtext */}
          <div
            style={{
              fontSize: "22px",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.4,
            }}
          >
            AI model generation · Lifestyle backgrounds · Seconds, not days
          </div>

          {/* CTA badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#1D9E75",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              padding: "10px 20px",
              borderRadius: "100px",
              width: "fit-content",
              letterSpacing: "0.5px",
            }}
          >
            ✦ Join the Waitlist — Launching Soon
          </div>
        </div>

        {/* Right — decorative element */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          {/* Large icon */}
          <svg width="220" height="220" viewBox="0 0 36 36" fill="none">
            <rect x="3" y="9" width="30" height="22" rx="3" stroke="#1D9E75" strokeWidth="1.5" fill="rgba(29,158,117,0.08)" />
            <path d="M3 15 L18 12 L33 15" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="18" y1="9" x2="18" y2="12" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="18" cy="23" r="5.5" stroke="#1D9E75" strokeWidth="1.5" fill="none" />
            <circle cx="18" cy="23" r="2" fill="#1D9E75" />
            <rect x="26" y="17" width="3" height="2" rx="1" fill="#1D9E75" />
          </svg>
          <div
            style={{
              fontSize: "13px",
              color: "rgba(29,158,117,0.6)",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: "600",
            }}
          >
            shelfready.store
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
