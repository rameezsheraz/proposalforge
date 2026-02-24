"use client";

import { useState } from "react";

export function ProfileForm({
  initialSkills = "",
  initialPortfolio = "",
}: {
  initialSkills?: string;
  initialPortfolio?: string;
}) {
  const [skillsSummary, setSkillsSummary] = useState(initialSkills);
  const [portfolioLinks, setPortfolioLinks] = useState(initialPortfolio);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillsSummary: skillsSummary.trim(),
          portfolioLinks: portfolioLinks.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to save" });
        return;
      }

      setMessage({ type: "success", text: "Profile saved! Your skills and portfolio will be pre-filled when you generate proposals." });
    } catch {
      setMessage({ type: "error", text: "Failed to connect. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-slate-700 mb-2">
          Your Skills / Profile Summary
        </label>
        <textarea
          id="skills"
          value={skillsSummary}
          onChange={(e) => setSkillsSummary(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-white transition-colors"
          placeholder="Your relevant experience, tools, and expertise (e.g. 5+ years QA, Selenium, Cypress, CI/CD...)"
        />
        <p className="mt-1 text-xs text-slate-500">
          This will be pre-filled when you generate proposals.
        </p>
      </div>

      <div>
        <label htmlFor="portfolio" className="block text-sm font-medium text-slate-700 mb-2">
          Portfolio Links
        </label>
        <textarea
          id="portfolio"
          value={portfolioLinks}
          onChange={(e) => setPortfolioLinks(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-white transition-colors"
          placeholder="GitHub, portfolio site, Upwork profile (one per line)"
        />
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
