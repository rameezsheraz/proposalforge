import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProposalForm } from "@/components/ProposalForm";
import { ProposalHistory } from "@/components/ProposalHistory";
import { OnboardingBanner } from "@/components/OnboardingBanner";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: proposals = [] } = await supabase
    .from("proposals")
    .select("id, category, job_description, generated_proposal, generated_hook, generated_pain_points, generated_cta, created_at, status, match_score")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

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
            <a href="/dashboard/analytics" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
              Analytics
            </a>
            <a href="/dashboard/settings" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
              Settings
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

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <OnboardingBanner hasProfile={!!(profile?.skills_summary?.trim())} />

        <div className="rounded-2xl bg-white p-8 shadow-card border border-slate-200/60">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Generate Your Proposal
          </h1>
          <p className="text-slate-600 mb-6">
            Paste the job description, add your skills, then <strong className="text-primary-700">Check Match</strong> to see how well you fit before generating your proposal.
          </p>

          <ProposalForm
            defaultSkills={profile?.skills_summary ?? ""}
            defaultPortfolio={profile?.portfolio_links ?? ""}
          />
        </div>

        <div className="rounded-2xl overflow-hidden shadow-card border border-slate-200/60">
          <ProposalHistory proposals={proposals ?? []} />
        </div>
      </div>
    </main>
  );
}
