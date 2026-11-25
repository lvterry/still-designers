"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Pause,
  Play,
  Snowflake,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { DiscoveryMedia, VisualPin } from "@/types/community";

function formatDuration(totalSeconds: number) {
  const rounded = Math.max(0, Math.round(totalSeconds));
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface CardMediaPreviewProps {
  media: Exclude<DiscoveryMedia, { type: "quote" }>;
  visualPins: VisualPin[];
  isCardHovered: boolean;
  className?: string;
}

export function CardMediaPreview({
  media,
  visualPins,
  isCardHovered,
  className,
}: CardMediaPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (media.type !== "video") return;
    const video = videoRef.current;
    if (!video) return;

    if (isCardHovered) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [media.type, isCardHovered]);

  const gifSrc =
    media.type === "gif"
      ? prefersReducedMotion && !isCardHovered
        ? media.posterUrl
        : media.url
      : "";

  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-muted-surface",
        className
      )}
    >
      {media.type === "image" && (
        <img
          src={media.url}
          alt={media.alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      )}

      {media.type === "gif" && (
        <>
          <img
            src={gifSrc}
            alt={media.alt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="pointer-events-none absolute bottom-2.5 left-2.5 rounded-lg bg-ink/75 px-2 py-0.5 text-[11px] font-extrabold tracking-[0.06em] text-ink-on-bold backdrop-blur-xs">
            GIF
          </span>
        </>
      )}

      {media.type === "video" && (
        <>
          <video
            ref={videoRef}
            src={media.url}
            poster={media.posterUrl}
            aria-label={media.alt}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              if (el.duration > 0) {
                setProgress((el.currentTime / el.duration) * 100);
              }
            }}
            className="h-full w-full object-cover"
          />

          {/* Center play button — fades out cleanly once hovered preview starts */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200",
              isPlaying ? "opacity-0" : "opacity-100"
            )}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/75 text-ink-on-bold shadow-sm backdrop-blur-xs transition-transform duration-200 group-hover:scale-105">
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </span>
          </span>

          {/* Bottom-right duration + audio badge */}
          <span className="pointer-events-none absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-lg bg-ink/75 px-2 py-0.5 text-[11px] font-bold text-ink-on-bold tabular-nums backdrop-blur-xs">
            {media.hasAudio && <Volume2 className="h-3 w-3" />}
            <span>{formatDuration(media.durationSeconds)}</span>
          </span>

          {/* Thin progress bar along bottom edge while playing */}
          {isPlaying && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-0 bottom-0 left-0 h-[3px] bg-ink/20"
            >
              <span
                className="block h-full bg-elevated transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </span>
          )}
        </>
      )}

      {/* Subtle visual anchor dots preview */}
      {visualPins.map((pin, idx) => (
        <span
          key={pin.id}
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          className="pointer-events-none absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-[10px] font-extrabold text-ink-on-bold shadow-sm"
        >
          {idx + 1}
        </span>
      ))}
    </div>
  );
}

interface ModalMediaStageProps {
  media: DiscoveryMedia;
  visualPins: VisualPin[];
  pinMode: boolean;
  draftPin: { x: number; y: number } | null;
  selectedAnchorId?: string;
  onTogglePinMode: () => void;
  onStageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onSelectPin: (pin: VisualPin, index: number) => void;
  onAnchorQuote: () => void;
}

