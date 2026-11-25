export type Role = "visitor" | "onboarding" | "member" | "admin";

export type CardTone = "cobalt" | "emerald" | "sun" | "coral" | "pink" | "sky";

export type DiscoveryKind =
  | "website"
  | "article"
  | "image"
  | "video"
  | "designer";

export type ArtworkVariant =
  | "bookmark-era"
  | "spatial-type"
  | "ai-bloopers"
  | "cursor-garden"
  | "tactile-knobs"
  | "living-grid"
  | "sound-buttons"
  | "clay-icons"
  | "sketch-to-ui"
  | "micro-doodles"
  | "paper-shader"
  | "mood-trays";

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
  artwork: ArtworkVariant;
  customImageUrl?: string;
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
