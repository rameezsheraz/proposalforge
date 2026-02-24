"use client";

import Link from "next/link";

export function OnboardingBanner({ hasProfile }: { hasProfile: boolean }) {
  if (hasProfile) return null;

  return (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-200/60 rounded-2xl p-5 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-semibold text-primary-900">Save your profile to save time</h3>
          <p className="text-sm text-primary-800/90 mt-1">
            Add your skills and portfolio in Settings. They&apos;ll be pre-filled every time you generate a proposal.
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="shrink-0 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 shadow-sm transition-colors"
        >
          Go to Settings
        </Link>
      </div>
    </div>
  );
}
