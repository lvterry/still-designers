"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, ThumbsUp } from "lucide-react";
import { DiscoveryArtwork } from "@/components/artwork-gallery";
import type { DiscoveryPost } from "@/types/community";

interface DiscoveryCardProps {
  post: DiscoveryPost;
  commentCount: number;
  isSelected: boolean;
  skipLayoutTransition?: boolean;
  discoveredVia?: string;
  onSelect: (postId: string) => void;
  slotRef?: (el: HTMLDivElement | null) => void;
}

export function DiscoveryCard({
  post,
  commentCount,
  isSelected,
  skipLayoutTransition = false,
  discoveredVia,
  onSelect,
  slotRef,
}: DiscoveryCardProps) {
  return (
    <div ref={slotRef} className="relative h-full">
      {isSelected ? (
        <div
          aria-hidden="true"
          className="h-full min-h-[312px] w-full rounded-[28px] border-2 border-dashed border-line-strong bg-subtle-surface/60"
        />
      ) : (
        <motion.article
          layoutId={`card-shell-${post.id}`}
          data-tone={post.tone}
          initial={false}
          animate={{
            rotate: post.restTilt,
            y: 0,
            scale: 1,
          }}
          whileHover={{
            rotate: post.hoverTilt,
            y: -7,
            scale: 1.022,
            transition: { type: "spring", stiffness: 360, damping: 22 },
          }}
          whileTap={{
            scale: 0.985,
            rotate: post.hoverTilt * 0.5,
          }}
          transition={{
            layout: skipLayoutTransition
              ? { duration: 0 }
              : { type: "spring", stiffness: 320, damping: 30, mass: 0.9 },
            rotate: { type: "spring", stiffness: 300, damping: 24 },
          }}
          onClick={() => onSelect(post.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(post.id);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Open discovery: ${post.title}`}
          style={{ borderRadius: 28 }}
          className="toy-card group flex h-full cursor-pointer flex-col overflow-hidden p-3.5 text-left select-none"
        >
          {/* Visual cutout window — no border/shadow card-in-card */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-canvas">
            <DiscoveryArtwork
              variant={post.artwork}
              customImageUrl={post.customImageUrl}
              className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
            />

            {/* Subtle visual anchor dots preview */}
            {post.visualPins.map((pin, idx) => (
              <span
                key={pin.id}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                className="pointer-events-none absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-[10px] font-extrabold text-ink-on-bold shadow-sm"
              >
                {idx + 1}
              </span>
            ))}
          </div>

          {/* Content — sentence case, no eyebrow labels, no decorative pills */}
          <div className="flex flex-1 flex-col justify-between px-1.5 pt-3.5 pb-1">
            <div>
              <h2 className="text-[18px] leading-[1.22] font-extrabold tracking-[-0.01em]">
                {post.title}
              </h2>
              <p
                className="mt-1.5 line-clamp-2 text-[14px] leading-[1.42] font-medium"
                style={{ color: "var(--tone-ink-muted)" }}
              >
                {post.personalTake}
              </p>
            </div>

            <div
              className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 text-[13px] font-semibold"
              style={{ color: "var(--tone-ink-muted)" }}
            >
              <span className="truncate">
                {discoveredVia
                  ? `Discovered via ${discoveredVia}`
                  : `By ${post.authorName}`}
              </span>

              <span className="flex items-center gap-2.5 whitespace-nowrap">
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {commentCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {post.reactions.thumbsUp.length}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {post.reactions.heart.length}
                </span>
              </span>
            </div>
          </div>
        </motion.article>
      )}
    </div>
  );
}
