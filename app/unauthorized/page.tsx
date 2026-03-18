import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-10">
        <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h1 className="text-xl font-semibold tracking-tight">
            Access restricted
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            You’re signed in, but your account does not have a `profiles` row or
            doesn’t have the required role (lawyer/admin).
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              Back to login
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium dark:border-white/10"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

