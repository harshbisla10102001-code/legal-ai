import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-10">
        <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h1 className="text-2xl font-semibold tracking-tight">LegalAI</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Secure lawyer workspace with Supabase auth and role-based access.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg border border-black/10 px-4 py-2 text-sm font-medium dark:border-white/10"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
