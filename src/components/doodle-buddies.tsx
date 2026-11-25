"use client";

import React from "react";

export function PeekingBuddy({
  variant = "sun",
  className = "h-9 w-9",
}: {
  variant?: "sun" | "cloud" | "star" | "blob" | "eyes";
  className?: string;
}) {
  if (variant === "sun") {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
        <g stroke="var(--brand-sun)" strokeWidth="4.5" strokeLinecap="round">
          <line x1="32" y1="6" x2="32" y2="12" />
          <line x1="32" y1="52" x2="32" y2="58" />
          <line x1="6" y1="32" x2="12" y2="32" />
          <line x1="52" y1="32" x2="58" y2="32" />
          <line x1="13.5" y1="13.5" x2="18" y2="18" />
          <line x1="46" y1="46" x2="50.5" y2="50.5" />
          <line x1="50.5" y1="13.5" x2="46" y2="18" />
          <line x1="18" y1="46" x2="13.5" y2="50.5" />
        </g>
        <circle cx="32" cy="32" r="16" fill="var(--brand-sun)" />
        <circle cx="26.5" cy="30" r="2.4" fill="var(--ink-primary)" />
        <circle cx="37.5" cy="30" r="2.4" fill="var(--ink-primary)" />
        <path
          d="M26 36.5C28 39.5 36 39.5 38 36.5"
          stroke="var(--ink-primary)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "star") {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
        <path
          d="M32 6L39.5 21.5L56.5 23.5L44 35.5L47 52.5L32 44L17 52.5L20 35.5L7.5 23.5L24.5 21.5L32 6Z"
          fill="var(--brand-coral)"
          stroke="var(--brand-coral)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="27" cy="31" r="2.3" fill="var(--ink-primary)" />
        <circle cx="37" cy="31" r="2.3" fill="var(--ink-primary)" />
        <path
          d="M27.5 36.5C29.5 39 34.5 39 36.5 36.5"
          stroke="var(--ink-primary)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "cloud") {
    return (
      <svg viewBox="0 0 72 52" fill="none" className={className} aria-hidden="true">
        <path
          d="M19 42H53C60 42 65 37 65 30.5C65 24.8 61 20.1 55.6 19.2C53.6 11.6 46.8 6 38.5 6C29.5 6 22.1 12.6 20.8 21.2C13.5 21.8 8 27.6 8 34.8C8 38.8 11.4 42 19 42Z"
          fill="var(--brand-pink)"
        />
        <circle cx="31" cy="27" r="2.4" fill="var(--ink-primary)" />
        <circle cx="43" cy="27" r="2.4" fill="var(--ink-primary)" />
        <path
          d="M33 32.5C35 34.8 39 34.8 41 32.5"
          stroke="var(--ink-primary)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "eyes") {
    return (
      <svg viewBox="0 0 56 32" fill="none" className={className} aria-hidden="true">
        <ellipse cx="16" cy="16" rx="11" ry="13" fill="var(--surface-elevated)" />
        <ellipse cx="40" cy="16" rx="11" ry="13" fill="var(--surface-elevated)" />
        <circle cx="19" cy="15" r="5" fill="var(--ink-primary)" />
        <circle cx="43" cy="15" r="5" fill="var(--ink-primary)" />
        <circle cx="21" cy="13" r="1.6" fill="var(--surface-elevated)" />
        <circle cx="45" cy="13" r="1.6" fill="var(--surface-elevated)" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M32 8C45 8 56 17 55 32C54 47 44 56 31 56C17 56 8 46 9 32C10 18 19 8 32 8Z"
        fill="var(--brand-emerald)"
      />
      <ellipse cx="25" cy="29" rx="5.2" ry="6" fill="var(--surface-elevated)" />
      <ellipse cx="39" cy="29" rx="5.2" ry="6" fill="var(--surface-elevated)" />
      <circle cx="26.5" cy="29.5" r="2.6" fill="var(--ink-primary)" />
      <circle cx="40.5" cy="29.5" r="2.6" fill="var(--ink-primary)" />
      <path
        d="M27 40C29.5 42.8 34.5 42.8 37 40"
        stroke="var(--ink-primary)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
