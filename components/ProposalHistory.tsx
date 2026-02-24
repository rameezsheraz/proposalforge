"use client";

import { useState, useEffect } from "react";

type Proposal = {
  id: string;
  category: string;
  job_description: string;
  generated_proposal: string;
  generated_hook: string;
  generated_pain_points: string;
  generated_cta: string;
  created_at: string;
  status?: string;
  match_score?: number | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  qa: "QA",
  business_analysis: "BA",
  product_owner: "PO",
  product_manager: "Prod Mgr",
  project_manager: "Proj Mgr",
  dev: "Dev",
  devops: "DevOps",
};

export function ProposalHistory({ proposals: initialProposals }: { proposals: Proposal[] }) {
  const [proposals, setProposals] = useState(initialProposals);
  useEffect(() => {
    setProposals(initialProposals);
  }, [initialProposals]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(proposalId: string, status: "won" | "lost" | "pending") {
    setUpdatingId(proposalId);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setProposals((prev) =>
          prev.map((p) => (p.id === proposalId ? { ...p, status } : p))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  function copyProposal(p: Proposal) {
    const painPoints = p.generated_pain_points
      ? p.generated_pain_points.split("\n").filter(Boolean)
      : [];
    const full = [
      p.generated_hook,
      "",
      "Key pain points I can help with:",
      ...painPoints.map((x) => `• ${x}`),
      "",
      p.generated_proposal,
      "",
      p.generated_cta,
    ].join("\n");
    navigator.clipboard.writeText(full);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (proposals.length === 0) {
    return (
      <div className="bg-white p-8 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No proposals yet</h2>
          <p className="text-slate-500 text-sm mb-4">
            Paste a job description above and click Generate to create your first optimized proposal.
          </p>
          <p className="text-xs text-slate-400">
            Your proposals will appear here so you can copy, view, and track them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Proposal History</h2>
      <div className="space-y-3">
        {proposals.map((p) => (
          <div
            key={p.id}
            className="border border-slate-200/80 rounded-xl p-4 hover:bg-slate-50/80 hover:border-slate-300/60 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    {CATEGORY_LABELS[p.category] ?? p.category}
                  </span>
                  <span className="text-xs text-slate-500">{formatDate(p.created_at)}</span>
                  {p.match_score != null && (
                    <span className="text-xs font-medium px-2 py-0.5 bg-primary-100 text-primary-700 rounded">
                      {p.match_score}% match
                    </span>
                  )}
                  {p.status === "won" && (
                    <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded">
                      Won
                    </span>
                  )}
                  {p.status === "lost" && (
                    <span className="text-xs font-medium px-2 py-0.5 bg-red-100 text-red-700 rounded">
                      Lost
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 line-clamp-2">
                  {p.job_description.slice(0, 120)}...
                </p>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap">
                {p.status !== "won" && (
                  <button
                    onClick={() => updateStatus(p.id, "won")}
                    disabled={updatingId === p.id}
                    className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50"
                  >
                    {updatingId === p.id ? "..." : "Won"}
                  </button>
                )}
                {p.status !== "lost" && (
                  <button
                    onClick={() => updateStatus(p.id, "lost")}
                    disabled={updatingId === p.id}
                    className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
                  >
                    {updatingId === p.id ? "..." : "Lost"}
                  </button>
                )}
                {(p.status === "won" || p.status === "lost") && (
                  <button
                    onClick={() => updateStatus(p.id, "pending")}
                    disabled={updatingId === p.id}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => copyProposal(p)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  {copiedId === p.id ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  className="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                >
                  {expandedId === p.id ? "Hide" : "View"}
                </button>
              </div>
            </div>

            {expandedId === p.id && (
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">Hook</h4>
                  <p className="text-slate-800 whitespace-pre-wrap">{p.generated_hook}</p>
                </div>
                {p.generated_pain_points && (
                  <div>
                    <h4 className="font-medium text-slate-700 mb-1">Pain Points</h4>
                    <ul className="list-disc list-inside text-slate-800">
                      {p.generated_pain_points.split("\n").filter(Boolean).map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">Proposal</h4>
                  <p className="text-slate-800 whitespace-pre-wrap">{p.generated_proposal}</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">CTA</h4>
                  <p className="text-slate-800 whitespace-pre-wrap">{p.generated_cta}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