export function ModalMediaStage({
  media,
  visualPins,
  pinMode,
  draftPin,
  selectedAnchorId,
  onTogglePinMode,
  onStageClick,
  onSelectPin,
  onAnchorQuote,
}: ModalMediaStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [gifFrozen, setGifFrozen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
    media.type === "video" ? media.durationSeconds : 0
  );

  // Reset media playback state when switching cards
  useEffect(() => {
    setGifFrozen(false);
    setVideoPlaying(true);
    setVideoMuted(true);
    setCurrentTime(0);
    setDuration(media.type === "video" ? media.durationSeconds : 0);
  }, [media]);

  // Auto-pause video when pin mode is activated so user can pin a steady frame
  useEffect(() => {
    if (media.type !== "video") return;
    const video = videoRef.current;
    if (!video) return;
    if (pinMode && !video.paused) {
      video.pause();
    }
  }, [pinMode, media.type]);

  if (media.type === "quote") {
    return (
      <div>
        <button
          type="button"
          onClick={onAnchorQuote}
          className="group w-full rounded-[22px] border-l-[5px] p-6 text-left transition-colors hover:brightness-[0.985] sm:p-8"
          style={{
            backgroundColor: "var(--tone-tint)",
            borderLeftColor: "var(--tone-bg)",
          }}
        >
          <span
            aria-hidden="true"
            className="-mb-3 block text-[54px] leading-none font-extrabold opacity-25 select-none"
            style={{ color: "var(--tone-bg)" }}
          >
            “
          </span>
          <blockquote className="text-[21px] leading-[1.32] font-extrabold tracking-[-0.015em] text-ink sm:text-[24px]">
            {media.quoteText}
          </blockquote>
          <p className="mt-4 text-[14px] font-bold text-ink-secondary">
            — {media.quoteAuthor}
            {media.quoteSource ? `, ${media.quoteSource}` : ""}
          </p>
        </button>
        <p className="mt-2.5 text-[13px] text-ink-muted">
          Click the quote to discuss it directly.
        </p>
      </div>
    );
  }

  const effectiveGifFrozen = media.type === "gif" && (gifFrozen || pinMode);

  const toggleVideoPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleVideoMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setVideoMuted(nextMuted);
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = ratio * duration;
    setCurrentTime(video.currentTime);
  };

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div>
      <div
        onClick={onStageClick}
        className={cn(
          "relative aspect-[16/10] w-full overflow-hidden rounded-[22px] bg-muted-surface",
          pinMode && "cursor-crosshair ring-3 ring-cobalt"
        )}
      >
        {media.type === "image" && (
          <img
            src={media.url}
            alt={media.alt}
            className="h-full w-full object-cover"
          />
        )}

        {media.type === "gif" && (
          <>
            <img
              src={effectiveGifFrozen ? media.posterUrl : media.url}
              alt={media.alt}
              className="h-full w-full object-cover"
            />
            <span className="pointer-events-none absolute top-3 left-3 rounded-lg bg-ink/75 px-2.5 py-1 text-[11px] font-extrabold tracking-[0.06em] text-ink-on-bold backdrop-blur-xs">
              {effectiveGifFrozen ? "PAUSED" : "GIF"}
            </span>
          </>
        )}

        {media.type === "video" && (
          <>
            <video
              ref={videoRef}
              src={media.url}
              poster={media.posterUrl}
              aria-label={media.alt}
              autoPlay
              muted={videoMuted}
              loop
              playsInline
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              onLoadedMetadata={(e) => {
                if (e.currentTarget.duration) {
                  setDuration(e.currentTarget.duration);
                }
              }}
              onTimeUpdate={(e) => {
                setCurrentTime(e.currentTarget.currentTime);
              }}
              className="h-full w-full object-cover"
            />

            {/* Clean bottom control bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-3 bottom-3 left-3 flex items-center gap-2.5 rounded-2xl bg-ink/80 px-3 py-2 text-ink-on-bold backdrop-blur-xs"
            >
              <button
                type="button"
                onClick={toggleVideoPlay}
                aria-label={videoPlaying ? "Pause clip" : "Play clip"}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-elevated/15 transition-colors hover:bg-elevated/25"
              >
                {videoPlaying ? (
                  <Pause className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                )}
              </button>

              <div
                role="slider"
                tabIndex={0}
                aria-label="Seek video"
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={Math.round(currentTime)}
                onClick={handleScrub}
                onKeyDown={(e) => {
                  const video = videoRef.current;
                  if (!video) return;
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    video.currentTime = Math.min(duration, video.currentTime + 1);
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 1);
                  }
                }}
                className="relative flex h-5 flex-1 cursor-pointer items-center"
              >
                <span className="h-1.5 w-full overflow-hidden rounded-full bg-elevated/25">
                  <span
                    className="block h-full rounded-full bg-elevated transition-[width] duration-100"
                    style={{ width: `${progressPct}%` }}
                  />
                </span>
              </div>

              <span className="shrink-0 text-[12px] font-bold tabular-nums opacity-90">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>

              {media.hasAudio && (
                <button
                  type="button"
                  onClick={toggleVideoMute}
                  aria-label={videoMuted ? "Unmute audio" : "Mute audio"}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-elevated/15 transition-colors hover:bg-elevated/25"
                >
                  {videoMuted ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </>
        )}

        {/* Interactive visual-anchored comment pins */}
        {visualPins.map((pin, idx) => {
          const active = selectedAnchorId === pin.id;
          return (
            <button
              key={pin.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPin(pin, idx);
              }}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              title={pin.label}
              className={cn(
                "absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[13px] font-extrabold transition-transform hover:scale-115",
                active
                  ? "scale-115 bg-coral text-ink-on-bold ring-4 ring-elevated"
                  : "bg-ink text-ink-on-bold ring-2 ring-elevated"
              )}
            >
              {idx + 1}
            </button>
          );
        })}

        {draftPin && (
          <span
            style={{ left: `${draftPin.x}%`, top: `${draftPin.y}%` }}
            className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-bounce items-center justify-center rounded-full bg-cobalt text-[13px] font-extrabold text-ink-on-bold ring-4 ring-elevated"
          >
            +
          </span>
        )}
      </div>

      {media.caption && (
        <p className="mt-2 text-[13px] font-medium text-ink-muted">
          {media.caption}
        </p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[13px]">
        <span className="text-ink-secondary">
          {pinMode
            ? media.type === "video"
              ? "Video paused — click anywhere on the frame to place a numbered pin."
              : "Click anywhere on the visual to place a numbered pin."
            : visualPins.length > 0
              ? "Click a numbered dot on the visual to focus its discussion."
              : "Attach a note directly to any detail on this visual."}
        </span>

        <div className="flex items-center gap-4">
          {media.type === "gif" && !pinMode && (
            <button
              type="button"
              onClick={() => setGifFrozen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 font-bold text-ink-secondary hover:text-ink"
            >
              <Snowflake className="h-3.5 w-3.5" />
              {gifFrozen ? "Play loop" : "Freeze frame"}
            </button>
          )}

          <button
            type="button"
            onClick={onTogglePinMode}
            className="inline-flex items-center gap-1.5 font-bold text-cobalt hover:underline"
          >
            <MapPin className="h-4 w-4" />
            {pinMode ? "Cancel pin mode" : "Pin a note on this visual"}
          </button>
        </div>
      </div>
    </div>
  );
}
