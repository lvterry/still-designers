"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEMO_USERS,
  INITIAL_ANALYTICS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PINNED_PROMPT,
  INITIAL_POSTS,
  INITIAL_SAVES,
} from "@/data/seed";
import type {
  AnalyticsSignals,
  Author,
  CardTone,
  CommentItem,
  DiscoveryKind,
  DiscoveryMedia,
  DiscoveryPost,
  NotificationItem,
  PinnedPrompt,
  Role,
  SavedEntry,
} from "@/types/community";

const STORAGE_KEY = "still-designers-proto-v3";

interface PersistedState {
  role: Role;
  posts: DiscoveryPost[];
  comments: CommentItem[];
  saves: SavedEntry[];
  notifications: NotificationItem[];
  analytics: AnalyticsSignals;
  hasParticipatedAfterJoin: boolean;
}

export interface CreatePostInput {
  title: string;
  kind: DiscoveryKind;
  tone: CardTone;
  media: DiscoveryMedia;
  originalCreator: string;
  sourceName: string;
  sourceUrl: string;
  excerptText: string;
  personalTake: string;
  discussionPrompt?: string;
  promptId?: string;
}

interface CommunityContextValue {
  role: Role;
  currentUser: Author | null;
  posts: DiscoveryPost[];
  comments: CommentItem[];
  saves: SavedEntry[];
  notifications: NotificationItem[];
  pinnedPrompt: PinnedPrompt;
  analytics: AnalyticsSignals;

  // UI triggers
  gateModalOpen: boolean;
  gateReason: string;
  openGateModal: (reason?: string) => void;
  closeGateModal: () => void;
  requireMemberAction: (reason: string, action: () => void) => void;

  // Role & onboarding
  setRole: (role: Role) => void;
  completeOnboarding: (input: {
    name: string;
    kind: DiscoveryKind;
    title: string;
    sourceUrl: string;
    originalCreator: string;
    personalTake: string;
    tone: CardTone;
  }) => DiscoveryPost;
  resetPrototype: () => void;

  // Posts & interactions
  createPost: (input: CreatePostInput) => DiscoveryPost;
  updatePost: (postId: string, patch: { title: string; personalTake: string; discussionPrompt?: string }) => void;
  deletePost: (postId: string) => void;
  adminRemovePost: (postId: string) => void;
  reportPost: (postId: string, reason: string) => void;
  togglePostReaction: (postId: string, kind: "thumbsUp" | "heart") => void;
  toggleSavePost: (postId: string) => void;
  isPostSaved: (postId: string) => boolean;
  addPerspective: (postId: string, text: string) => void;
  addVisualPin: (postId: string, x: number, y: number, label: string, commentText: string) => void;

  // Comments
  addComment: (input: {
    postId: string;
    text: string;
    parentId?: string;
    anchorType?: "visual" | "excerpt";
    anchorId?: string;
    anchorLabel?: string;
  }) => void;
  updateComment: (commentId: string, text: string) => void;
  deleteComment: (commentId: string) => void;
  toggleCommentReaction: (commentId: string, kind: "thumbsUp" | "heart") => void;

  // Notifications
  markAllNotificationsRead: () => void;
  unreadNotificationCount: number;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);

const TILT_PAIRS: [number, number][] = [
  [-2.2, 1.6],
  [1.8, -1.5],
  [-1.5, 2.0],
  [2.1, -1.7],
  [-1.9, 1.5],
  [1.4, -2.1],
];

function defaultMediaForKind(
  kind: DiscoveryKind,
  title: string,
  personalTake: string,
  originalCreator: string
): DiscoveryMedia {
  switch (kind) {
    case "article":
      return {
        type: "quote",
        quoteText: personalTake,
        quoteAuthor: originalCreator,
      };
    case "video":
      return {
        type: "video",
        url: "/mock-media/tactile-knobs.mp4",
        posterUrl: "/mock-media/tactile-knobs-poster.png",
        alt: title,
        durationSeconds: 7,
        hasAudio: true,
      };
    case "designer":
      return {
        type: "gif",
        url: "/mock-media/spatial-type.gif",
        posterUrl: "/mock-media/spatial-type-poster.png",
        alt: title,
      };
    case "image":
      return {
        type: "image",
        url: "/mock-media/riso-eyes-zine.png",
        alt: title,
      };
    case "website":
    default:
      return {
        type: "image",
        url: "/mock-media/living-bookmarks.png",
        alt: title,
      };
  }
}

