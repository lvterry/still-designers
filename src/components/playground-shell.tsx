"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { AboutView } from "@/components/about-view";
import { CardDetailModal } from "@/components/card-detail-modal";
import { ComposeModal } from "@/components/compose-modal";
import { DiscoveryCard } from "@/components/discovery-card";
import { PeekingBuddy } from "@/components/doodle-buddies";
import { Header, type FeedView } from "@/components/header";
import { OnboardingGateModal } from "@/components/onboarding-gate-modal";
import { PrototypeDock } from "@/components/prototype-dock";
import { useCommunity } from "@/context/community-context";
import type { DiscoveryPost } from "@/types/community";

export function PlaygroundShell() {
  const {
    posts,
    comments,
    saves,
    currentUser,
    pinnedPrompt,
    requireMemberAction,
  } = useCommunity();

  const [view, setView] = useState<FeedView>("discover");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [skipLayoutTransition, setSkipLayoutTransition] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composePromptId, setComposePromptId] = useState<string | undefined>(undefined);

  const slotRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const activePosts = useMemo(
    () => posts.filter((p) => !p.removed),
    [posts]
  );

  const visiblePosts = useMemo(() => {
    if (view === "about") {
      return [];
    }
    if (view === "prompt") {
      return activePosts
        .filter((p) => p.promptId === pinnedPrompt.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    if (view === "favorites") {
      const saveIds = new Set(saves.map((s) => s.postId));
      return saves
        .map((s) => activePosts.find((p) => p.id === s.postId))
        .filter((p): p is DiscoveryPost => Boolean(p) && saveIds.has(p!.id));
    }
    if (view === "works") {
      if (!currentUser) return [];
      return activePosts
        .filter((p) => p.authorId === currentUser.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    return [...activePosts].sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    );
  }, [activePosts, view, pinnedPrompt.id, saves, currentUser]);

  const savedViaMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of saves) {
      map.set(s.postId, s.discoveredViaName);
    }
    return map;
  }, [saves]);

  const commentCountByPost = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of comments) {
      map.set(c.postId, (map.get(c.postId) ?? 0) + 1);
    }
    return map;
  }, [comments]);

  // Determine the active modal post (even if jumped to a post outside current filter)
  const selectedIndex = useMemo(
    () => visiblePosts.findIndex((p) => p.id === selectedPostId),
    [visiblePosts, selectedPostId]
  );

  const selectedPost = useMemo(() => {
    if (!selectedPostId) return null;
    if (selectedIndex >= 0) return visiblePosts[selectedIndex];
    return activePosts.find((p) => p.id === selectedPostId) ?? null;
  }, [selectedPostId, selectedIndex, visiblePosts, activePosts]);

  // Keep the background grid slot scrolled near viewport so shrink-back always lands cleanly
  useEffect(() => {
    if (!selectedPostId) return;
    const slot = slotRefs.current.get(selectedPostId);
    if (slot) {
      slot.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedPostId]);

  // Lock body scroll while detail modal is open
  useEffect(() => {
    if (!selectedPost) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedPost]);

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) {
      setSkipLayoutTransition(true);
      setSelectedPostId(visiblePosts[selectedIndex - 1].id);
    }
  }, [selectedIndex, visiblePosts]);

  const handleNext = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < visiblePosts.length - 1) {
      setSkipLayoutTransition(true);
      setSelectedPostId(visiblePosts[selectedIndex + 1].id);
    }
  }, [selectedIndex, visiblePosts]);

  const handleCloseModal = useCallback(() => {
    setSkipLayoutTransition(false);
    setSelectedPostId(null);
  }, []);

  const handleJumpToPost = useCallback(
    (postId: string) => {
      const inCurrent = visiblePosts.some((p) => p.id === postId);
      if (!inCurrent) {
        setView("discover");
      }
      setSkipLayoutTransition(selectedPostId !== null);
      setSelectedPostId(postId);
    },
    [visiblePosts, selectedPostId]
  );

  const handleOpenRegularCompose = useCallback((promptId?: string) => {
    setComposePromptId(promptId);
    setComposeOpen(true);
  }, []);

  return (
    <div className="paper-dots flex min-h-screen flex-col">
      <Header
        view={view}
        onChangeView={(next) => {
          setSkipLayoutTransition(false);
          setSelectedPostId(null);
          setView(next);
        }}
        onOpenCompose={() => handleOpenRegularCompose(undefined)}
        onSelectPostById={handleJumpToPost}
      />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-6 pb-28 sm:px-8">
        {/* Contextual playful sub-header (sentence case, no eyebrow labels, no decorative pills) */}
        {view === "discover" && (
          <div className="-mt-2 mb-6 flex items-center justify-center border-b border-line pb-3.5">
            <button
              type="button"
              onClick={() => setView("prompt")}
              className="group inline-flex items-center gap-2 text-center text-[14.5px] font-bold text-cobalt hover:underline"
            >
              <PeekingBuddy variant="star" className="h-6 w-6 shrink-0" />
              <span>Weekly 15–30 min play: {pinnedPrompt.title}</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}

        {view === "prompt" && (
          <div
            data-tone="sun"
            className="mb-9 flex flex-col justify-between gap-5 rounded-[28px] px-6 py-6 sm:flex-row sm:items-center sm:px-8"
            style={{
              backgroundColor: "var(--tone-bg)",
              color: "var(--tone-ink)",
              boxShadow: "0 7px 0 var(--tone-lip)",
            }}
          >
            <div className="flex items-start gap-4">
              <PeekingBuddy variant="star" className="mt-0.5 h-12 w-12 shrink-0" />
              <div>
                <h1 className="text-[23px] leading-tight font-extrabold sm:text-[28px]">
                  {pinnedPrompt.title}
                </h1>
                <p className="mt-1.5 max-w-2xl text-[15.5px] leading-relaxed opacity-85">
                  {pinnedPrompt.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              data-tone="cobalt"
              onClick={() =>
                requireMemberAction(
                  "Share one spark first, then drop your take on this week's prompt!",
                  () => handleOpenRegularCompose(pinnedPrompt.id)
                )
              }
              className="toy-button inline-flex shrink-0 items-center gap-2 self-start rounded-2xl px-5 py-3 text-[15px] font-extrabold sm:self-center"
            >
              <Plus className="h-4 w-4 stroke-[2.8]" />
              <span>Respond to prompt</span>
            </button>
          </div>
        )}

        {view === "favorites" && (
          <div className="mb-8 flex items-center gap-3.5 border-b border-line pb-5">
            <PeekingBuddy variant="cloud" className="h-10 w-12 shrink-0" />
            <div>
              <h1 className="text-[22px] leading-tight font-extrabold text-ink sm:text-[26px]">
                My favorites
              </h1>
              <p className="mt-0.5 text-[15px] text-ink-secondary">
                Your personal inspiration shelf—each card keeps its “discovered via” credit without duplicating feed posts.
              </p>
            </div>
          </div>
        )}

        {view === "works" && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
            <div className="flex items-center gap-3.5">
              <PeekingBuddy variant="blob" className="h-11 w-11 shrink-0" />
              <div>
                <h1 className="text-[22px] leading-tight font-extrabold text-ink sm:text-[26px]">
                  My works
                </h1>
                <p className="mt-0.5 text-[15px] text-ink-secondary">
                  Discoveries shared by {currentUser?.name ?? "you"}.
                </p>
              </div>
            </div>
            <button
              type="button"
              data-tone="coral"
              onClick={() => handleOpenRegularCompose(undefined)}
              className="toy-button inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-[15px] font-extrabold"
            >
              <Plus className="h-4 w-4 stroke-[2.8]" />
              <span>Share a discovery</span>
            </button>
          </div>
        )}

        {view === "about" ? (
          <AboutView
            pinnedPromptTitle={pinnedPrompt.title}
            onNavigate={(next) => {
              setSkipLayoutTransition(false);
              setSelectedPostId(null);
              setView(next);
            }}
            onShareClick={() =>
              requireMemberAction(
                "Share your first inspiring discovery to join and start posting.",
                () => handleOpenRegularCompose(undefined)
              )
            }
          />
        ) : (
          /* Tilted 4-column card grid + shared-element fly-out modal */
          <LayoutGroup id="still-designers-cards">
            {visiblePosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <PeekingBuddy variant="cloud" className="h-16 w-20" />
                <h2 className="mt-4 text-[21px] font-extrabold text-ink">
                  {view === "favorites"
                    ? "No saved inspirations yet"
                    : view === "works"
                      ? "You haven't shared a card yet"
                      : "Nothing here yet"}
                </h2>
                <p className="mt-1.5 max-w-md text-[15px] text-ink-secondary">
                  {view === "favorites"
                    ? "Open any discovery from the feed and hit Save to collect it here with credit."
                    : "Jump back to Discover or share a playful discovery of your own."}
                </p>
                <button
                  type="button"
                  data-tone="cobalt"
                  onClick={() => setView("discover")}
                  className="toy-button mt-5 rounded-2xl px-5 py-2.5 text-[15px] font-extrabold"
                >
                  Explore discoveries
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-7 px-1 py-2 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
                {visiblePosts.map((post) => (
                  <DiscoveryCard
                    key={post.id}
                    post={post}
                    commentCount={commentCountByPost.get(post.id) ?? 0}
                    isSelected={selectedPostId === post.id}
                    skipLayoutTransition={skipLayoutTransition}
                    discoveredVia={
                      view === "favorites" ? savedViaMap.get(post.id) : undefined
                    }
                    onSelect={(id) => {
                      setSkipLayoutTransition(false);
                      setSelectedPostId(id);
                    }}
                    slotRef={(el) => {
                      if (el) slotRefs.current.set(post.id, el);
                      else slotRefs.current.delete(post.id);
                    }}
                  />
                ))}
              </div>
            )}

            <AnimatePresence>
              {selectedPost && (
                <CardDetailModal
                  post={selectedPost}
                  hasPrev={selectedIndex > 0}
                  hasNext={
                    selectedIndex >= 0 && selectedIndex < visiblePosts.length - 1
                  }
                  positionLabel={
                    selectedIndex >= 0
                      ? `${selectedIndex + 1} of ${visiblePosts.length}`
                      : "Discovery"
                  }
                  skipLayoutTransition={skipLayoutTransition}
                  onClose={handleCloseModal}
                  onPrev={handlePrev}
                  onNext={handleNext}
                />
              )}
            </AnimatePresence>
          </LayoutGroup>
        )}
      </main>

      {/* Modals & review controls */}
      <OnboardingGateModal
        onJoinedWithPost={(postId) => {
          setView("discover");
          setSkipLayoutTransition(false);
          setSelectedPostId(postId);
        }}
      />

      <ComposeModal
        open={composeOpen}
        defaultPromptId={composePromptId}
        onClose={() => {
          setComposeOpen(false);
          setComposePromptId(undefined);
        }}
        onCreated={(postId) => {
          if (view === "favorites" || view === "about") setView("discover");
          setSkipLayoutTransition(false);
          setSelectedPostId(postId);
        }}
      />

      <PrototypeDock onSelectPostById={handleJumpToPost} />
    </div>
  );
}
