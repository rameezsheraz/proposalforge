"use client";

import { useState } from "react";

type ProposalPreviewProps = {
  content: string;
  charCount: number;
  limit: number;
};

export function ProposalPreview({ content, charCount, limit }: ProposalPreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
      >
        {open ? "Hide preview" : "Preview on Upwork"}
      </button>
      {open && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
          <p className="text-xs text-slate-500 mb-2">
            How your proposal will look when pasted into Upwork ({charCount} / {limit} chars)
          </p>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 max-h-80 overflow-y-auto">
            <pre className="text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
              {content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
