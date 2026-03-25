import Link from "next/link"
import Logo from "@/components/Logo"

export default function AppNav() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/generate">
          <Logo variant="dark" />
        </Link>
        <Link
          href="/api/auth/signout"
          prefetch={false}
          className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
        >
          Sign out
        </Link>
      </nav>
    </header>
  )
}
