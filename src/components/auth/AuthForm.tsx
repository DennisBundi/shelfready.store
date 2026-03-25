"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

type Props = { mode: "login" | "signup" }

export default function AuthForm({ mode }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push("/generate")
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold text-brand-navy mb-6">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {mode === "signup" && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Confirm password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full mt-1 bg-brand hover:bg-brand-hover text-white h-10">
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-4">
        {mode === "login" ? (
          <>Don&apos;t have an account?{" "}<Link href="/signup" className="text-brand hover:underline">Sign up</Link></>
        ) : (
          <>Already have an account?{" "}<Link href="/login" className="text-brand hover:underline">Sign in</Link></>
        )}
      </p>
    </div>
  )
}
