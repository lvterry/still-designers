"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { DiscoveryComposerForm } from "@/components/discovery-composer-form";
import { PeekingBuddy } from "@/components/doodle-buddies";
import { useCommunity } from "@/context/community-context";
import type { CardTone } from "@/types/community";

interface ComposeModalProps {
  open: boolean;
  defaultPromptId?: string;
  onClose: () => void;
  onCreated: (postId: string) => void;
}

export function ComposeModal({
  open,
  defaultPromptId,
  onClose,
  onCreated,
}: ComposeModalProps) {
  const { createPost } = useCommunity();
  const [tone, setTone] = useState<CardTone>("coral");

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Share a discovery"
            initial={{ opacity: 0, scale: 0.93, y: 20, rotate: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-[32px] bg-elevated shadow-[var(--shadow-modal)]"
          >
            {/* Fixed modal header */}
            <div
              data-tone={tone}
              className="flex shrink-0 items-start justify-between gap-4 px-7 pt-6 pb-5 transition-colors duration-200"
              style={{ backgroundColor: "var(--tone-bg)", color: "var(--tone-ink)" }}
            >
              <div className="flex items-start gap-3">
                <PeekingBuddy
                  variant="sun"
                  color={tone === "sun" ? "var(--brand-coral)" : undefined}
                  className="h-11 w-11 shrink-0"
                />
                <div>
                  <h2 className="text-[23px] leading-tight font-extrabold">
                    Share a discovery
                  </h2>
                  <p className="mt-1 text-[14.5px] opacity-90">
                    Pick what you’re sharing, credit the author, and add your take.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated/90 text-ink transition-transform hover:scale-105"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <DiscoveryComposerForm
              open={open}
              defaultTone="coral"
              defaultPromptId={defaultPromptId}
              showWeeklyPromptOption
              autoFocusContent
              submitLabel="Publish discovery"
              onCancel={onClose}
              onToneChange={setTone}
              onSubmitDiscovery={(input) => {
                const created = createPost(input);
                onCreated(created.id);
                onClose();
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
