"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
            nextPath,
          )}`,
          data: {
            full_name: fullName,
          },
        },
      });
      if (signUpError) throw signUpError;

      setSuccess(
        "Account created. Check your email to confirm, then return to sign in.",
      );
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h1 className="text-xl font-semibold tracking-tight">
            Create your LegalAI account
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            You’ll be asked to confirm your email.
          </p>

          <form className="mt-6 space-y-4" onSubmit={signUp}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Full name</label>
              <input
                className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
                placeholder="Ava Chen"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
                placeholder="you@firm.com"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
                placeholder="At least 8 characters"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link
              href={`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
              className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              Already have an account?
            </Link>
            <Link
              href="/"
              className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

