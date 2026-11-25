"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link2, X } from "lucide-react";
import { PeekingBuddy } from "@/components/doodle-buddies";
import { useCommunity } from "@/context/community-context";
import type { ArtworkVariant, CardTone, DiscoveryKind } from "@/types/community";

const TONES: CardTone[] = ["coral", "cobalt", "sun", "emerald", "pink", "sky"];

interface DetectedMeta {
  kind: DiscoveryKind;
  kindLabel: string;
  artwork: ArtworkVariant;
  host: string;
  creator: string;
  suggestedTitle: string;
}

function detectLinkMetadata(raw: string): DetectedMeta | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const normalized = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(normalized);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname.replace(/\/+$/, "");
    const lower = `${host}${path}`.toLowerCase();

    let kind: DiscoveryKind = "website";
    let kindLabel = "website";
    let artwork: ArtworkVariant = "living-grid";

    if (
      host.includes("youtube.com") ||
      host.includes("youtu.be") ||
      host.includes("vimeo.com") ||
      host.includes("loom.com")
    ) {
      kind = "video";
      kindLabel = "video";
      artwork = "tactile-knobs";
    } else if (
      host === "x.com" ||
      host.includes("twitter.com") ||
      host.includes("bsky.app") ||
      host.includes("threads.net")
    ) {
      kind = "article";
      kindLabel = "post";
      artwork = "micro-doodles";
    } else if (
      host.includes("substack.com") ||
      host.includes("medium.com") ||
      host.includes("mirror.xyz") ||
      lower.includes("/blog") ||
      lower.includes("/article") ||
      lower.includes("/notes") ||
      lower.includes("/essay")
    ) {
      kind = "article";
      kindLabel = "article";
      artwork = "paper-shader";
    } else if (
      host.includes("dribbble.com") ||
      host.includes("behance.net") ||
      host.includes("are.na") ||
      host.includes("cosmos.so") ||
      host.includes("figma.com") ||
      /\.(png|jpe?g|gif|webp)$/i.test(path)
    ) {
      kind = "image";
      kindLabel = "visual";
      artwork = "clay-icons";
    } else if (
      host.endsWith(".design") ||
      host.endsWith(".studio") ||
      host.includes("read.cv") ||
      host.includes("layers.to")
    ) {
      kind = "designer";
      kindLabel = "designer";
      artwork = "spatial-type";
    }

    const segments = path.split("/").filter(Boolean);
    let creator = host;
    if ((host === "x.com" || host.includes("twitter.com")) && segments[0]) {
      creator = `@${segments[0].replace(/^@/, "")}`;
    } else {
      const baseName = host.split(".")[0] || host;
      creator = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    }

    const lastSlug = [...segments]
      .reverse()
      .find((s) => s.length > 2 && !/^\d+$/.test(s) && s !== "status");
    const suggestedTitle = lastSlug
      ? lastSlug
          .replace(/[-_]+/g, " ")
          .replace(/\.[a-z0-9]+$/i, "")
          .replace(/^./, (c) => c.toUpperCase())
      : `Inspiration from ${host}`;

    return {
      kind,
      kindLabel,
      artwork,
      host,
      creator,
      suggestedTitle,
    };
  } catch {
    return null;
  }
}

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
  const { createPost, pinnedPrompt } = useCommunity();

  const [sourceUrl, setSourceUrl] = useState("");
  const [title, setTitle] = useState("");
  const [personalTake, setPersonalTake] = useState("");
  const [tone, setTone] = useState<CardTone>("coral");
  const [attachToWeeklyPrompt, setAttachToWeeklyPrompt] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSourceUrl("");
    setTitle("");
    setPersonalTake("");
    setTone("coral");
    setAttachToWeeklyPrompt(Boolean(defaultPromptId));
    setError("");
  }, [open, defaultPromptId]);

  const detected = useMemo(() => detectLinkMetadata(sourceUrl), [sourceUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceUrl.trim()) {
      setError("Paste a link to an article, website, video, or tweet first.");
      return;
    }
    if (!personalTake.trim()) {
      setError("Tell everyone what inspired you about this piece.");
      return;
    }

    const meta = detected ?? {
      kind: "website" as DiscoveryKind,
      kindLabel: "website",
      artwork: "living-grid" as ArtworkVariant,
      host: "stilldesigners.com",
      creator: "Original creator",
      suggestedTitle: "New design spark",
    };

    const created = createPost({
      title: title.trim() || meta.suggestedTitle,
      kind: meta.kind,
      tone,
      artwork: meta.artwork,
      originalCreator: meta.creator,
      sourceName: meta.host,
      sourceUrl: sourceUrl.trim(),
      excerptText: "",
      personalTake,
      promptId: attachToWeeklyPrompt ? pinnedPrompt.id : undefined,
    });
    onCreated(created.id);
    onClose();
  };

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
                <PeekingBuddy variant="sun" className="h-11 w-11 shrink-0" />
                <div>
                  <h2 className="text-[23px] leading-tight font-extrabold">
                    Share a discovery
                  </h2>
                  <p className="mt-1 text-[14.5px] opacity-90">
                    Paste a link and share what sparked your curiosity.
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

            {/* Scrollable modal body */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 space-y-5 overflow-y-auto px-7 py-6"
            >
              <label className="block">
                <span className="block text-[14px] font-bold text-ink">
                  Link
                </span>
                <div className="relative mt-1.5">
                  <Link2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    value={sourceUrl}
                    onChange={(e) => {
                      setSourceUrl(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Paste a link to an article, website, video, or tweet"
                    autoFocus
                    className="w-full rounded-2xl border-2 border-line bg-canvas py-2.5 pr-4 pl-10 text-[15px] text-ink focus:border-cobalt focus:outline-none"
                  />
                </div>
                {detected && (
                  <p className="mt-1.5 text-[13px] font-semibold text-cobalt">
                    Detected {detected.kindLabel} from {detected.host} · Credit:{" "}
                    {detected.creator}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="block text-[14px] font-bold text-ink">
                  What inspired you?
                </span>
                <textarea
                  rows={4}
                  value={personalTake}
                  onChange={(e) => {
                    setPersonalTake(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Share what caught your eye or made you think differently..."
                  className="mt-1.5 w-full resize-none rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] leading-relaxed text-ink focus:border-cobalt focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="block text-[14px] font-bold text-ink">
                  Title (optional)
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    detected
                      ? detected.suggestedTitle
                      : "We will pull one from the link if you leave this blank"
                  }
                  className="mt-1.5 w-full rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] text-ink focus:border-cobalt focus:outline-none"
                />
              </label>

              <div>
                <span className="block text-[14px] font-bold text-ink">
                  Card color
                </span>
                <div className="mt-2.5 flex items-center gap-3">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      data-tone={t}
                      onClick={() => setTone(t)}
                      aria-label={`Choose ${t} color`}
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

              <div className="border-t border-line pt-4 text-[14px]">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={attachToWeeklyPrompt}
                    onChange={(e) => setAttachToWeeklyPrompt(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-cobalt"
                  />
                  <span className="text-ink-secondary">
                    Link to this week’s prompt: “{pinnedPrompt.title}”
                  </span>
                </label>
              </div>

              {error && (
                <p className="text-[14px] font-semibold text-danger">{error}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-[14.5px] font-bold text-ink-secondary hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-tone="emerald"
                  className="toy-button rounded-2xl px-6 py-2.5 text-[15px] font-extrabold"
                >
                  Publish discovery
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
