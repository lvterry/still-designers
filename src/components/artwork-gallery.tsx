"use client";

import React from "react";
import type { ArtworkVariant } from "@/types/community";

export function DiscoveryArtwork({
  variant,
  customImageUrl,
  className = "h-full w-full",
}: {
  variant: ArtworkVariant;
  customImageUrl?: string;
  className?: string;
}) {
  if (customImageUrl) {
    return (
      <img
        src={customImageUrl}
        alt=""
        className={`${className} object-cover`}
      />
    );
  }

  switch (variant) {
    case "bookmark-era":
      return (
        <svg viewBox="0 0 360 220" fill="none" className={className} aria-hidden="true">
          <rect width="360" height="220" fill="var(--surface-canvas)" />
          <g transform="rotate(-6 92 108)">
            <rect x="44" y="46" width="96" height="122" rx="18" fill="var(--brand-sun)" />
            <rect x="58" y="64" width="68" height="44" rx="10" fill="var(--surface-elevated)" />
            <rect x="58" y="120" width="52" height="8" rx="4" fill="var(--ink-primary)" opacity="0.7" />
            <rect x="58" y="136" width="38" height="8" rx="4" fill="var(--ink-primary)" opacity="0.35" />
          </g>
          <g transform="rotate(4 182 108)">
            <rect x="134" y="34" width="102" height="132" rx="20" fill="var(--brand-pink)" />
            <circle cx="170" cy="78" r="10" fill="var(--surface-elevated)" />
            <circle cx="200" cy="78" r="10" fill="var(--surface-elevated)" />
            <circle cx="173" cy="78" r="4.5" fill="var(--ink-primary)" />
            <circle cx="203" cy="78" r="4.5" fill="var(--ink-primary)" />
            <path d="M174 97C180 103 190 103 196 97" stroke="var(--ink-primary)" strokeWidth="4" strokeLinecap="round" />
            <rect x="152" y="124" width="66" height="9" rx="4.5" fill="var(--surface-elevated)" opacity="0.85" />
            <rect x="152" y="140" width="46" height="9" rx="4.5" fill="var(--surface-elevated)" opacity="0.55" />
          </g>
          <g transform="rotate(-3 272 118)">
            <rect x="228" y="56" width="90" height="118" rx="18" fill="var(--brand-sky)" />
            <path d="M254 78H292V124L273 111L254 124V78Z" fill="var(--surface-elevated)" />
            <circle cx="294" cy="148" r="9" fill="var(--brand-sun)" />
          </g>
        </svg>
      );

    case "cursor-garden":
      return (
        <svg viewBox="0 0 360 220" fill="none" className={className} aria-hidden="true">
          <rect width="360" height="220" fill="var(--surface-canvas)" />
          <path d="M24 220C28 164 62 128 96 150C122 167 116 205 116 220H24Z" fill="var(--brand-emerald)" />
          <path d="M236 220C244 152 292 124 334 156C352 170 356 200 356 220H236Z" fill="var(--brand-pink)" />
          <circle cx="78" cy="176" r="8" fill="var(--surface-elevated)" />
          <circle cx="96" cy="176" r="8" fill="var(--surface-elevated)" />
          <circle cx="80" cy="175" r="3.5" fill="var(--ink-primary)" />
          <circle cx="98" cy="175" r="3.5" fill="var(--ink-primary)" />
          <g transform="translate(148 48) rotate(-8)">
            <path d="M12 10L68 42L43 52L58 84L42 92L28 60L12 78V10Z" fill="var(--brand-cobalt)" stroke="var(--surface-elevated)" strokeWidth="6" strokeLinejoin="round" />
            <circle cx="32" cy="42" r="5" fill="var(--surface-elevated)" />
            <circle cx="44" cy="40" r="5" fill="var(--surface-elevated)" />
            <circle cx="33.5" cy="42" r="2.2" fill="var(--ink-primary)" />
            <circle cx="45.5" cy="40" r="2.2" fill="var(--ink-primary)" />
          </g>
          <path d="M222 68C234 58 248 60 256 70" stroke="var(--brand-coral)" strokeWidth="5" strokeLinecap="round" />
          <path d="M232 88C244 82 256 86 262 96" stroke="var(--brand-sun)" strokeWidth="5" strokeLinecap="round" />
          <circle cx="286" cy="172" r="8" fill="var(--surface-elevated)" />
          <circle cx="305" cy="172" r="8" fill="var(--surface-elevated)" />
          <circle cx="284" cy="170" r="3.5" fill="var(--ink-primary)" />
          <circle cx="303" cy="170" r="3.5" fill="var(--ink-primary)" />
        </svg>
      );

    case "ai-bloopers":
      return (
        <svg viewBox="0 0 360 220" fill="none" className={className} aria-hidden="true">
          <rect width="360" height="220" fill="var(--surface-canvas)" />
          <circle cx="72" cy="64" r="34" fill="var(--brand-pink)" opacity="0.55" />
          <circle cx="288" cy="162" r="40" fill="var(--brand-sky)" opacity="0.55" />
          <path d="M76 164V60H126C150 60 162 74 162 93C162 111 150 124 128 126L164 164" stroke="var(--brand-cobalt)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="222" cy="112" r="48" stroke="var(--brand-coral)" strokeWidth="22" />
          <path d="M142 104C168 88 186 88 210 104" stroke="var(--brand-emerald)" strokeWidth="14" strokeLinecap="round" />
          <circle cx="208" cy="108" r="9" fill="var(--surface-elevated)" />
          <circle cx="234" cy="108" r="9" fill="var(--surface-elevated)" />
          <circle cx="211" cy="108" r="4" fill="var(--ink-primary)" />
          <circle cx="237" cy="108" r="4" fill="var(--ink-primary)" />
        </svg>
      );

    case "tactile-knobs":
      return (
        <svg viewBox="0 0 360 220" fill="none" className={className} aria-hidden="true">
          <rect width="360" height="220" fill="var(--surface-canvas)" />
          <circle cx="106" cy="112" r="54" fill="var(--brand-coral-lip)" />
          <circle cx="106" cy="104" r="54" fill="var(--brand-coral)" />
          <line x1="106" y1="104" x2="132" y2="72" stroke="var(--surface-elevated)" strokeWidth="10" strokeLinecap="round" />
          <circle cx="248" cy="112" r="54" fill="var(--brand-cobalt-lip)" />
          <circle cx="248" cy="104" r="54" fill="var(--brand-cobalt)" />
          <line x1="248" y1="104" x2="218" y2="78" stroke="var(--brand-sun)" strokeWidth="10" strokeLinecap="round" />
          <circle cx="106" cy="36" r="5" fill="var(--ink-primary)" opacity="0.3" />
          <circle cx="164" cy="60" r="5" fill="var(--ink-primary)" opacity="0.3" />
          <circle cx="248" cy="36" r="5" fill="var(--ink-primary)" opacity="0.3" />
          <rect x="86" y="178" width="188" height="16" rx="8" fill="var(--surface-muted)" />
          <rect x="86" y="178" width="118" height="16" rx="8" fill="var(--brand-emerald)" />
          <circle cx="204" cy="186" r="12" fill="var(--brand-sun)" stroke="var(--ink-primary)" strokeWidth="3" />
        </svg>
      );

    case "sketch-to-ui":
      return (
        <svg viewBox="0 0 360 220" fill="none" className={className} aria-hidden="true">
          <rect width="360" height="220" fill="var(--surface-canvas)" />
          <g transform="rotate(-5 95 110)">
            <rect x="34" y="42" width="118" height="136" rx="14" fill="var(--surface-elevated)" stroke="var(--ink-primary)" strokeWidth="3.5" strokeDasharray="8 6" />
            <rect x="52" y="64" width="82" height="36" rx="8" stroke="var(--ink-primary)" strokeWidth="3" />
            <line x1="54" y1="118" x2="128" y2="118" stroke="var(--ink-primary)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="54" y1="136" x2="108" y2="136" stroke="var(--ink-primary)" strokeWidth="3.5" strokeLinecap="round" />
          </g>
          <path d="M168 110H202M190 96L205 110L190 124" stroke="var(--brand-coral)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <g transform="rotate(4 265 110)">
            <rect x="212" y="46" width="116" height="136" rx="20" fill="var(--brand-pink-lip)" />
            <rect x="212" y="38" width="116" height="136" rx="20" fill="var(--brand-pink)" />
            <rect x="228" y="56" width="84" height="44" rx="12" fill="var(--brand-sun)" />
            <rect x="228" y="114" width="84" height="14" rx="7" fill="var(--surface-elevated)" />
            <rect x="228" y="138" width="58" height="14" rx="7" fill="var(--brand-sky)" />
          </g>
        </svg>
      );

    case "spatial-type":
      return (
        <svg viewBox="0 0 360 220" fill="none" className={className} aria-hidden="true">
          <rect width="360" height="220" fill="var(--surface-canvas)" />
          <g transform="rotate(-7 88 112)">
            <rect x="46" y="44" width="84" height="132" rx="42" fill="var(--brand-cobalt)" />
            <circle cx="88" cy="110" r="22" fill="var(--surface-canvas)" />
          </g>
          <g transform="rotate(6 182 108)">
            <rect x="142" y="36" width="84" height="140" rx="34" fill="var(--brand-sun)" />
            <circle cx="170" cy="96" r="7" fill="var(--ink-primary)" />
            <circle cx="198" cy="96" r="7" fill="var(--ink-primary)" />
            <path d="M172 118C178 125 190 125 196 118" stroke="var(--ink-primary)" strokeWidth="5" strokeLinecap="round" />
          </g>
          <g transform="rotate(-4 274 114)">
            <rect x="234" y="48" width="84" height="128" rx="42" fill="var(--brand-coral)" />
            <circle cx="276" cy="94" r="18" fill="var(--surface-canvas)" />
          </g>
        </svg>
      );

    case "micro-doodles":
      return (
        <svg viewBox="0 0 360 220" fill="none" className={className} aria-hidden="true">
          <rect width="360" height="220" fill="var(--surface-canvas)" />
          <path d="M40 220V116C40 80 106 80 106 116V220H40Z" fill="var(--brand-coral)" />
          <path d="M128 220V82C128 44 214 44 214 82V220H128Z" fill="var(--brand-emerald)" />
          <path d="M232 220V104C232 64 316 64 316 104V220H232Z" fill="var(--brand-sky)" />
          <ellipse cx="64" cy="134" rx="9" ry="11" fill="var(--surface-elevated)" />
          <ellipse cx="86" cy="134" rx="9" ry="11" fill="var(--surface-elevated)" />
          <circle cx="67" cy="133" r="4.2" fill="var(--ink-primary)" />
          <circle cx="89" cy="133" r="4.2" fill="var(--ink-primary)" />
          <ellipse cx="158" cy="108" rx="11" ry="13" fill="var(--surface-elevated)" />
          <ellipse cx="186" cy="108" rx="11" ry="13" fill="var(--surface-elevated)" />
          <circle cx="156" cy="104" r="5" fill="var(--ink-primary)" />
          <circle cx="184" cy="104" r="5" fill="var(--ink-primary)" />
          <path d="M258 134C262 126 270 126 274 134" stroke="var(--ink-primary)" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M284 134C288 126 296 126 300 134" stroke="var(--ink-primary)" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );

    case "clay-icons":
      return (
        <svg viewBox="0 0 360 220" fill="none" className={className} aria-hidden="true">
          <rect width="360" height="220" fill="var(--surface-canvas)" />
          <rect x="44" y="56" width="84" height="114" rx="26" fill="var(--brand-sun-lip)" />
          <rect x="44" y="46" width="84" height="114" rx="26" fill="var(--brand-sun)" />
          <circle cx="86" cy="102" r="20" fill="var(--surface-elevated)" opacity="0.6" />
          <rect x="142" y="44" width="84" height="134" rx="26" fill="var(--brand-cobalt-lip)" />
          <rect x="142" y="34" width="84" height="134" rx="26" fill="var(--brand-cobalt)" />
          <rect x="164" y="72" width="40" height="40" rx="12" fill="var(--brand-pink)" />
          <rect x="240" y="64" width="80" height="106" rx="26" fill="var(--brand-emerald-lip)" />
          <rect x="240" y="54" width="80" height="106" rx="26" fill="var(--brand-emerald)" />
          <path d="M266 106L278 118L298 92" stroke="var(--surface-elevated)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "sound-buttons":
      return (
        <svg viewBox="0 0 360 220" fill="none" className={className} aria-hidden="true">
          <rect width="360" height="220" fill="var(--surface-canvas)" />
          <circle cx="132" cy="116" r="56" fill="var(--brand-sky-lip)" />
          <circle cx="132" cy="108" r="56" fill="var(--brand-sky)" />
          <circle cx="118" cy="96" r="14" fill="var(--surface-elevated)" opacity="0.45" />
          <path d="M214 78C232 94 232 126 214 142" stroke="var(--brand-coral)" strokeWidth="8" strokeLinecap="round" />
          <path d="M242 58C272 84 272 136 242 162" stroke="var(--brand-sun)" strokeWidth="8" strokeLinecap="round" />
          <path d="M270 42C308 78 308 142 270 178" stroke="var(--brand-pink)" strokeWidth="8" strokeLinecap="round" />
        </svg>
      );

    case "living-grid":
      return (
        <svg viewBox="0 0 360 220" fill="none" className={className} aria-hidden="true">
          <rect width="360" height="220" fill="var(--surface-canvas)" />
          <g transform="rotate(-4 84 68)">
            <rect x="38" y="34" width="92" height="68" rx="16" fill="var(--brand-coral)" />
          </g>
          <g transform="rotate(3 188 68)">
            <rect x="142" y="34" width="92" height="68" rx="16" fill="var(--brand-sun)" />
          </g>
          <g transform="rotate(-3 288 68)">
            <rect x="244" y="34" width="84" height="68" rx="16" fill="var(--brand-sky)" />
          </g>
          <g transform="rotate(4 84 152)">
            <rect x="38" y="118" width="92" height="68" rx="16" fill="var(--brand-pink)" />
          </g>
          <g transform="rotate(-3 188 152)">
            <rect x="142" y="118" width="92" height="68" rx="16" fill="var(--brand-emerald)" />
          </g>
          <g transform="rotate(2 288 152)">
            <rect x="244" y="118" width="84" height="68" rx="16" fill="var(--brand-cobalt)" />
          </g>
        </svg>
      );

    case "paper-shader":
      return (
        <svg viewBox="0 0 360 220" fill="none" className={className} aria-hidden="true">
          <rect width="360" height="220" fill="var(--surface-canvas)" />
          <rect x="44" y="34" width="272" height="152" rx="24" fill="var(--surface-muted)" />
          <circle cx="112" cy="110" r="46" fill="var(--brand-coral)" opacity="0.88" />
          <circle cx="180" cy="110" r="46" fill="var(--brand-sun)" opacity="0.9" />
          <circle cx="248" cy="110" r="46" fill="var(--brand-cobalt)" opacity="0.88" />
          <circle cx="180" cy="110" r="14" fill="var(--surface-canvas)" />
        </svg>
      );

    case "mood-trays":
      return (
        <svg viewBox="0 0 360 220" fill="none" className={className} aria-hidden="true">
          <rect width="360" height="220" fill="var(--surface-canvas)" />
          <rect x="34" y="42" width="88" height="138" rx="20" fill="var(--brand-pink)" />
          <rect x="136" y="34" width="88" height="146" rx="20" fill="var(--brand-sun)" />
          <rect x="238" y="48" width="88" height="132" rx="20" fill="var(--brand-emerald)" />
          <circle cx="68" cy="88" r="7" fill="var(--surface-elevated)" />
          <circle cx="88" cy="88" r="7" fill="var(--surface-elevated)" />
          <circle cx="70" cy="88" r="3" fill="var(--ink-primary)" />
          <circle cx="90" cy="88" r="3" fill="var(--ink-primary)" />
          <path d="M164 88L180 72L196 88L180 104Z" fill="var(--brand-coral)" />
          <circle cx="282" cy="96" r="16" fill="var(--brand-cobalt)" />
          <rect x="52" y="132" width="52" height="10" rx="5" fill="var(--surface-elevated)" opacity="0.85" />
          <rect x="154" y="132" width="52" height="10" rx="5" fill="var(--ink-primary)" opacity="0.55" />
          <rect x="256" y="132" width="52" height="10" rx="5" fill="var(--surface-elevated)" opacity="0.85" />
        </svg>
      );
  }
}
