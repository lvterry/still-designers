"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useCommunity } from "@/context/community-context";
import { cn } from "@/lib/cn";
import type { Role } from "@/types/community";

const ROLES: { id: Role; label: string; hint: string }[] = [
  { id: "visitor", label: "Public visitor", hint: "Browse only; actions trigger gate" },
  { id: "onboarding", label: "Newcomer (onboarding)", hint: "Signed up, hasn't shared 1st spark" },
  { id: "member", label: "Member (Maya)", hint: "Full participation unlocked" },
  { id: "admin", label: "Admin (Terry)", hint: "Can review reports & remove posts" },
];

export function PrototypeDock({
  onSelectPostById,
}: {
  onSelectPostById: (postId: string) => void;
}) {
  const { role, setRole, analytics, posts, adminRemovePost, resetPrototype } =
    useCommunity();
  const [open, setOpen] = useState(false);

  const reportedPosts = posts.filter((p) => !p.removed && p.reports.length > 0);

  return (
    <div className="fixed right-4 bottom-4 z-30">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="toy-button-soft inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[14px] font-bold shadow-[var(--shadow-float)]"
        >
          <SlidersHorizontal className="h-4 w-4 text-cobalt" />
          <span>Prototype: {ROLES.find((r) => r.id === role)?.label}</span>
          {reportedPosts.length > 0 && role === "admin" && (
            <span className="h-2.5 w-2.5 rounded-full bg-coral" />
          )}
        </button>
      ) : (
        <div className="w-80 rounded-[26px] border-2 border-line-strong bg-elevated p-5 shadow-[var(--shadow-modal)]">
          <div className="flex items-center justify-between gap-2 pb-3">
            <span className="text-[15px] font-extrabold text-ink">
              Prototype review controls
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Collapse prototype controls"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-subtle-surface text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5 border-t border-line pt-3">
            <span className="block text-[13px] font-bold text-ink-secondary">
              Preview as role
            </span>
            {ROLES.map((item) => {
              const active = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={cn(
                    "flex w-full flex-col rounded-2xl px-3 py-2 text-left transition-colors",
                    active
                      ? "bg-sun/35 text-ink"
                      : "hover:bg-subtle-surface text-ink-secondary"
                  )}
                >
                  <span className="text-[14px] font-bold text-ink">
                    {item.label}
                  </span>
                  <span className="text-[12px] text-ink-muted">{item.hint}</span>
                </button>
              );
            })}
          </div>

          {/* PRD basic measurement signals */}
          <div className="mt-3 space-y-1 border-t border-line pt-3 text-[13px]">
            <span className="block font-bold text-ink-secondary">
              Basic measurement signals
            </span>
            <div className="flex justify-between text-ink-muted">
              <span>Onboarding completed</span>
              <strong className="font-bold text-ink">
                {analytics.onboardingCompleted}
              </strong>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>First participation</span>
              <strong className="font-bold text-ink">
                {analytics.firstParticipations}
              </strong>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Return visits</span>
              <strong className="font-bold text-ink">
                {analytics.returnVisits}
              </strong>
            </div>
          </div>

          {/* Admin report queue */}
          {role === "admin" && (
            <div className="mt-3 space-y-2 border-t border-line pt-3 text-[13px]">
              <span className="block font-bold text-ink-secondary">
                Reported items ({reportedPosts.length})
              </span>
              {reportedPosts.length === 0 ? (
                <p className="text-ink-muted">No active reports right now.</p>
              ) : (
                reportedPosts.map((rp) => (
                  <div
                    key={rp.id}
                    className="flex items-center justify-between gap-2 border-l-3 border-coral pl-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectPostById(rp.id)}
                      className="truncate text-left font-semibold text-ink hover:underline"
                    >
                      {rp.title || `Discovery by ${rp.originalCreator}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => adminRemovePost(rp.id)}
                      className="shrink-0 font-bold text-danger hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-3 space-y-2 border-t border-line pt-3 text-[13px]">
            <span className="block font-bold text-ink-secondary">
              Auth prototype pages
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/sign-in"
                className="toy-button-soft flex h-9 items-center justify-center rounded-xl px-3 text-[13px] font-bold"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                data-tone="cobalt"
                className="toy-button flex h-9 items-center justify-center rounded-xl px-3 text-[13px] font-extrabold"
              >
                Sign up
              </Link>
            </div>
          </div>

          <div className="mt-4 flex justify-end border-t border-line pt-3">
            <button
              type="button"
              onClick={resetPrototype}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-secondary hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset demo data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
