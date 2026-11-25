"use client";

import React from "react";
import { ArrowRight, Plus } from "lucide-react";
import { PeekingBuddy } from "@/components/doodle-buddies";
import type { FeedView } from "@/components/header";

interface AboutViewProps {
  pinnedPromptTitle: string;
  onNavigate: (view: FeedView) => void;
  onShareClick: () => void;
}

export function AboutView({
  pinnedPromptTitle,
  onNavigate,
  onShareClick,
}: AboutViewProps) {
  return (
    <div className="mx-auto max-w-4xl py-4 sm:py-6">
      {/* Hero */}
      <section className="flex flex-col gap-5 border-b border-line pb-8">
        <div className="flex items-start gap-4">
          <PeekingBuddy variant="sun" className="mt-1 h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
          <div>
            <h1 className="text-[28px] leading-[1.12] font-extrabold tracking-[-0.015em] text-ink sm:text-[36px]">
              New tools. Same curiosity.
            </h1>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-secondary sm:text-[17px]">
              Still Designers is a playful gathering spot for product, UI, and UX designers
              exploring how AI changes design work. Instead of hype threads or algorithmic feeds,
              every card is a small, attributed spark shared by someone practicing the craft.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:pl-16">
          <button
            type="button"
            data-tone="cobalt"
            onClick={() => onNavigate("discover")}
            className="toy-button inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[15px] font-extrabold"
          >
            <span>Explore discoveries</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate("prompt")}
            className="toy-button-soft inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[15px] font-bold"
          >
            <PeekingBuddy variant="star" className="h-5 w-5 shrink-0" />
            <span>Try this week&apos;s play</span>
          </button>
        </div>
      </section>

      {/* What you can do here */}
      <section className="py-8">
        <h2 className="text-[20px] font-extrabold text-ink sm:text-[22px]">
          What you can do here
        </h2>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div className="border-l-4 border-cobalt pl-4">
            <div className="flex items-center gap-2.5">
              <PeekingBuddy variant="eyes" className="h-6 w-9 shrink-0" />
              <h3 className="text-[16.5px] font-extrabold text-ink">
                Browse &amp; inspect discoveries
              </h3>
            </div>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-secondary">
              Click any tilted card to open its full view, read why another designer shared it,
              and flip cleanly between cards using your{" "}
              <kbd className="rounded-md border border-line-strong bg-elevated px-1.5 py-0.5 text-[12px] font-bold text-ink">
                ←
              </kbd>{" "}
              /{" "}
              <kbd className="rounded-md border border-line-strong bg-elevated px-1.5 py-0.5 text-[12px] font-bold text-ink">
                →
              </kbd>{" "}
              arrow keys.
            </p>
          </div>

          <div className="border-l-4 border-coral pl-4">
            <div className="flex items-center gap-2.5">
              <PeekingBuddy variant="blob" className="h-7 w-7 shrink-0" />
              <h3 className="text-[16.5px] font-extrabold text-ink">
                Pin notes right on the work
              </h3>
            </div>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-secondary">
              Drop numbered visual pins directly onto details of an image, click attributed
              excerpts to start anchored threads, or add your own perspective without duplicating
              someone else&apos;s post.
            </p>
          </div>

          <div className="border-l-4 border-emerald pl-4">
            <div className="flex items-center gap-2.5">
              <PeekingBuddy variant="star" className="h-7 w-7 shrink-0" />
              <h3 className="text-[16.5px] font-extrabold text-ink">
                Weekly 15–30 min play
              </h3>
            </div>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-secondary">
              Low-pressure weekly prompts—like{" "}
              <span className="font-bold text-ink">{pinnedPromptTitle}</span>—give everyone an
              excuse to tinker hands-on with new AI tools and swap quick takeaways.
            </p>
          </div>

          <div className="border-l-4 border-pink pl-4">
            <div className="flex items-center gap-2.5">
              <PeekingBuddy variant="cloud" className="h-6 w-8 shrink-0" />
              <h3 className="text-[16.5px] font-extrabold text-ink">
                Calm by design
              </h3>
            </div>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-secondary">
              A single shared feed ordered by recent activity (new shares and fresh replies)—zero
              ranking algorithms, quiet reactions (notifications only fire for real replies and
              perspectives), and a personal favorites shelf that preserves original credit.
            </p>
          </div>
        </div>
      </section>

      {/* Join in */}
      <section className="flex flex-col justify-between gap-4 border-t border-line pt-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[19px] font-extrabold text-ink">
            Share one spark to join
          </h2>
          <p className="mt-1 max-w-xl text-[14.5px] leading-relaxed text-ink-secondary">
            To keep the room warm and grounded in real curiosity, everyone starts by sharing one
            design discovery or experiment they found genuinely interesting—with credit to its
            original maker.
          </p>
        </div>

        <button
          type="button"
          data-tone="coral"
          onClick={onShareClick}
          className="toy-button inline-flex shrink-0 items-center gap-2 self-start rounded-2xl px-5 py-3 text-[15px] font-extrabold sm:self-center"
        >
          <Plus className="h-4 w-4 stroke-[2.8]" />
          <span>Share a discovery</span>
        </button>
      </section>
    </div>
  );
}
