export type Role = "visitor" | "onboarding" | "member" | "admin";

export type CardTone = "cobalt" | "emerald" | "sun" | "coral" | "pink" | "sky";

export type DiscoveryKind =
  | "website"
  | "article"
  | "image"
  | "video"
  | "designer";

export type MediaType = "quote" | "image" | "gif" | "video" | "link";

export type DiscoveryMedia =
  | {
      type: "quote";
      quoteText: string;
      quoteAuthor: string;
      quoteSource?: string;
    }
  | {
      type: "image";
      url: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "gif";
      url: string;
      posterUrl: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "video";
      url: string;
      posterUrl?: string;
      alt: string;
      durationSeconds?: number;
      hasAudio?: boolean;
      caption?: string;
    }
  | {
      type: "link";
      url: string;
      host: string;
      embedType: "youtube" | "tweet" | "webpage";
      youtubeId?: string;
      thumbnailUrl?: string;
      previewTitle?: string;
      previewDescription?: string;
      tweetText?: string;
      tweetAuthor?: string;
    };

export interface Author {
  id: string;
  name: string;
  handle: string;
  roleTitle: string;
  tone: CardTone;
  initials: string;
}

export interface VisualPin {
  id: string;
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  label: string;
}

export interface ExcerptSegment {
  id: string;
  text: string;
}

export interface Perspective {
  id: string;
  authorId: string;
  authorName: string;
  authorTone: CardTone;
  text: string;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  authorTone: CardTone;
  text: string;
  createdAt: string;
  editedAt?: string;
  anchorType?: "visual" | "excerpt";
  anchorId?: string;
  anchorLabel?: string;
  reactions: {
    thumbsUp: string[]; // userIds
    heart: string[];
  };
}

export interface DiscoveryPost {
  id: string;
  title: string;
  kind: DiscoveryKind;
  tone: CardTone;
  media: DiscoveryMedia;
  restTilt: number; // degrees, e.g. -2.4 to 2.4
  hoverTilt: number; // degrees, shifts playfully on hover
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  authorTone: CardTone;
  createdAt: string;
  lastActivityAt: string;
  editedAt?: string;

  // Attribution & source
  originalCreator: string;
  sourceName: string;
  sourceUrl: string;
  attributionNote: string;

  // Rich content
  excerpts: ExcerptSegment[];
  personalTake: string;
  discussionPrompt?: string;
  visualPins: VisualPin[];

  // Optional weekly prompt link
  promptId?: string;

  // Community interaction
  perspectives: Perspective[];
  reactions: {
    thumbsUp: string[];
    heart: string[];
  };
  reports: {
    id: string;
    reporterName: string;
    reason: string;
    createdAt: string;
  }[];
  removed?: boolean;
}

export interface SavedEntry {
  postId: string;
  savedAt: string;
  discoveredViaName: string;
  discoveredViaHandle: string;
}

export interface NotificationItem {
  id: string;
  type: "reply" | "perspective";
  actorName: string;
  postId: string;
  postTitle: string;
  snippet: string;
  createdAt: string;
  read: boolean;
}

export interface PinnedPrompt {
  id: string;
  title: string;
  description: string;
  durationHint: string;
  tone: CardTone;
}

export interface AnalyticsSignals {
  onboardingCompleted: number;
  firstParticipations: number;
  returnVisits: number;
}
