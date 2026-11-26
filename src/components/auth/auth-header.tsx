"use client";

import React from "react";
import Link from "next/link";

interface AuthHeaderProps {
  mode: "sign-in" | "sign-up";
}

export function AuthHeader({ mode }: AuthHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-line bg-header backdrop-blur-md">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-8">
        <nav
          className="flex min-w-0 items-center gap-1 overflow-x-auto sm:gap-5"
          aria-label="Primary"
        >
          <Link
            href="/"
            className="whitespace-nowrap px-1.5 py-1.5 text-[15px] font-semibold text-ink-secondary transition-colors hover:text-ink"
          >
            Discover
          </Link>
          <Link
            href="/?view=prompt"
            className="whitespace-nowrap px-1.5 py-1.5 text-[15px] font-semibold text-ink-secondary transition-colors hover:text-ink"
          >
            Weekly prompt
          </Link>
          <Link
            href="/?view=about"
            className="whitespace-nowrap px-1.5 py-1.5 text-[15px] font-semibold text-ink-secondary transition-colors hover:text-ink"
          >
            About
          </Link>
        </nav>

        <Link
          href="/"
          className="group flex flex-col items-center focus-visible:rounded-2xl"
          title="Still Designers — New tools. Same curiosity."
        >
          <img
            src="/logo.svg"
            alt="Still Designers"
            width={954}
            height={483}
            className="h-10 w-auto transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-1 sm:h-12"
          />
        </Link>

        <div className="flex items-center justify-end">
          {mode === "sign-in" ? (
            <Link
              href="/sign-up"
              data-tone="cobalt"
              className="toy-button inline-flex h-10 items-center justify-center rounded-2xl px-4 text-[14.5px] font-extrabold"
            >
              Sign up
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="toy-button-soft inline-flex h-10 items-center justify-center rounded-2xl px-4 text-[14.5px] font-bold"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
