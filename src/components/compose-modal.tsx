"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link2, X } from "lucide-react";
import { PeekingBuddy } from "@/components/doodle-buddies";
import { useCommunity } from "@/context/community-context";
import { cn } from "@/lib/cn";
import type {
  CardTone,
  DiscoveryKind,
  DiscoveryMedia,
  MediaType,
} from "@/types/community";

const TONES: CardTone[] = ["coral", "cobalt", "sun", "emerald", "pink", "sky"];

const MEDIA_FORMATS: { value: MediaType; label: string }[] = [
  { value: "quote", label: "Quote" },
  { value: "image", label: "Image" },
  { value: "gif", label: "GIF" },
  { value: "video", label: "Video clip" },
];

interface DetectedMeta {
  kind: DiscoveryKind;
  kindLabel: string;
  mediaType: MediaType;
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
    let mediaType: MediaType = "image";

    if (
      host.includes("youtube.com") ||
      host.includes("youtu.be") ||
      host.includes("vimeo.com") ||
      host.includes("loom.com") ||
      /\.(mp4|mov|webm)$/i.test(path)
    ) {
      kind = "video";
      kindLabel = "video";
      mediaType = "video";
    } else if (/\.gif$/i.test(path) || host.includes("giphy.com")) {
      kind = "image";
      kindLabel = "GIF";
      mediaType = "gif";
    } else if (
      host === "x.com" ||
      host.includes("twitter.com") ||
      host.includes("bsky.app") ||
      host.includes("threads.net")
    ) {
      kind = "article";
      kindLabel = "post";
      mediaType = "quote";
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
      mediaType = "quote";
    } else if (
      host.includes("dribbble.com") ||
      host.includes("behance.net") ||
      host.includes("are.na") ||
      host.includes("cosmos.so") ||
      host.includes("figma.com") ||
      /\.(png|jpe?g|webp)$/i.test(path)
    ) {
      kind = "image";
      kindLabel = "image";
      mediaType = "image";
    } else if (
      host.endsWith(".design") ||
      host.endsWith(".studio") ||
      host.includes("read.cv") ||
      host.includes("layers.to")
    ) {
      kind = "designer";
      kindLabel = "designer";
      mediaType = "gif";
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
      mediaType,
      host,
      creator,
      suggestedTitle,
    };
  } catch {
    return null;
  }
}

