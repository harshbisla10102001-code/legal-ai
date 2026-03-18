import { redirect } from "next/navigation";
import { Sidebar } from "./_components/Sidebar";
import { DashboardHeader } from "./_components/DashboardHeader";
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
          <DashboardHeader name={name} />

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
