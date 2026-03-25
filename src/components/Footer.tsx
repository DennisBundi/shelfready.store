import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="bg-white border-t border-gray-100 py-10 px-4"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
        {/* Wordmark */}
        <p className="text-sm font-semibold">
          <span style={{ color: "#1A2E35" }}>Shelf</span>
          <span style={{ color: "#1D9E75" }}>Ready</span>
        </p>

        {/* Tagline */}
        <p className="text-xs text-gray-400 text-center">
          AI product photography for online sellers &mdash; launching soon
        </p>

        {/* Links */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-brand transition-colors">
            Privacy Policy
          </Link>
          <span className="w-1 h-1 rounded-full bg-gray-200 inline-block" />
          <Link href="/terms" className="hover:text-brand transition-colors">
            Terms of Service
          </Link>
        </div>

        <p className="text-[11px] text-gray-300">
          &copy; {new Date().getFullYear()} ShelfReady. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