function buildMediaPayload(params: {
  mediaType: MediaType;
  sourceUrl: string;
  title: string;
  quoteText: string;
  personalTake: string;
  creator: string;
  host: string;
}): DiscoveryMedia {
  const { mediaType, sourceUrl, title, quoteText, personalTake, creator, host } =
    params;
  const trimmedUrl = sourceUrl.trim();
  const normalizedUrl = /^https?:\/\//i.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;

  if (mediaType === "quote") {
    return {
      type: "quote",
      quoteText: quoteText.trim() || personalTake.trim(),
      quoteAuthor: creator,
      quoteSource: host,
    };
  }

  if (mediaType === "gif") {
    const isDirectGif = /\.gif(\?.*)?$/i.test(trimmedUrl);
    return {
      type: "gif",
      url: isDirectGif ? normalizedUrl : "/mock-media/cursor-wave.gif",
      posterUrl: isDirectGif ? normalizedUrl : "/mock-media/cursor-wave-poster.png",
      alt: title,
    };
  }

  if (mediaType === "video") {
    const isDirectVideo = /\.(mp4|webm)(\?.*)?$/i.test(trimmedUrl);
    return {
      type: "video",
      url: isDirectVideo ? normalizedUrl : "/mock-media/tactile-knobs.mp4",
      posterUrl: "/mock-media/tactile-knobs-poster.png",
      alt: title,
      durationSeconds: 7,
      hasAudio: true,
    };
  }

  const isDirectImage = /\.(png|jpe?g|webp)(\?.*)?$/i.test(trimmedUrl);
  return {
    type: "image",
    url: isDirectImage ? normalizedUrl : "/mock-media/living-bookmarks.png",
    alt: title,
  };
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
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [manualMediaChoice, setManualMediaChoice] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [personalTake, setPersonalTake] = useState("");
  const [tone, setTone] = useState<CardTone>("coral");
  const [attachToWeeklyPrompt, setAttachToWeeklyPrompt] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSourceUrl("");
    setTitle("");
    setMediaType("image");
    setManualMediaChoice(false);
    setQuoteText("");
    setPersonalTake("");
    setTone("coral");
    setAttachToWeeklyPrompt(Boolean(defaultPromptId));
    setError("");
  }, [open, defaultPromptId]);

  const detected = useMemo(() => detectLinkMetadata(sourceUrl), [sourceUrl]);

  useEffect(() => {
    if (detected && !manualMediaChoice) {
      setMediaType(detected.mediaType);
    }
  }, [detected, manualMediaChoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceUrl.trim()) {
      setError("Paste a link to an article, website, video, or image first.");
      return;
    }
    if (!personalTake.trim()) {
      setError("Tell everyone what inspired you about this piece.");
      return;
    }

    const meta = detected ?? {
      kind: "website" as DiscoveryKind,
      kindLabel: "website",
      mediaType,
      host: "stilldesigners.com",
      creator: "Original creator",
      suggestedTitle: "New design spark",
    };

    const resolvedTitle = title.trim() || meta.suggestedTitle;
    const media = buildMediaPayload({
      mediaType,
      sourceUrl,
      title: resolvedTitle,
      quoteText,
      personalTake,
      creator: meta.creator,
      host: meta.host,
    });

    const created = createPost({
      title: resolvedTitle,
      kind: meta.kind,
      tone,
      media,
      originalCreator: meta.creator,
      sourceName: meta.host,
      sourceUrl: sourceUrl.trim(),
      excerptText: mediaType === "quote" ? quoteText.trim() : "",
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
                    className="w-full rounded-2xl border-2 border-line bg-canvas py-2.5 pr-4 pl-10 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                  />
                </div>
                {detected && (
                  <p className="mt-1.5 text-[13px] font-semibold text-cobalt">
                    Detected {detected.kindLabel} from {detected.host} · Credit:{" "}
                    {detected.creator}
                  </p>
                )}
              </label>

              <div>
                <span className="block text-[14px] font-bold text-ink">
                  How it appears on the card
                </span>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {MEDIA_FORMATS.map((fmt) => {
                    const active = mediaType === fmt.value;
                    return (
                      <button
                        key={fmt.value}
                        type="button"
                        onClick={() => {
                          setMediaType(fmt.value);
                          setManualMediaChoice(true);
                        }}
                        aria-pressed={active}
                        className={cn(
                          "rounded-2xl border-2 px-2.5 py-2 text-[13.5px] font-bold transition-colors",
                          active
                            ? "border-cobalt bg-subtle-surface text-ink"
                            : "border-line bg-canvas text-ink-secondary hover:border-line-strong hover:text-ink"
                        )}
                      >
                        {fmt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {mediaType === "quote" && (
                <label className="block">
                  <span className="block text-[14px] font-bold text-ink">
                    Pull quote (optional)
                  </span>
                  <textarea
                    rows={3}
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    placeholder="Paste the exact line you want featured on the front of the card..."
                    className="mt-1.5 w-full resize-none rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] leading-relaxed text-ink transition-colors focus:border-cobalt focus:outline-none"
                  />
                </label>
              )}

              <label className="block">
                <span className="block text-[14px] font-bold text-ink">
                  What inspired you?
                </span>
                <textarea
                  rows={3}
                  value={personalTake}
                  onChange={(e) => {
                    setPersonalTake(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Share what caught your eye or made you think differently..."
                  className="mt-1.5 w-full resize-none rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] leading-relaxed text-ink transition-colors focus:border-cobalt focus:outline-none"
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
                  className="mt-1.5 w-full rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
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
