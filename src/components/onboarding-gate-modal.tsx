"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { PeekingBuddy } from "@/components/doodle-buddies";
import { useCommunity } from "@/context/community-context";
import type { CardTone, DiscoveryKind } from "@/types/community";

const KINDS: { value: DiscoveryKind; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "article", label: "Article" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "designer", label: "Designer" },
];

const TONES: CardTone[] = ["coral", "cobalt", "sun", "emerald", "pink", "sky"];

interface OnboardingGateModalProps {
  onJoinedWithPost: (postId: string) => void;
}

export function OnboardingGateModal({ onJoinedWithPost }: OnboardingGateModalProps) {
  const { gateModalOpen, gateReason, closeGateModal, completeOnboarding, role } =
    useCommunity();

  const [name, setName] = useState("Sam Rivera");
  const [kind, setKind] = useState<DiscoveryKind>("website");
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [originalCreator, setOriginalCreator] = useState("");
  const [personalTake, setPersonalTake] = useState("");
  const [tone, setTone] = useState<CardTone>("emerald");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !personalTake.trim()) {
      setError("Add a title and a quick note about why it inspired you.");
      return;
    }
    const created = completeOnboarding({
      name,
      kind,
      title,
      sourceUrl: sourceUrl || "stilldesigners.com",
      originalCreator: originalCreator || "Original creator",
      personalTake,
      tone,
    });
    setTitle("");
    setSourceUrl("");
    setOriginalCreator("");
    setPersonalTake("");
    setError("");
    onJoinedWithPost(created.id);
  };

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
            className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[32px] bg-elevated shadow-[var(--shadow-modal)]"
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
                    {role === "onboarding"
                      ? "One last step to join in"
                      : "Bring one spark to the table"}
                  </h2>
                  <p className="mt-1.5 text-[15px] leading-snug opacity-85">
                    {gateReason} Recommend one thing that inspired you—no essay or
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

            <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-7 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
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

                <label className="block">
                  <span className="block text-[14px] font-bold text-ink">
                    What are you recommending?
                  </span>
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value as DiscoveryKind)}
                    className="mt-1.5 w-full rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                  >
                    {KINDS.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="block text-[14px] font-bold text-ink">
                  Title of the inspiring thing
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Playful scroll physics on Studio Mono"
                  className="mt-1.5 w-full rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="block text-[14px] font-bold text-ink">
                    Original creator or source
                  </span>
                  <input
                    type="text"
                    value={originalCreator}
                    onChange={(e) => setOriginalCreator(e.target.value)}
                    placeholder="Creator or studio name"
                    className="mt-1.5 w-full rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="block text-[14px] font-bold text-ink">
                    Link (optional for designers)
                  </span>
                  <input
                    type="text"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="mt-1.5 w-full rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-[14px] font-bold text-ink">
                  Why did this inspire you?
                </span>
                <textarea
                  rows={3}
                  value={personalTake}
                  onChange={(e) => setPersonalTake(e.target.value)}
                  placeholder="A couple of honest sentences is plenty..."
                  className="mt-1.5 w-full resize-none rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                />
              </label>

              <div>
                <span className="block text-[14px] font-bold text-ink">
                  Pick your card color
                </span>
                <div className="mt-2.5 flex items-center gap-3">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      data-tone={t}
                      onClick={() => setTone(t)}
                      aria-label={`Use ${t} color`}
                      aria-pressed={tone === t}
                      className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: "var(--tone-bg)",
                        outline:
                          tone === t ? "3px solid var(--ink-primary)" : "none",
                        outlineOffset: tone === t ? "3px" : "0px",
                      }}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-[14px] font-semibold text-danger">{error}</p>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="text-[13px] text-ink-muted">
                  After this, you stay a member for good.
                </span>
                <button
                  type="submit"
                  data-tone="emerald"
                  className="toy-button rounded-2xl px-6 py-2.5 text-[15px] font-extrabold"
                >
                  Share and join in
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
