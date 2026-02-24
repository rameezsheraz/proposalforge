import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ProposalForge.io" className="h-8 w-8 rounded-lg" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              ProposalForge.io
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            {user ? (
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-2.5 rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-soft transition-all hover:shadow-glow"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            For QA, BA, PO, PM, Dev & DevOps freelancers
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Win more Upwork
            <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent"> proposals</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-xl mx-auto leading-relaxed">
            AI-optimized proposals that get you hired. Paste a job, add your skills, and get a proposal that stands out.
          </p>

          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-soft hover:shadow-glow transition-all"
            >
              Go to Dashboard
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-soft hover:shadow-glow transition-all"
              >
                Get Started Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Log in
              </Link>
            </div>
          )}

          <p className="text-sm text-slate-500 mt-8">
            No credit card required
          </p>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {["Match Score", "Keyword Analysis", "Tone Options", "Success Tracking"].map((f) => (
              <div key={f} className="px-4 py-3 rounded-xl bg-white/60 backdrop-blur border border-slate-200/60 shadow-card">
                <p className="text-sm font-medium text-slate-700">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
