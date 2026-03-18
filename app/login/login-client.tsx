"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentMagicLink, setSentMagicLink] = useState(false);

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    setError(null);
    setLoading(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
            nextPath,
          )}`,
        },
      });
      if (otpError) throw otpError;
      setSentMagicLink(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send magic link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h1 className="text-xl font-semibold tracking-tight">
            Sign in to LegalAI
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Use email + password or a magic link.
          </p>

          <form className="mt-6 space-y-4" onSubmit={signInWithPassword}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
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
                className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <button
              type="button"
              disabled={loading || !email}
              onClick={sendMagicLink}
              className="inline-flex w-full items-center justify-center rounded-lg border border-black/10 bg-transparent px-4 py-2 text-sm font-medium disabled:opacity-60 dark:border-white/10"
            >
              {sentMagicLink ? "Magic link sent" : "Send magic link"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link
              href={`/signup${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
              className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              Create account
            </Link>
            <Link
              href="/"
              className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              Home
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Tip: After the first login, create a `profiles` row for RBAC (role
          lawyer/admin).
        </p>
      </div>
    </div>
  );
}

