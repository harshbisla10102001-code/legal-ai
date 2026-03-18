import { redirect } from "next/navigation";
import { Sidebar } from "./_components/Sidebar";
import { ThemeToggle } from "./_components/ThemeToggle";
import { ChatProvider } from "./_components/ChatProvider";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  // Middleware already blocks unauthorized users, but keep this resilient.
  if (!profile || (profile.role !== "lawyer" && profile.role !== "admin")) {
    redirect("/unauthorized");
  }

  const name =
    profile.full_name?.trim() ||
    user.user_metadata?.full_name?.trim() ||
    user.email ||
    "there";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[260px_1fr]">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-10 border-b border-black/10 bg-white/70 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
              <div className="flex min-w-0 flex-col">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Lawyer dashboard
                </div>
                <div className="truncate text-sm font-semibold">
                  Welcome, {name}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 p-4">
            <div className="md:hidden">
              <div className="mb-4">
                <Sidebar />
              </div>
            </div>
            <ChatProvider>{children}</ChatProvider>
          </main>
        </div>
      </div>
    </div>
  );
}

