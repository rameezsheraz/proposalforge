import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: proposals = [] } = await supabase
    .from("proposals")
    .select("id, category, status, created_at")
    .eq("user_id", user.id);

  const total = proposals.length;
  const won = proposals.filter((p) => p.status === "won").length;
  const lost = proposals.filter((p) => p.status === "lost").length;
  const tracked = won + lost;
  const winRate = tracked > 0 ? Math.round((won / tracked) * 100) : null;

  const byCategory = proposals.reduce<Record<string, { total: number; won: number; lost: number }>>(
    (acc, p) => {
      const cat = p.category || "other";
      if (!acc[cat]) acc[cat] = { total: 0, won: 0, lost: 0 };
      acc[cat].total++;
      if (p.status === "won") acc[cat].won++;
      if (p.status === "lost") acc[cat].lost++;
      return acc;
    },
    {}
  );

  const thisMonth = proposals.filter((p) => {
    const d = new Date(p.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const CATEGORY_LABELS: Record<string, string> = {
    qa: "QA",
    business_analysis: "BA",
    product_owner: "PO",
    product_manager: "Prod Mgr",
    project_manager: "Proj Mgr",
    dev: "Dev",
    devops: "DevOps",
  };

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
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/settings" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
              Settings
            </Link>
            <span className="text-sm text-slate-500 hidden sm:inline">{user.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Analytics</h1>
        <p className="text-slate-600 mb-8">
          Track your proposal performance and win rate.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-card hover:shadow-soft transition-shadow">
            <p className="text-sm text-slate-500 mb-1">Total Proposals</p>
            <p className="text-2xl font-bold text-slate-900">{total}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-card hover:shadow-soft transition-shadow">
            <p className="text-sm text-slate-500 mb-1">This Month</p>
            <p className="text-2xl font-bold text-slate-900">{thisMonth}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-card hover:shadow-soft transition-shadow">
            <p className="text-sm text-slate-500 mb-1">Won</p>
            <p className="text-2xl font-bold text-green-600">{won}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-card hover:shadow-soft transition-shadow">
            <p className="text-sm text-slate-500 mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-slate-900">
              {winRate != null ? `${winRate}%` : "—"}
            </p>
            {tracked > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                {tracked} tracked (won + lost)
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">By Category</h2>
          {Object.keys(byCategory).length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm mb-1">No data yet</p>
              <p className="text-slate-400 text-xs">Generate proposals and mark them Won or Lost to see your stats here.</p>
              <Link href="/dashboard" className="inline-block mt-4 text-sm font-medium text-primary-600 hover:text-primary-700">
                Go to Dashboard →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(byCategory).map(([cat, stats]) => (
                <div key={cat} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="font-medium text-slate-700">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </span>
                  <div className="flex gap-6 text-sm">
                    <span className="text-slate-500">{stats.total} total</span>
                    <span className="text-green-600">{stats.won} won</span>
                    <span className="text-red-600">{stats.lost} lost</span>
                    {stats.won + stats.lost > 0 && (
                      <span className="text-slate-700 font-medium">
                        {Math.round((stats.won / (stats.won + stats.lost)) * 100)}% win
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm text-slate-500 mt-6">
          Mark proposals as Won or Lost in your{" "}
          <Link href="/dashboard" className="text-primary-600 hover:underline">
            proposal history
          </Link>{" "}
          to track your win rate.
        </p>
      </div>
    </main>
  );
}
