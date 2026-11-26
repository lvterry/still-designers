"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { DiscoveryComposerForm } from "@/components/discovery-composer-form";
import { PeekingBuddy } from "@/components/doodle-buddies";
import { useCommunity } from "@/context/community-context";

interface OnboardingGateModalProps {
  onJoinedWithPost: (postId: string) => void;
}

export function OnboardingGateModal({ onJoinedWithPost }: OnboardingGateModalProps) {
  const { gateModalOpen, gateReason, closeGateModal, completeOnboarding } =
    useCommunity();

  const [name, setName] = useState("Sam Rivera");

  useEffect(() => {
    if (gateModalOpen) {
      setName("Sam Rivera");
    }
  }, [gateModalOpen]);

  // Close on Escape
  useEffect(() => {
    if (!gateModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeGateModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gateModalOpen, closeGateModal]);

  return (
    <AnimatePresence>
      {gateModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 backdrop-blur-xs"
          onClick={closeGateModal}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Join Still Designers"
            initial={{ opacity: 0, scale: 0.92, y: 20, rotate: -1.2 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-[32px] bg-elevated shadow-[var(--shadow-modal)]"
          >
            {/* Fixed playful colorful top band */}
            <div
              data-tone="sun"
              className="relative flex shrink-0 items-start justify-between gap-4 px-7 pt-7 pb-6"
              style={{ backgroundColor: "var(--tone-bg)", color: "var(--tone-ink)" }}
            >
              <div className="flex items-start gap-3.5">
                <PeekingBuddy variant="blob" className="mt-0.5 h-12 w-12 shrink-0" />
                <div>
                  <h2 className="text-[24px] leading-tight font-extrabold">
                    Bring one spark to the table
                  </h2>
                  <p className="mt-1.5 text-[15px] leading-snug opacity-85">
                    {gateReason} Share one inspiring thing—no essay or
                    original work required. You only do this once!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeGateModal}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated/80 text-ink transition-transform hover:scale-105"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <DiscoveryComposerForm
              open={gateModalOpen}
              defaultTone="emerald"
              showWeeklyPromptOption={true}
              autoFocusContent={false}
              submitLabel="Share and join in"
              footerHint="After this, you stay a member for good."
              topSlot={
                <label className="block">
                  <span className="block text-[14px] font-bold text-ink">
                    Your name
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Kim"
                    className="mt-1.5 w-full rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                  />
                </label>
              }
              onSubmitDiscovery={(input) => {
                const created = completeOnboarding({ ...input, name });
                onJoinedWithPost(created.id);
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