function defaultState(): PersistedState {
  return {
    role: "member",
    posts: INITIAL_POSTS,
    comments: INITIAL_COMMENTS,
    saves: INITIAL_SAVES,
    notifications: INITIAL_NOTIFICATIONS,
    analytics: INITIAL_ANALYTICS,
    hasParticipatedAfterJoin: true,
  };
}

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [gateReason, setGateReason] = useState(
    "Share one inspiring thing to join the playground."
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        const hasValidPosts =
          parsed &&
          Array.isArray(parsed.posts) &&
          parsed.posts.every(
            (p) => p && p.media && typeof p.media.type === "string"
          );
        if (hasValidPosts) {
          setState({
            ...parsed,
            analytics: {
              ...parsed.analytics,
              returnVisits: (parsed.analytics?.returnVisits ?? 28) + 1,
            },
          });
        }
      }
    } catch {
      // Ignore malformed local state
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }, [state, hydrated]);

  const currentUser: Author | null = useMemo(() => {
    if (state.role === "visitor") return null;
    if (state.role === "onboarding") return DEMO_USERS.newcomer;
    if (state.role === "admin") return DEMO_USERS.terry;
    return DEMO_USERS.maya;
  }, [state.role]);

  const recordFirstParticipation = (prev: PersistedState): PersistedState => {
    if (prev.hasParticipatedAfterJoin) return prev;
    return {
      ...prev,
      hasParticipatedAfterJoin: true,
      analytics: {
        ...prev.analytics,
        firstParticipations: prev.analytics.firstParticipations + 1,
      },
    };
  };

  const openGateModal = (reason?: string) => {
    setGateReason(
      reason || "Share one inspiring thing to join in and unlock all actions."
    );
    setGateModalOpen(true);
  };

  const closeGateModal = () => setGateModalOpen(false);

  const requireMemberAction = (reason: string, action: () => void) => {
    if (state.role === "visitor" || state.role === "onboarding") {
      openGateModal(reason);
      return;
    }
    action();
  };

  const setRole = (role: Role) => {
    setState((prev) => ({
      ...prev,
      role,
      hasParticipatedAfterJoin: role === "onboarding" ? false : prev.hasParticipatedAfterJoin,
    }));
  };

  const completeOnboarding: CommunityContextValue["completeOnboarding"] = ({
    name,
    kind,
    title,
    sourceUrl,
    originalCreator,
    personalTake,
    tone,
  }) => {
    const now = new Date().toISOString();
    const cleanUrl = sourceUrl.trim().startsWith("http")
      ? sourceUrl.trim()
      : `https://${sourceUrl.trim() || "stilldesigners.com"}`;
    const sourceHost = cleanUrl.replace(/^https?:\/\//, "").split("/")[0] || "stilldesigners.com";
    const [restTilt, hoverTilt] = TILT_PAIRS[state.posts.length % TILT_PAIRS.length];
    const displayName = name.trim() || DEMO_USERS.maya.name;

    const newPost: DiscoveryPost = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      kind,
      tone,
      media: defaultMediaForKind(
        kind,
        title.trim(),
        personalTake.trim(),
        originalCreator.trim() || sourceHost
      ),
      restTilt,
      hoverTilt,
      authorId: DEMO_USERS.maya.id,
      authorName: displayName,
      authorHandle: `@${displayName.toLowerCase().replace(/[^a-z0-9]/g, "") || "designer"}`,
      authorRole: "Member",
      authorTone: tone,
      createdAt: now,
      lastActivityAt: now,
      originalCreator: originalCreator.trim() || sourceHost,
      sourceName: sourceHost,
      sourceUrl: cleanUrl,
      attributionNote:
        "External inspiration shared during onboarding—credit belongs to the original creator.",
      excerpts: [
        {
          id: `ex-${Date.now()}`,
          text: personalTake.trim(),
        },
      ],
      personalTake: personalTake.trim(),
      visualPins: [],
      perspectives: [],
      reactions: { thumbsUp: [], heart: [] },
      reports: [],
    };

    setState((prev) => ({
      ...prev,
      role: "member",
      posts: [newPost, ...prev.posts],
      hasParticipatedAfterJoin: false,
      analytics: {
        ...prev.analytics,
        onboardingCompleted: prev.analytics.onboardingCompleted + 1,
      },
    }));
    setGateModalOpen(false);
    return newPost;
  };

  const resetPrototype = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(defaultState());
  };

  const createPost: CommunityContextValue["createPost"] = (input) => {
    const user = currentUser ?? DEMO_USERS.maya;
    const now = new Date().toISOString();
    const [restTilt, hoverTilt] = TILT_PAIRS[state.posts.length % TILT_PAIRS.length];
    const cleanUrl = input.sourceUrl.trim().startsWith("http")
      ? input.sourceUrl.trim()
      : `https://${input.sourceUrl.trim() || "stilldesigners.com"}`;

    const newPost: DiscoveryPost = {
      id: `post-${Date.now()}`,
      title: input.title.trim(),
      kind: input.kind,
      tone: input.tone,
      media: input.media,
      restTilt,
      hoverTilt,
      authorId: user.id,
      authorName: user.name,
      authorHandle: user.handle,
      authorRole: user.roleTitle,
      authorTone: user.tone,
      createdAt: now,
      lastActivityAt: now,
      originalCreator: input.originalCreator.trim() || user.name,
      sourceName: input.sourceName.trim() || cleanUrl.replace(/^https?:\/\//, ""),
      sourceUrl: cleanUrl,
      attributionNote:
        "Shared for inspiration and discussion—credit belongs to the original creator.",
      excerpts: input.excerptText.trim()
        ? [{ id: `ex-${Date.now()}`, text: input.excerptText.trim() }]
        : [],
      personalTake: input.personalTake.trim(),
      discussionPrompt: input.discussionPrompt?.trim() || undefined,
      visualPins: [],
      promptId: input.promptId,
      perspectives: [],
      reactions: { thumbsUp: [], heart: [] },
      reports: [],
    };

    setState((prev) => {
      const next = recordFirstParticipation(prev);
      return {
        ...next,
        posts: [newPost, ...next.posts],
      };
    });

    return newPost;
  };

  const updatePost: CommunityContextValue["updatePost"] = (postId, patch) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              title: patch.title.trim(),
              personalTake: patch.personalTake.trim(),
              discussionPrompt:
                patch.discussionPrompt !== undefined
                  ? patch.discussionPrompt.trim() || undefined
                  : p.discussionPrompt,
              editedAt: now,
            }
          : p
      ),
    }));
  };

  const deletePost = (postId: string) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.filter((p) => p.id !== postId),
      comments: prev.comments.filter((c) => c.postId !== postId),
      saves: prev.saves.filter((s) => s.postId !== postId),
    }));
  };

  const adminRemovePost = (postId: string) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) => (p.id === postId ? { ...p, removed: true } : p)),
    }));
  };

  const reportPost = (postId: string, reason: string) => {
    const user = currentUser ?? DEMO_USERS.maya;
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              reports: [
                ...p.reports,
                {
                  id: `rep-${Date.now()}`,
                  reporterName: user.name,
                  reason,
                  createdAt: now,
                },
              ],
            }
          : p
      ),
    }));
  };

  const togglePostReaction = (postId: string, kind: "thumbsUp" | "heart") => {
    if (!currentUser) return;
    const uid = currentUser.id;
    // Per PRD: reactions are visible without creating individual notifications
    setState((prev) => {
      const next = recordFirstParticipation(prev);
      return {
        ...next,
        posts: next.posts.map((p) => {
          if (p.id !== postId) return p;
          const list = p.reactions[kind];
          const exists = list.includes(uid);
          return {
            ...p,
            reactions: {
              ...p.reactions,
              [kind]: exists ? list.filter((id) => id !== uid) : [...list, uid],
            },
          };
        }),
      };
    });
  };

  const isPostSaved = (postId: string) =>
    state.saves.some((entry) => entry.postId === postId);

  const toggleSavePost = (postId: string) => {
    const post = state.posts.find((p) => p.id === postId);
    if (!post) return;
    setState((prev) => {
      const next = recordFirstParticipation(prev);
      const exists = next.saves.some((s) => s.postId === postId);
      return {
        ...next,
        saves: exists
          ? next.saves.filter((s) => s.postId !== postId)
          : [
              {
                postId,
                savedAt: new Date().toISOString(),
                discoveredViaName: post.authorName,
                discoveredViaHandle: post.authorHandle,
              },
              ...next.saves,
            ],
      };
    });
  };

  const addPerspective = (postId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const now = new Date().toISOString();
    const post = state.posts.find((p) => p.id === postId);
    setState((prev) => {
      const next = recordFirstParticipation(prev);
      const nextNotifications = [...next.notifications];
      if (post && post.authorId !== currentUser.id) {
        nextNotifications.unshift({
          id: `notif-${Date.now()}`,
          type: "perspective",
          actorName: currentUser.name,
          postId,
          postTitle: post.title,
          snippet: `Added a perspective: "${text.trim().slice(0, 64)}"`,
          createdAt: now,
          read: false,
        });
      }
      return {
        ...next,
        notifications: nextNotifications,
        posts: next.posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                lastActivityAt: now,
                perspectives: [
                  ...p.perspectives,
                  {
                    id: `persp-${Date.now()}`,
                    authorId: currentUser.id,
                    authorName: currentUser.name,
                    authorTone: currentUser.tone,
                    text: text.trim(),
                    createdAt: now,
                  },
                ],
              }
            : p
        ),
      };
    });
  };

  const addVisualPin = (
    postId: string,
    x: number,
    y: number,
    label: string,
    commentText: string
  ) => {
    if (!currentUser || !commentText.trim()) return;
    const now = new Date().toISOString();
    const pinId = `pin-${Date.now()}`;
    const post = state.posts.find((p) => p.id === postId);
    const pinNumber = (post?.visualPins.length ?? 0) + 1;
    const cleanLabel = label.trim() || `Detail spot #${pinNumber}`;

    setState((prev) => {
      const next = recordFirstParticipation(prev);
      const newComment: CommentItem = {
        id: `cmt-${Date.now()}`,
        postId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorTone: currentUser.tone,
        text: commentText.trim(),
        createdAt: now,
        anchorType: "visual",
        anchorId: pinId,
        anchorLabel: `Visual pin #${pinNumber} · ${cleanLabel}`,
        reactions: { thumbsUp: [], heart: [] },
      };

      const nextNotifications = [...next.notifications];
      if (post && post.authorId !== currentUser.id) {
        nextNotifications.unshift({
          id: `notif-${Date.now()}`,
          type: "reply",
          actorName: currentUser.name,
          postId,
          postTitle: post.title,
          snippet: `Pinned a note on '${cleanLabel}'`,
          createdAt: now,
          read: false,
        });
      }

      return {
        ...next,
        posts: next.posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                lastActivityAt: now,
                visualPins: [...p.visualPins, { id: pinId, x, y, label: cleanLabel }],
              }
            : p
        ),
        comments: [...next.comments, newComment],
        notifications: nextNotifications,
      };
    });
  };

  const addComment: CommunityContextValue["addComment"] = ({
    postId,
    text,
    parentId,
    anchorType,
    anchorId,
    anchorLabel,
  }) => {
    if (!currentUser || !text.trim()) return;
    const now = new Date().toISOString();
    const post = state.posts.find((p) => p.id === postId);

    setState((prev) => {
      const next = recordFirstParticipation(prev);
      const newComment: CommentItem = {
        id: `cmt-${Date.now()}`,
        postId,
        parentId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorTone: currentUser.tone,
        text: text.trim(),
        createdAt: now,
        anchorType,
        anchorId,
        anchorLabel,
        reactions: { thumbsUp: [], heart: [] },
      };

      const nextNotifications = [...next.notifications];
      if (post && post.authorId !== currentUser.id) {
        nextNotifications.unshift({
          id: `notif-${Date.now()}`,
          type: "reply",
          actorName: currentUser.name,
          postId,
          postTitle: post.title,
          snippet: text.trim().slice(0, 72),
          createdAt: now,
          read: false,
        });
      }

      return {
        ...next,
        posts: next.posts.map((p) =>
          p.id === postId ? { ...p, lastActivityAt: now } : p
        ),
        comments: [...next.comments, newComment],
        notifications: nextNotifications,
      };
    });
  };

  const updateComment = (commentId: string, text: string) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      comments: prev.comments.map((c) =>
        c.id === commentId ? { ...c, text: text.trim(), editedAt: now } : c
      ),
    }));
  };

  const deleteComment = (commentId: string) => {
    setState((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c.id !== commentId && c.parentId !== commentId),
    }));
  };

  const toggleCommentReaction = (commentId: string, kind: "thumbsUp" | "heart") => {
    if (!currentUser) return;
    const uid = currentUser.id;
    setState((prev) => {
      const next = recordFirstParticipation(prev);
      return {
        ...next,
        comments: next.comments.map((c) => {
          if (c.id !== commentId) return c;
          const list = c.reactions[kind];
          const exists = list.includes(uid);
          return {
            ...c,
            reactions: {
              ...c.reactions,
              [kind]: exists ? list.filter((id) => id !== uid) : [...list, uid],
            },
          };
        }),
      };
    });
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const unreadNotificationCount = state.notifications.filter((n) => !n.read).length;

  return (
    <CommunityContext.Provider
      value={{
        role: state.role,
        currentUser,
        posts: state.posts,
        comments: state.comments,
        saves: state.saves,
        notifications: state.notifications,
        pinnedPrompt: INITIAL_PINNED_PROMPT,
        analytics: state.analytics,
        gateModalOpen,
        gateReason,
        openGateModal,
        closeGateModal,
        requireMemberAction,
        setRole,
        completeOnboarding,
        resetPrototype,
        createPost,
        updatePost,
        deletePost,
        adminRemovePost,
        reportPost,
        togglePostReaction,
        toggleSavePost,
        isPostSaved,
        addPerspective,
        addVisualPin,
        addComment,
        updateComment,
        deleteComment,
        toggleCommentReaction,
        markAllNotificationsRead,
        unreadNotificationCount,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
}
