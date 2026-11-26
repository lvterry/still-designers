"use client";

import React from "react";
import { PeekingBuddy } from "@/components/doodle-buddies";

export function SignupShowcasePanel() {
  return (
    <aside
      aria-label="What happens inside Still Designers"
      className="relative flex min-h-[520px] flex-col justify-between overflow-hidden rounded-[32px] border-2 border-line px-6 py-10 sm:px-8 sm:py-12"
      style={{
        background:
          "linear-gradient(155deg, var(--brand-sky-tint) 0%, var(--surface-subtle) 50%, var(--brand-sun-tint) 100%)",
      }}
    >
      {/* Subtle warm paper dot texture */}
      <div
        aria-hidden="true"
        className="paper-dots pointer-events-none absolute inset-0 opacity-75"
      />

      {/* Top 2+1 floating pills */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-elevated/95 px-3.5 py-1.5 text-[13px] font-bold text-ink shadow-[0_3px_0_var(--border-subtle)]">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-cobalt"
            />
            <span>Calm by design</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-elevated/95 px-3.5 py-1.5 text-[13px] font-bold text-ink shadow-[0_3px_0_var(--border-subtle)]">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-coral"
            />
            <span>Weekly 15–30 min play</span>
          </span>
        </div>

        <div className="mt-2.5 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-elevated/95 px-3.5 py-1.5 text-[13px] font-bold text-ink shadow-[0_3px_0_var(--border-subtle)]">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-emerald"
            />
            <span>Zero ranking algorithms</span>
          </span>
        </div>
      </div>

      {/* Center focal lockup */}
      <div className="relative z-10 my-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <PeekingBuddy variant="star" className="h-8 w-8" />
          <PeekingBuddy variant="eyes" className="h-6 w-10" />
        </div>
        <h2 className="text-[24px] leading-tight font-extrabold tracking-[-0.02em] text-ink sm:text-[28px]">
          Shared by curious designers
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed font-medium text-ink-secondary">
          Small sparks, pinned notes, and honest takes on how AI changes design
          work.
        </p>
      </div>

      {/* Bottom 3-card peeking strip with full-bleed alpha edge mask */}
      <div
        className="relative z-10 -mx-6 overflow-hidden py-3 sm:-mx-8"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
        }}
      >
        <div className="flex items-stretch justify-center gap-4">
          {/* Left peeking card */}
          <article className="w-[220px] shrink-0 -rotate-2 rounded-[24px] border-2 border-line bg-elevated p-5 text-left shadow-[0_6px_0_var(--border-subtle),var(--shadow-ambient)] sm:w-[250px]">
            <div className="flex items-center gap-2">
              <span
                data-tone="coral"
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10.5px] font-extrabold"
                style={{
                  backgroundColor: "var(--tone-bg)",
                  color: "var(--tone-ink)",
                }}
              >
                ML
              </span>
              <span className="text-[12.5px] font-bold text-ink-secondary">
                Maya Lin
              </span>
            </div>
            <h3 className="mt-3 text-[15px] leading-snug font-extrabold text-ink">
              Bookmarks as moodboards
            </h3>
            <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-ink-secondary">
              What if saving a page pulled one color swatch and a tiny sticker
              note so future-you remembers the feeling?
            </p>
          </article>

          {/* Center hero card */}
          <article className="w-[230px] shrink-0 rotate-1 rounded-[24px] border-2 border-line bg-elevated p-5 text-left shadow-[0_6px_0_var(--border-subtle),var(--shadow-ambient)] sm:w-[260px]">
            <div className="flex items-center gap-2">
              <span
                data-tone="pink"
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10.5px] font-extrabold"
                style={{
                  backgroundColor: "var(--tone-bg)",
                  color: "var(--tone-ink)",
                }}
              >
                PN
              </span>
              <span className="text-[12.5px] font-bold text-ink-secondary">
                Priya Nair
              </span>
            </div>
            <h3 className="mt-3 text-[15.5px] leading-snug font-extrabold text-ink">
              A joy to tinker in
            </h3>
            <p className="mt-1.5 line-clamp-4 text-[13px] leading-relaxed text-ink-secondary">
              Instead of hype threads, every card feels like a postcard spread
              across a studio table. Half my favorite recent ideas started here.
            </p>
          </article>

          {/* Right peeking card */}
          <article className="w-[220px] shrink-0 rotate-2 rounded-[24px] border-2 border-line bg-elevated p-5 text-left shadow-[0_6px_0_var(--border-subtle),var(--shadow-ambient)] sm:w-[250px]">
            <div className="flex items-center gap-2">
              <span
                data-tone="emerald"
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10.5px] font-extrabold"
                style={{
                  backgroundColor: "var(--tone-bg)",
                  color: "var(--tone-ink)",
                }}
              >
                TV
              </span>
              <span className="text-[12.5px] font-bold text-ink-secondary">
                Tomas Vega
              </span>
            </div>
            <h3 className="mt-3 text-[15px] leading-snug font-extrabold text-ink">
              Tactile knobs over sliders
            </h3>
            <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-ink-secondary">
              Imagine tuning an AI assistant&apos;s playfulness with chunky knobs
              that click softly into place.
            </p>
          </article>
        </div>
      </div>
    </aside>
  );
}
