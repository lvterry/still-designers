"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Bookmark,
  ChevronDown,
  LogOut,
  Plus,
  Sparkles,
} from "lucide-react";
import { useCommunity } from "@/context/community-context";
import { cn } from "@/lib/cn";

export type FeedView = "discover" | "prompt" | "about" | "favorites" | "works";

interface HeaderProps {
  view: FeedView;
  onChangeView: (view: FeedView) => void;
  onOpenCompose: () => void;
  onSelectPostById: (postId: string) => void;
}

export function Header({
  view,
  onChangeView,
  onOpenCompose,
  onSelectPostById,
}: HeaderProps) {
  const {
    role,
    currentUser,
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
    requireMemberAction,
    setRole,
    saves,
  } = useCommunity();

  const [notifOpen, setNotifOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setAccountMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const navItems: { id: FeedView; label: string }[] = [
    { id: "discover", label: "Discover" },
    { id: "prompt", label: "Weekly prompt" },
    { id: "about", label: "About" },
  ];

  const handleOpenNotifications = () => {
    requireMemberAction("Join in to see replies on your discoveries.", () => {
      setAccountMenuOpen(false);
      setNotifOpen((prev) => {
        const next = !prev;
        if (next && unreadNotificationCount > 0) {
          markAllNotificationsRead();
        }
        return next;
      });
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b-2 border-line bg-header backdrop-blur-md">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-8">
        {/* Left: Feed navigation */}
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto sm:gap-5" aria-label="Primary">
          {navItems.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeView(item.id)}
                className={cn(
                  "relative whitespace-nowrap px-1.5 py-1.5 text-[15px] font-semibold transition-colors",
                  active
                    ? "text-ink"
                    : "text-ink-secondary hover:text-ink"
                )}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute right-1 bottom-0 left-1 h-[3.5px] rounded-full bg-coral"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Center: Logo */}
        <button
          type="button"
          onClick={() => onChangeView("discover")}
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
        </button>

        {/* Right: Clean uncluttered controls (Notifications, Share, Avatar menu / Sign in) */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3">
          {/* Notifications (replies only — never reactions) */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={handleOpenNotifications}
              aria-label="Notifications"
              aria-expanded={notifOpen}
              className="toy-button-soft relative flex h-10 w-10 items-center justify-center rounded-2xl"
            >
              <Bell className="h-[18px] w-[18px]" />
              {role !== "visitor" &&
                role !== "onboarding" &&
                unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold text-ink-on-bold">
                    {unreadNotificationCount}
                  </span>
                )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border-2 border-line-strong bg-elevated shadow-[var(--shadow-float)] sm:w-96">
                <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                  <span className="text-[15px] font-bold text-ink">
                    Replies and notes
                  </span>
                  <span className="text-[12px] text-ink-muted">
                    Reactions stay quiet
                  </span>
                </div>
                <div className="max-h-80 divide-y divide-line overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-5 py-8 text-center text-[14px] text-ink-secondary">
                      No replies yet.
                    </p>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          onSelectPostById(item.postId);
                        }}
                        className="flex w-full flex-col gap-1 px-5 py-3.5 text-left transition-colors hover:bg-subtle-surface"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[14px] font-bold text-ink">
                            {item.actorName}
                          </span>
                          <span className="text-[12px] font-semibold text-cobalt">
                            Reply
                          </span>
                        </div>
                        <p className="text-[13px] leading-snug text-ink-secondary">
                          {item.snippet}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Share button */}
          <button
            type="button"
            data-tone="coral"
            onClick={() =>
              requireMemberAction(
                "Share your first inspiring discovery to join and start posting.",
                onOpenCompose
              )
            }
            className="toy-button inline-flex h-10 items-center gap-1.5 rounded-2xl px-4 text-[15px] font-bold"
          >
            <Plus className="h-4 w-4 stroke-[2.8]" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Login or Avatar Dropdown Menu (My favorites & My works) */}
          {role === "visitor" ? (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="toy-button-soft inline-flex h-10 items-center justify-center rounded-2xl px-3.5 text-[14.5px] font-bold"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                data-tone="cobalt"
                className="toy-button inline-flex h-10 items-center justify-center rounded-2xl px-4 text-[14.5px] font-extrabold"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(false);
                  setAccountMenuOpen((prev) => !prev);
                }}
                aria-label="Account menu"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                data-tone={currentUser?.tone ?? "pink"}
                className="toy-button-soft flex h-10 items-center gap-2 rounded-2xl px-2.5 pr-3 text-[14px] font-bold"
                style={
                  accountMenuOpen || view === "favorites" || view === "works"
                    ? { borderColor: "var(--ink-primary)" }
                    : undefined
                }
                title={`Signed in as ${currentUser?.name}`}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold"
                  style={{
                    backgroundColor: "var(--tone-bg)",
                    color: "var(--tone-ink)",
                  }}
                >
                  {currentUser?.initials}
                </span>
                <span className="hidden sm:inline">
                  {currentUser?.name.split(" ")[0]}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-ink-muted transition-transform",
                    accountMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {accountMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-56 overflow-hidden rounded-3xl border-2 border-line-strong bg-elevated py-2 shadow-[var(--shadow-float)]"
                >
                  <div className="border-b border-line px-4 pt-2 pb-2.5">
                    <p className="text-[14.5px] font-extrabold text-ink">
                      {currentUser?.name}
                    </p>
                    <p className="text-[12.5px] text-ink-muted">
                      {currentUser?.handle}
                    </p>
                  </div>

                  <div className="p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onChangeView("favorites");
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-left text-[14.5px] font-bold transition-colors",
                        view === "favorites"
                          ? "bg-subtle-surface text-ink"
                          : "text-ink-secondary hover:bg-subtle-surface hover:text-ink"
                      )}
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <Bookmark className="h-4 w-4 text-pink" />
                        <span>My favorites</span>
                      </span>
                      {saves.length > 0 && (
                        <span className="text-[13px] font-semibold text-ink-muted">
                          {saves.length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onChangeView("works");
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-[14.5px] font-bold transition-colors",
                        view === "works"
                          ? "bg-subtle-surface text-ink"
                          : "text-ink-secondary hover:bg-subtle-surface hover:text-ink"
                      )}
                    >
                      <Sparkles className="h-4 w-4 text-emerald" />
                      <span>My works</span>
                    </button>
                  </div>

                  <div className="border-t border-line p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        setRole("visitor");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-[14.5px] font-bold text-ink-secondary transition-colors hover:bg-subtle-surface hover:text-ink"
                    >
                      <LogOut className="h-4 w-4 text-ink-muted" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
