"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ExternalLink,
  Flag,
  Heart,
  Pencil,
  Reply,
  ShieldAlert,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { ModalMediaStage } from "@/components/discovery-media";
import { useCommunity } from "@/context/community-context";
import { cn } from "@/lib/cn";
import type { CommentItem, DiscoveryPost } from "@/types/community";

interface CardDetailModalProps {
  post: DiscoveryPost;
  hasPrev: boolean;
  hasNext: boolean;
  positionLabel: string;
  skipLayoutTransition?: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function formatShortTime(iso: string) {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Today";
  }
}

export function CardDetailModal({
  post,
  hasPrev,
  hasNext,
  positionLabel,
  skipLayoutTransition = false,
  onClose,
  onPrev,
  onNext,
}: CardDetailModalProps) {
  const {
    role,
    currentUser,
    comments,
    requireSignedInAction,
    togglePostReaction,
    toggleSavePost,
    isPostSaved,
    addVisualPin,
    addComment,
    updateComment,
    deleteComment,
    toggleCommentReaction,
    updatePost,
    deletePost,
    reportPost,
    adminRemovePost,
  } = useCommunity();

  const [commentFilter, setCommentFilter] = useState<"all" | "visual" | "quote">("all");
  const [selectedAnchor, setSelectedAnchor] = useState<{
    type: "visual" | "quote";
    id: string;
    label: string;
  } | null>(null);

  // Pin drop mode
  const [pinMode, setPinMode] = useState(false);
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);
  const [draftPinLabel, setDraftPinLabel] = useState("");
  const [draftPinNote, setDraftPinNote] = useState("");

  // Comment composer
  const [commentText, setCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  // Edit own post
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editTake, setEditTake] = useState(post.personalTake);

  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeCommentTextarea = useCallback(() => {
    const el = commentTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const computed = window.getComputedStyle(el);
    const borderY =
      parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);
    const nextHeight = el.scrollHeight + borderY;
    const clamped = Math.min(Math.max(nextHeight, 44), 104);
    el.style.height = `${clamped}px`;
    el.style.overflowY = nextHeight > 104 ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    resizeCommentTextarea();
  }, [commentText, resizeCommentTextarea]);

  useEffect(() => {
    const el = commentTextareaRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      resizeCommentTextarea();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [resizeCommentTextarea]);

  const cancelPostEdit = useCallback(() => {
    setEditTitle(post.title);
    setEditTake(post.personalTake);
    setEditingPost(false);
  }, [post.title, post.personalTake]);

  // Report
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Missing attribution or credit issue");
  const [reportedToast, setReportedToast] = useState(false);

  // Reset local interactive drafts when switching cards via arrow keys
  useEffect(() => {
    setCommentFilter("all");
    setSelectedAnchor(null);
    setPinMode(false);
    setDraftPin(null);
    setDraftPinLabel("");
    setDraftPinNote("");
    setCommentText("");
    setReplyingToId(null);
    setReplyText("");
    setEditingCommentId(null);
    setEditingPost(false);
    setEditTitle(post.title);
    setEditTake(post.personalTake);
    setReportOpen(false);
    setReportedToast(false);
  }, [post.id, post.title, post.personalTake]);

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (e.key === "Escape") {
        e.preventDefault();
        if (editingPost) {
          cancelPostEdit();
          return;
        }
        onClose();
        return;
      }
      if (isTyping) return;

      if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasPrev, hasNext, onPrev, onNext, onClose, editingPost, cancelPostEdit]);

  const postComments = useMemo(
    () => comments.filter((c) => c.postId === post.id),
    [comments, post.id]
  );

  const rootComments = useMemo(() => {
    const roots = postComments.filter((c) => !c.parentId);
    if (commentFilter === "visual") {
      return roots.filter((c) => c.anchorType === "visual");
    }
    if (commentFilter === "quote") {
      return roots.filter((c) => c.anchorType === "quote");
    }
    return roots;
  }, [postComments, commentFilter]);

  const repliesByParent = useMemo(() => {
    const map = new Map<string, CommentItem[]>();
    for (const c of postComments) {
      if (!c.parentId) continue;
      const list = map.get(c.parentId) ?? [];
      list.push(c);
      map.set(c.parentId, list);
    }
    return map;
  }, [postComments]);

  const saved = isPostSaved(post.id);
  const isOwner = Boolean(currentUser && currentUser.id === post.authorId);
  const supportsVisualPins =
    post.media.type === "image" ||
    post.media.type === "gif" ||
    post.media.type === "video" ||
    (post.media.type === "link" &&
      post.media.embedType !== "youtube" &&
      Boolean(post.media.thumbnailUrl));
  const thumbsActive = Boolean(
    currentUser && post.reactions.thumbsUp.includes(currentUser.id)
  );
  const heartActive = Boolean(
    currentUser && post.reactions.heart.includes(currentUser.id)
  );

  const handleVisualClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pinMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setDraftPin({ x: Math.max(8, Math.min(92, x)), y: Math.max(10, Math.min(90, y)) });
  };

  const handleSaveVisualPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftPin || !draftPinNote.trim()) return;
    addVisualPin(post.id, draftPin.x, draftPin.y, draftPinLabel, draftPinNote);
    setDraftPin(null);
    setDraftPinLabel("");
    setDraftPinNote("");
    setPinMode(false);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    requireSignedInAction("Join in to leave a note or anchored reply.", () => {
      addComment({
        postId: post.id,
        text: commentText,
        anchorType: selectedAnchor?.type,
        anchorId: selectedAnchor?.id,
        anchorLabel: selectedAnchor?.label,
      });
      setCommentText("");
      setSelectedAnchor(null);
    });
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim()) return;
    requireSignedInAction("Join in to reply to this thread.", () => {
      addComment({
        postId: post.id,
        parentId,
        text: replyText,
      });
      setReplyText("");
      setReplyingToId(null);
    });
  };

  const handleSavePostEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTake.trim()) return;
    updatePost(post.id, {
      title: editTitle,
      personalTake: editTake,
    });
    setEditingPost(false);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={post.title || `Discovery by ${post.originalCreator}`}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-scrim backdrop-blur-xs"
      />

      {/* Previous card floating button */}
      {hasPrev && (
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous card"
          className="fixed left-3 z-50 hidden h-12 w-12 items-center justify-center rounded-full border border-line bg-elevated text-ink transition-all hover:scale-105 hover:border-line-strong lg:flex xl:left-6"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
      )}

      {/* Next card floating button */}
      {hasNext && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next card"
          className="fixed right-3 z-50 hidden h-12 w-12 items-center justify-center rounded-full border border-line bg-elevated text-ink transition-all hover:scale-105 hover:border-line-strong lg:flex xl:right-6"
        >
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      )}

      {/* Shared-element fly-out modal shell — keyed by post.id so layoutId transitions cleanly on ArrowLeft/ArrowRight */}
      <motion.div
        key={post.id}
        layoutId={`card-shell-${post.id}`}
        data-tone={post.tone}
        style={{ borderRadius: 28 }}
        transition={{
          layout: skipLayoutTransition
            ? { duration: 0 }
            : { type: "spring", stiffness: 320, damping: 30, mass: 0.9 },
        }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-40 flex h-[90vh] w-full max-w-[1080px] flex-col overflow-hidden bg-elevated shadow-[var(--shadow-modal)]"
      >
        {/* Colored modal top band carrying the card's identity */}
        <div
          className="flex shrink-0 items-start justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6"
          style={{ backgroundColor: "var(--tone-bg)", color: "var(--tone-ink)" }}
        >
          <div className="min-w-0 flex-1">
            {editingPost ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full rounded-2xl border-2 border-transparent bg-elevated px-4 py-2 text-[20px] font-extrabold text-ink transition-colors focus:border-ink focus:outline-none"
              />
            ) : (
              post.title && (
                <h2 className="text-[22px] leading-[1.18] font-extrabold tracking-[-0.01em] sm:text-[27px]">
                  {post.title}
                </h2>
              )
            )}

            <div
              className={cn(
                "flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-semibold",
                (editingPost || post.title) && "mt-2"
              )}
              style={{ color: "var(--tone-ink-muted)" }}
            >
              <span>
                Shared by {post.authorName} · {formatShortTime(post.createdAt)}
                {post.editedAt ? " · Edited" : ""}
              </span>
              <span aria-hidden="true">·</span>
              {post.sourceUrl ? (
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline decoration-2 underline-offset-3 hover:opacity-100"
                >
                  Credit: {post.originalCreator}
                  {post.sourceName ? ` (${post.sourceName})` : ""}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span>Credit: {post.originalCreator}</span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated/90 text-ink transition-transform hover:scale-105"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable inner workspace — zero nested cards, zero decorative pills */}
        <motion.div
          initial={skipLayoutTransition ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            skipLayoutTransition
              ? { duration: 0 }
              : { duration: 0.16, delay: 0.04 }
          }
          className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-[1.15fr_0.95fr] lg:overflow-hidden"
        >
          {/* Left column: Visual + personal take */}
          <div className="shrink-0 space-y-6 px-5 py-6 sm:px-8 lg:shrink lg:overflow-y-auto lg:border-r lg:border-line">
            {/* Interactive media stage (quote, image, GIF, or short video clip) */}
            <div>
              <ModalMediaStage
                media={post.media}
                visualPins={post.visualPins}
                pinMode={pinMode}
                draftPin={draftPin}
                selectedAnchorId={selectedAnchor?.id}
                onTogglePinMode={() =>
                  requireSignedInAction(
                    "Join in to pin notes directly on visuals.",
                    () => {
                      setPinMode((prev) => !prev);
                      setDraftPin(null);
                    }
                  )
                }
                onStageClick={handleVisualClick}
                onSelectPin={(pin, idx) => {
                  setSelectedAnchor({
                    type: "visual",
                    id: pin.id,
                    label: `Visual pin #${idx + 1} · ${pin.label}`,
                  });
                  setCommentFilter("visual");
                }}
                onAnchorQuote={() => {
                  if (post.media.type !== "quote") return;
                  setSelectedAnchor({
                    type: "quote",
                    id: "main-quote",
                    label: `Main quote · '${post.media.quoteText.slice(0, 44)}...'`,
                  });
                  setCommentFilter("quote");
                }}
              />

              {draftPin && (
                <form
                  onSubmit={handleSaveVisualPin}
                  className="mt-3 space-y-2.5 border-l-4 border-cobalt pl-4"
                >
                  <input
                    type="text"
                    value={draftPinLabel}
                    onChange={(e) => setDraftPinLabel(e.target.value)}
                    placeholder="Short label for this spot (optional)"
                    className="w-full rounded-xl border-2 border-line bg-canvas px-3 py-2 text-[14px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={draftPinNote}
                    onChange={(e) => setDraftPinNote(e.target.value)}
                    placeholder="What caught your eye right here?"
                    className="w-full resize-none rounded-xl border-2 border-line bg-canvas px-3 py-2 text-[14px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      data-tone="cobalt"
                      className="toy-button rounded-xl px-4 py-1.5 text-[14px] font-bold"
                    >
                      Save pin note
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftPin(null)}
                      className="px-3 py-1.5 text-[14px] font-semibold text-ink-secondary hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Member's personal take (or edit form) */}
            {editingPost ? (
              <form onSubmit={handleSavePostEdit} className="space-y-3 border-t border-line pt-5">
                <label className="block">
                  <span className="text-[14px] font-bold text-ink">
                    Why this inspired me
                  </span>
                  <textarea
                    rows={3}
                    value={editTake}
                    onChange={(e) => setEditTake(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border-2 border-line bg-canvas px-3.5 py-2.5 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                  />
                </label>
                <div className="flex items-center gap-2.5">
                  <button
                    type="submit"
                    data-tone="emerald"
                    className="toy-button rounded-xl px-4 py-2 text-[14px] font-bold"
                  >
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={cancelPostEdit}
                    className="px-3 py-2 text-[14px] font-semibold text-ink-secondary hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 border-t border-line pt-5">
                <h3 className="text-[16px] font-extrabold text-ink">
                  Why {post.authorName.split(" ")[0]} shared this
                </h3>
                <p className="text-[15.5px] leading-[1.6] text-ink">
                  {post.personalTake}
                </p>
              </div>
            )}
          </div>

          {/* Right column: Actions + threaded & anchored discussions */}
          <div className="flex min-h-0 flex-1 flex-col border-t border-line bg-subtle-surface/40 lg:overflow-hidden lg:border-t-0">
            {/* Action strip */}
            <div className="shrink-0 space-y-3 border-b border-line px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    requireSignedInAction("Join in to cheer on posts with reactions.", () =>
                      togglePostReaction(post.id, "thumbsUp")
                    )
                  }
                  data-tone={thumbsActive ? "sun" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-[14px] font-bold",
                    thumbsActive ? "toy-button" : "toy-button-soft"
                  )}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.reactions.thumbsUp.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    requireSignedInAction("Join in to cheer on posts with reactions.", () =>
                      togglePostReaction(post.id, "heart")
                    )
                  }
                  data-tone={heartActive ? "pink" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-[14px] font-bold",
                    heartActive ? "toy-button" : "toy-button-soft"
                  )}
                >
                  <Heart className="h-4 w-4" />
                  <span>{post.reactions.heart.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    requireSignedInAction("Join in to save discoveries to My favorites.", () =>
                      toggleSavePost(post.id)
                    )
                  }
                  data-tone={saved ? "emerald" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-[14px] font-bold",
                    saved ? "toy-button" : "toy-button-soft"
                  )}
                >
                  <Bookmark className="h-4 w-4" />
                  <span>{saved ? "Saved" : "Save"}</span>
                </button>
              </div>

              {/* Owner / Member / Admin utility actions */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-[13px] font-semibold text-ink-muted">
                {isOwner && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (editingPost) {
                          cancelPostEdit();
                        } else {
                          setEditTitle(post.title);
                          setEditTake(post.personalTake);
                          setEditingPost(true);
                        }
                      }}
                      className="inline-flex items-center gap-1 hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit post
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deletePost(post.id);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete post
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() =>
                    requireSignedInAction("Join in to report content for review.", () =>
                      setReportOpen((prev) => !prev)
                    )
                  }
                  className="inline-flex items-center gap-1 hover:text-ink"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Report
                </button>

                {role === "admin" && (
                  <button
                    type="button"
                    onClick={() => {
                      adminRemovePost(post.id);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 text-danger hover:underline"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Admin remove
                  </button>
                )}
              </div>

              {reportOpen && (
                <div className="space-y-2 border-t border-line pt-3">
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded-xl border-2 border-line bg-elevated px-3 py-1.5 text-[13.5px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                  >
                    <option>Missing attribution or credit issue</option>
                    <option>Copyright or permission concern</option>
                    <option>Unkind or off-topic conduct</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        reportPost(post.id, reportReason);
                        setReportOpen(false);
                        setReportedToast(true);
                      }}
                      data-tone="coral"
                      className="toy-button rounded-xl px-3.5 py-1.5 text-[13px] font-bold"
                    >
                      Send report
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportOpen(false)}
                      className="text-[13px] font-semibold text-ink-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {reportedToast && (
                <p className="text-[13px] font-semibold text-emerald">
                  Thanks for flagging this. Admins can review it in the prototype dock.
                </p>
              )}
            </div>

            {/* Discussion filter tabs (plain underline tabs, no pills) */}
            <div className="flex shrink-0 items-center gap-5 overflow-x-auto border-b border-line px-5 pt-3 sm:px-6">
              {(
                [
                  { id: "all" as const, label: `Discussion (${postComments.length})` },
                  ...(post.media.type === "quote"
                    ? [
                        {
                          id: "quote" as const,
                          label: `Quote (${postComments.filter((c) => c.anchorType === "quote").length})`,
                        },
                      ]
                    : []),
                  ...(supportsVisualPins
                    ? [
                        {
                          id: "visual" as const,
                          label: `Visual pins (${postComments.filter((c) => c.anchorType === "visual").length})`,
                        },
                      ]
                    : []),
                ]
              ).map((tab) => {
                const active = commentFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCommentFilter(tab.id)}
                    className={cn(
                      "relative whitespace-nowrap pb-2.5 text-[14px] font-bold transition-colors",
                      active ? "text-ink" : "text-ink-muted hover:text-ink"
                    )}
                  >
                    {tab.label}
                    {active && (
                      <span className="absolute right-0 bottom-0 left-0 h-[3px] rounded-full bg-cobalt" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Threaded comments list */}
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
              {rootComments.length === 0 ? (
                <p className="py-6 text-[14px] text-ink-muted">
                  {post.media.type === "quote"
                    ? "No notes here yet. Click the quote or start a friendly thread below."
                    : supportsVisualPins
                      ? "No notes here yet. Drop a pin on the visual or start a friendly thread below."
                      : "No notes here yet. Start a friendly thread below."}
                </p>
              ) : (
                rootComments.map((cmt) => {
                  const replies = repliesByParent.get(cmt.id) ?? [];
                  const highlighted =
                    selectedAnchor && cmt.anchorId === selectedAnchor.id;
                  return (
                    <div
                      key={cmt.id}
                      className={cn(
                        "space-y-2 border-b border-line pb-4 last:border-b-0",
                        highlighted && "border-l-4 border-l-coral pl-3"
                      )}
                    >
                      {cmt.anchorLabel && (
                        <p className="text-[12.5px] font-bold text-cobalt">
                          Anchored to {cmt.anchorLabel}
                        </p>
                      )}

                      <CommentRow
                        comment={cmt}
                        currentUserId={currentUser?.id}
                        isEditing={editingCommentId === cmt.id}
                        editValue={editingCommentText}
                        onChangeEditValue={setEditingCommentText}
                        onStartEdit={() => {
                          setEditingCommentId(cmt.id);
                          setEditingCommentText(cmt.text);
                        }}
                        onCancelEdit={() => setEditingCommentId(null)}
                        onSaveEdit={() => {
                          if (editingCommentText.trim()) {
                            updateComment(cmt.id, editingCommentText);
                          }
                          setEditingCommentId(null);
                        }}
                        onDelete={() => deleteComment(cmt.id)}
                        onReact={(kind) =>
                          requireSignedInAction("Join in to react to comments.", () =>
                            toggleCommentReaction(cmt.id, kind)
                          )
                        }
                        onReplyClick={() =>
                          requireSignedInAction("Join in to reply to this comment.", () =>
                            setReplyingToId((prev) => (prev === cmt.id ? null : cmt.id))
                          )
                        }
                      />

                      {/* Threaded replies */}
                      {replies.length > 0 && (
                        <div className="ml-4 space-y-3 border-l-2 border-line-strong pl-3.5 pt-1">
                          {replies.map((rep) => (
                            <CommentRow
                              key={rep.id}
                              comment={rep}
                              currentUserId={currentUser?.id}
                              isEditing={editingCommentId === rep.id}
                              editValue={editingCommentText}
                              onChangeEditValue={setEditingCommentText}
                              onStartEdit={() => {
                                setEditingCommentId(rep.id);
                                setEditingCommentText(rep.text);
                              }}
                              onCancelEdit={() => setEditingCommentId(null)}
                              onSaveEdit={() => {
                                if (editingCommentText.trim()) {
                                  updateComment(rep.id, editingCommentText);
                                }
                                setEditingCommentId(null);
                              }}
                              onDelete={() => deleteComment(rep.id)}
                              onReact={(kind) =>
                                requireSignedInAction("Join in to react to replies.", () =>
                                  toggleCommentReaction(rep.id, kind)
                                )
                              }
                            />
                          ))}
                        </div>
                      )}

                      {replyingToId === cmt.id && (
                        <div className="ml-4 flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSubmitReply(cmt.id);
                              }
                            }}
                            placeholder={`Reply to ${cmt.authorName.split(" ")[0]}...`}
                            className="flex-1 rounded-xl border-2 border-line bg-elevated px-3 py-1.5 text-[14px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSubmitReply(cmt.id)}
                            data-tone="cobalt"
                            className="toy-button rounded-xl px-3.5 py-1.5 text-[13px] font-bold"
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* New comment composer */}
            <form
              onSubmit={handleSubmitComment}
              className="shrink-0 space-y-2 border-t border-line bg-elevated px-5 py-4 sm:px-6"
            >
              {selectedAnchor && (
                <div className="flex items-center justify-between gap-2 text-[12.5px] font-bold text-cobalt">
                  <span className="truncate">
                    Replying on {selectedAnchor.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedAnchor(null)}
                    className="shrink-0 text-ink-muted hover:text-ink"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2">
                <textarea
                  ref={commentTextareaRef}
                  rows={1}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    role === "visitor"
                      ? "Join with one spark to leave a note..."
                      : "Share a curious thought..."
                  }
                  className="min-h-[44px] max-h-[104px] flex-1 resize-none overflow-y-hidden rounded-2xl border-2 border-line bg-canvas px-3.5 py-[10px] text-[14.5px] leading-[20px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                />
                <button
                  type="submit"
                  data-tone="coral"
                  className="toy-button mb-1 h-10 shrink-0 rounded-2xl px-4 text-[14px] font-extrabold"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Mobile prev/next bar */}
        <div className="flex items-center justify-between border-t border-line bg-elevated px-5 py-2.5 lg:hidden">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={onPrev}
            className="inline-flex items-center gap-1.5 text-[14px] font-bold text-ink disabled:opacity-35"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-[13px] text-ink-muted">{positionLabel}</span>
          <button
            type="button"
            disabled={!hasNext}
            onClick={onNext}
            className="inline-flex items-center gap-1.5 text-[14px] font-bold text-ink disabled:opacity-35"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CommentRow({
  comment,
  currentUserId,
  isEditing,
  editValue,
  onChangeEditValue,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onReact,
  onReplyClick,
}: {
  comment: CommentItem;
  currentUserId?: string;
  isEditing: boolean;
  editValue: string;
  onChangeEditValue: (val: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onReact: (kind: "thumbsUp" | "heart") => void;
  onReplyClick?: () => void;
}) {
  const mine = Boolean(currentUserId && comment.authorId === currentUserId);
  const upActive = Boolean(currentUserId && comment.reactions.thumbsUp.includes(currentUserId));
  const heartActive = Boolean(currentUserId && comment.reactions.heart.includes(currentUserId));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <span className="font-extrabold text-ink">{comment.authorName}</span>
        <span className="text-ink-muted">
          {formatShortTime(comment.createdAt)}
          {comment.editedAt ? " · Edited" : ""}
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={editValue}
            onChange={(e) => onChangeEditValue(e.target.value)}
            className="w-full rounded-xl border-2 border-line bg-elevated px-3 py-1.5 text-[14px] text-ink transition-colors focus:border-cobalt focus:outline-none"
          />
          <div className="flex items-center gap-2 text-[13px]">
            <button
              type="button"
              onClick={onSaveEdit}
              className="font-bold text-cobalt hover:underline"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="font-semibold text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[14.5px] leading-relaxed text-ink">{comment.text}</p>
      )}

      <div className="flex flex-wrap items-center gap-3.5 pt-0.5 text-[12.5px] font-semibold text-ink-muted">
        <button
          type="button"
          onClick={() => onReact("thumbsUp")}
          className={cn(
            "inline-flex items-center gap-1 hover:text-ink",
            upActive && "text-cobalt"
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          {comment.reactions.thumbsUp.length}
        </button>

        <button
          type="button"
          onClick={() => onReact("heart")}
          className={cn(
            "inline-flex items-center gap-1 hover:text-ink",
            heartActive && "text-pink"
          )}
        >
          <Heart className="h-3.5 w-3.5" />
          {comment.reactions.heart.length}
        </button>

        {onReplyClick && (
          <button
            type="button"
            onClick={onReplyClick}
            className="inline-flex items-center gap-1 hover:text-ink"
          >
            <Reply className="h-3.5 w-3.5" />
            Reply
          </button>
        )}

        {mine && !isEditing && (
          <>
            <button
              type="button"
              onClick={onStartEdit}
              className="hover:text-ink"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="hover:text-danger"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
