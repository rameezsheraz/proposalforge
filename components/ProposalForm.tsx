"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ProposalPreview } from "./ProposalPreview";

const CATEGORIES = [
  { value: "qa", label: "QA / Testing" },
  { value: "business_analysis", label: "Business Analysis" },
  { value: "product_owner", label: "Product Owner" },
  { value: "product_manager", label: "Product Manager" },
  { value: "project_manager", label: "Project Manager" },
  { value: "dev", label: "Development" },
  { value: "devops", label: "DevOps" },
] as const;

const TONES = [
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "confident", label: "Confident" },
  { value: "concise", label: "Concise" },
] as const;

const UPWORK_LIMIT = 5000;

type Result = {
  hook: string;
  pain_points: string[];
  proposal: string;
  cta: string;
  match_score?: number | null;
  important_keywords?: string[];
  missing_keywords?: string[];
  variations?: Array<{ hook: string; pain_points: string[]; proposal: string; cta: string }>;
};

export function ProposalForm({
  defaultSkills = "",
  defaultPortfolio = "",
}: {
  defaultSkills?: string;
  defaultPortfolio?: string;
}) {
  const [jobDescription, setJobDescription] = useState("");
  const [skillsSummary, setSkillsSummary] = useState(defaultSkills);
  const [portfolioLinks, setPortfolioLinks] = useState(defaultPortfolio);

  useEffect(() => {
    setSkillsSummary(defaultSkills);
    setPortfolioLinks(defaultPortfolio);
  }, [defaultSkills, defaultPortfolio]);
  const [category, setCategory] = useState<string>("dev");
  const [tone, setTone] = useState<string>("formal");
  const [variations, setVariations] = useState(false);
  const [keepUnderLimit, setKeepUnderLimit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingMatch, setCheckingMatch] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    score: number;
    summary: string;
    fit: string;
  } | null>(null);
  const [improving, setImproving] = useState(false);
  const [improveFeedback, setImproveFeedback] = useState("");
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleCheckMatch() {
    if (!jobDescription.trim() || !skillsSummary.trim()) return;
    setCheckingMatch(true);
    setError(null);
    setMatchResult(null);
    try {
      const res = await fetch("/api/match-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          skillsSummary: skillsSummary.trim(),
          category,
          portfolioLinks: portfolioLinks.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Match check failed");
        return;
      }
      setMatchResult(data);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setCheckingMatch(false);
    }
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          skillsSummary: skillsSummary.trim(),
          category,
          portfolioLinks: portfolioLinks.trim() || undefined,
          tone,
          variations,
          maxChars: keepUnderLimit ? UPWORK_LIMIT : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setResult(data);
      setSelectedVariation(0);
      setMatchResult(null);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [jobDescription, skillsSummary, portfolioLinks, category, tone, variations, keepUnderLimit]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!loading && formRef.current) {
          formRef.current.requestSubmit();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading]);

  function getFullProposal(r: { hook: string; pain_points: string[]; proposal: string; cta: string }) {
    return [
      r.hook,
      "",
      "Key pain points I can help with:",
      ...r.pain_points.map((p) => `• ${p}`),
      "",
      r.proposal,
      "",
      r.cta,
    ].join("\n");
  }

  function copyFullProposal(r?: { hook: string; pain_points: string[]; proposal: string; cta: string }) {
    if (!result) return;
    const toCopy = r ?? result;
    navigator.clipboard.writeText(getFullProposal(toCopy));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getCharCount(r: { hook: string; pain_points: string[]; proposal: string; cta: string }) {
    return getFullProposal(r).length;
  }

  async function handleImprove() {
    if (!result) return;
    const toImprove =
      result.variations && result.variations.length > 1
        ? result.variations[selectedVariation]
        : result;
    setImproving(true);
    setError(null);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentProposal: getFullProposal(toImprove),
          jobDescription,
          skillsSummary,
          feedback: improveFeedback.trim() || undefined,
          category,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Improvement failed");
        return;
      }
      setResult(data);
      setImproveFeedback("");
      setSelectedVariation(0);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setImproving(false);
    }
  }

  return (
    <div className="space-y-8">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="job" className="block text-sm font-medium text-slate-700 mb-2">
            Job Description (paste from Upwork)
          </label>
          <textarea
            id="job"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-white transition-colors"
            placeholder="Paste the full job posting here..."
          />
        </div>

        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-slate-700 mb-2">
            Your Skills / Profile Summary
          </label>
          <textarea
            id="skills"
            value={skillsSummary}
            onChange={(e) => setSkillsSummary(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-white transition-colors"
            placeholder="Your relevant experience, tools, and expertise..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-white transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-slate-700 mb-2">
              Tone / Style
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-white transition-colors"
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={variations}
              onChange={(e) => setVariations(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Generate 2 variations (formal + casual)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={keepUnderLimit}
              onChange={(e) => setKeepUnderLimit(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Keep under 5,000 chars (Upwork limit)</span>
          </label>
        </div>

        <div>
          <label htmlFor="portfolio" className="block text-sm font-medium text-slate-700 mb-2">
            Portfolio Links (optional)
          </label>
          <textarea
            id="portfolio"
            value={portfolioLinks}
            onChange={(e) => setPortfolioLinks(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-white transition-colors"
            placeholder="GitHub, portfolio site, Upwork profile..."
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleCheckMatch}
            disabled={loading || checkingMatch || !jobDescription.trim() || !skillsSummary.trim()}
            className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkingMatch ? "Checking..." : "Check Match"}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Generate Proposal"}
          </button>
        </div>

        {matchResult && (
          <div
            className={`rounded-2xl border p-5 shadow-soft ${
              matchResult.fit === "strong"
                ? "bg-gradient-to-br from-green-50 to-emerald-50/50 border-green-200/80"
                : matchResult.fit === "moderate"
                  ? "bg-gradient-to-br from-amber-50 to-orange-50/30 border-amber-200/80"
                  : "bg-slate-50/80 border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-slate-900">{matchResult.score}%</span>
                  <span
                    className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                      matchResult.fit === "strong"
                        ? "bg-green-200 text-green-800"
                        : matchResult.fit === "moderate"
                          ? "bg-amber-200 text-amber-800"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {matchResult.fit === "strong"
                      ? "Strong fit"
                      : matchResult.fit === "moderate"
                        ? "Moderate fit"
                        : "Weak fit"}
                  </span>
                </div>
                {matchResult.summary && (
                  <p className="text-sm text-slate-700">{matchResult.summary}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMatchResult(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <p className="text-xs text-slate-500 text-center">
          <kbd className="px-2 py-1 bg-slate-100 rounded-lg text-slate-600 font-medium">⌘</kbd>+<kbd className="px-2 py-1 bg-slate-100 rounded-lg text-slate-600 font-medium">Enter</kbd> or <kbd className="px-2 py-1 bg-slate-100 rounded-lg text-slate-600 font-medium">Ctrl</kbd>+<kbd className="px-2 py-1 bg-slate-100 rounded-lg text-slate-600 font-medium">Enter</kbd> to generate
        </p>
      </form>

      {result && (
        <div className="rounded-2xl bg-white border border-slate-200/60 p-6 space-y-6 shadow-card">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Your Optimized Proposal</h2>
            <div className="flex items-center gap-3">
              {result.match_score != null && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Match score:</span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-sm font-semibold ${
                      result.match_score >= 80
                        ? "bg-green-100 text-green-800"
                        : result.match_score >= 60
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {result.match_score}%
                  </span>
                </div>
              )}
              <button
                onClick={() => copyFullProposal()}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200"
              >
                {copied ? "Copied!" : "Copy All"}
              </button>
            </div>
          </div>

          {result.important_keywords && result.important_keywords.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Keyword Analysis</h3>
              <div className="flex flex-wrap gap-2">
                {result.important_keywords.map((kw, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      result.missing_keywords?.includes(kw)
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {kw}
                    {result.missing_keywords?.includes(kw) ? " (missing)" : " ✓"}
                  </span>
                ))}
              </div>
              {result.missing_keywords && result.missing_keywords.length > 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  Consider adding: {result.missing_keywords.join(", ")}
                </p>
              )}
            </div>
          )}

          {result.variations && result.variations.length > 1 && (
            <div className="flex gap-2 border-b border-slate-200 pb-4">
              {result.variations.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariation(i)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    selectedVariation === i
                      ? "bg-primary-100 text-primary-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {i === 0 ? "Variation A (Formal)" : "Variation B (Casual)"}
                </button>
              ))}
            </div>
          )}

          {(() => {
            const display = result.variations && result.variations.length > 1
              ? result.variations[selectedVariation]
              : result;
            return (
              <>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">
                      Length: {getCharCount(display)} / {UPWORK_LIMIT} chars
                    </span>
                    {getCharCount(display) > UPWORK_LIMIT && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                        Over Upwork limit
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => copyFullProposal(display)}
                    className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                  >
                    {copied ? "Copied!" : result.variations?.length ? "Copy this variation" : "Copy All"}
                  </button>
                  <button
                    onClick={handleImprove}
                    disabled={improving}
                    className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 disabled:opacity-50"
                  >
                    {improving ? "Improving..." : "Improve this"}
                  </button>
                </div>
                <ProposalPreview
                  content={getFullProposal(display)}
                  charCount={getCharCount(display)}
                  limit={UPWORK_LIMIT}
                />
                <div>
                  <label htmlFor="improve-feedback" className="block text-sm font-medium text-slate-700 mb-1">
                    What to improve? (optional)
                  </label>
                  <input
                    id="improve-feedback"
                    type="text"
                    value={improveFeedback}
                    onChange={(e) => setImproveFeedback(e.target.value)}
                    placeholder="e.g. Make it shorter, add more about React..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-1">Opening Hook</h3>
                  <p className="text-slate-800 whitespace-pre-wrap">{display.hook}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-1">Client Pain Points</h3>
                  <ul className="list-disc list-inside text-slate-800 space-y-1">
                    {display.pain_points.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-1">Proposal</h3>
                  <p className="text-slate-800 whitespace-pre-wrap">{display.proposal}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-1">Call to Action</h3>
                  <p className="text-slate-800 whitespace-pre-wrap">{display.cta}</p>
                </div>
              </>
            );
          })()}

        </div>
      )}
    </div>
  );
}
