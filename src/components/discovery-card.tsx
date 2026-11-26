"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { CardMediaPreview } from "@/components/discovery-media";
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
  const [isHovered, setIsHovered] = useState(false);

  const isQuote = post.media.type === "quote";

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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          onClick={() => onSelect(post.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(post.id);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={
            isQuote
              ? `Open quote discovery: ${post.title || post.originalCreator}`
              : `Open discovery: ${post.title || post.originalCreator}`
          }
          style={{ borderRadius: 28 }}
          className="toy-card group flex h-full cursor-pointer flex-col overflow-hidden p-3.5 text-left select-none"
        >
          {post.media.type === "quote" ? (
            <>
              {/* Full-bleed typographic postcard directly on the colored toy-card */}
              <div className="flex flex-1 flex-col justify-between px-2 pt-2 pb-3">
                <div>
                  <span
                    aria-hidden="true"
                    className="-mb-2.5 block text-[44px] leading-none font-extrabold opacity-25 select-none"
                  >
                    “
                  </span>
                  <blockquote className="line-clamp-4 text-[18.5px] leading-[1.28] font-extrabold tracking-[-0.015em]">
                    {post.media.quoteText}
                  </blockquote>
                </div>

                <p
                  className="mt-3 truncate text-[13px] font-bold"
                  style={{ color: "var(--tone-ink-muted)" }}
                >
                  — {post.media.quoteAuthor}
                  {post.media.quoteSource ? `, ${post.media.quoteSource}` : ""}
                </p>
              </div>

              <div
                className="mx-1.5 border-t"
                style={{
                  borderColor:
                    "color-mix(in oklch, var(--tone-ink) 16%, transparent)",
                }}
              />

              <div className="flex flex-col justify-between px-1.5 pt-3 pb-1">
                <p
                  className="line-clamp-2 text-[13.5px] leading-[1.42] font-medium"
                  style={{ color: "var(--tone-ink-muted)" }}
                >
                  {post.personalTake}
                </p>

                <div
                  className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-1.5 text-[13px] font-semibold"
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
                      <Heart className="h-3.5 w-3.5" />
                      {post.reactions.heart.length}
                    </span>
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <CardMediaPreview
                media={post.media}
                visualPins={post.visualPins}
                isCardHovered={isHovered}
              />

              <div className="flex flex-1 flex-col justify-between px-1.5 pt-3.5 pb-1">
                <div>
                  {post.title ? (
                    <>
                      <h2 className="text-[18px] leading-[1.22] font-extrabold tracking-[-0.01em]">
                        {post.title}
                      </h2>
                      <p
                        className="mt-1.5 line-clamp-2 text-[14px] leading-[1.42] font-medium"
                        style={{ color: "var(--tone-ink-muted)" }}
                      >
                        {post.personalTake}
                      </p>
                    </>
                  ) : (
                    <p
                      className="line-clamp-3 text-[15px] leading-[1.38] font-bold"
                      style={{ color: "var(--tone-ink)" }}
                    >
                      {post.personalTake}
                    </p>
                  )}
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
                      <Heart className="h-3.5 w-3.5" />
                      {post.reactions.heart.length}
                    </span>
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.article>
      )}
    </div>
  );
}
