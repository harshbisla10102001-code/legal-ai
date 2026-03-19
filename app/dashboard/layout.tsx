import { redirect } from "next/navigation";
import { DashboardShell } from "./_components/DashboardShell";
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
    <DashboardShell name={name}>
      <ChatProvider>{children}</ChatProvider>
    </DashboardShell>
  );
}
