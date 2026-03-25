"use client";

import { useState } from "react";
import { joinWaitlist, WaitlistResult } from "@/app/actions/waitlist";

type FormStatus = "idle" | "loading" | "success" | "duplicate" | "error";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      const result: WaitlistResult = await joinWaitlist(email, firstName);
      if (result.status === "error") setErrorMsg(result.message);
      setStatus(result.status);
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="flex flex-col items-center gap-2 py-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-light">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-brand-navy">You&apos;re on the list!</p>
        <p className="text-sm text-gray-500">We&apos;ll notify you at launch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 w-full max-w-md">
      <div className="flex flex-col gap-1">
        <label htmlFor="firstName" className="sr-only">First name (optional)</label>
        <input
          id="firstName"
          type="text"
          placeholder="First name (optional)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value.slice(0, 100))}
          className="rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="sr-only">Email address</label>
        <input
          id="email"
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          required
          aria-required="true"
          className="rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-semibold rounded-xl px-6 py-3 transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Joining…" : "Join Waitlist →"}
      </button>

      {status === "duplicate" && (
        <p role="status" className="text-sm text-amber-600 text-center">
          You&apos;re already on the list! We&apos;ll see you at launch.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="text-sm text-red-500 text-center">{errorMsg}</p>
      )}
    </form>
  );
}
