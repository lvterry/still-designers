"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { PeekingBuddy } from "@/components/doodle-buddies";

interface OnboardingWelcomeBannerProps {
  onShareFirstSpark: () => void;
  onDismiss: () => void;
}

export function OnboardingWelcomeBanner({
  onShareFirstSpark,
  onDismiss,
}: OnboardingWelcomeBannerProps) {
  return (
    <motion.section
      aria-label="Welcome to Still Designers"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="mb-7 flex flex-col justify-between gap-4 rounded-[28px] border-2 border-line px-6 py-5 sm:flex-row sm:items-center sm:px-7 sm:py-6"
      style={{
        background:
          "linear-gradient(135deg, var(--brand-sun-tint) 0%, var(--surface-elevated) 60%)",
        boxShadow: "0 6px 0 var(--border-subtle), var(--shadow-ambient)",
      }}
    >
      <div className="flex items-start gap-4">
        <PeekingBuddy variant="blob" className="mt-0.5 h-12 w-12 shrink-0" />
        <div>
          <h2 className="text-[19px] leading-tight font-extrabold text-ink sm:text-[21px]">
            Welcome in! Peek around first.
          </h2>
          <p className="mt-1 max-w-xl text-[14.5px] leading-relaxed font-medium text-ink-secondary">
            Browse cards, react, or leave a note anytime. Whenever you&apos;re
            ready, share one inspiring link, image, or quote to finish
            onboarding.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5 self-start sm:self-center">
        <button
          type="button"
          data-tone="coral"
          onClick={onShareFirstSpark}
          className="toy-button inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[14.5px] font-extrabold"
        >
          <Plus className="h-4 w-4 stroke-[2.8]" />
          <span>Share your first spark</span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss welcome note"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-subtle-surface hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.section>
  );
}
