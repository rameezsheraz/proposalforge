import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("skills_summary, portfolio_links")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ProposalForge.io" className="h-8 w-8 rounded-lg" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              ProposalForge.io
            </span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
              Dashboard
            </a>
            <span className="text-sm text-slate-500 hidden sm:inline">{user.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-card border border-slate-200/60">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600 mb-8">
            Save your skills and portfolio here. They&apos;ll be pre-filled when you generate proposals.
          </p>

            <ProfileForm
            initialSkills={profile?.skills_summary ?? ""}
            initialPortfolio={profile?.portfolio_links ?? ""}
          />
        </div>
      </div>
    </main>
  );
}
