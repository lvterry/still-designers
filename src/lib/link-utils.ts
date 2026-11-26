import type { DiscoveryKind } from "@/types/community";

export type LinkEmbedType = "youtube" | "tweet" | "webpage";

export interface LinkPreviewMetadata {
  url: string;
  host: string;
  kind: DiscoveryKind;
  embedType: LinkEmbedType;
  youtubeId?: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  author?: string;
  tweetText?: string;
  tweetAuthor?: string;
  fetched?: boolean;
}

/**
 * Normalizes a user-supplied URL string, ensuring http/https and a valid domain-like host.
 */
export function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;

  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed);
  if (hasProtocol && !/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  const candidate = hasProtocol ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname || (!hostname.includes(".") && hostname !== "localhost")) {
      return null;
    }
    // Reject trailing-dot or empty label hosts like "foo." or ".foo"
    const labels = hostname.split(".");
    if (labels.some((label) => label.length === 0)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function extractHost(rawOrNormalizedUrl: string): string {
  const normalized = normalizeUrl(rawOrNormalizedUrl) ?? rawOrNormalizedUrl;
  try {
    return new URL(normalized).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function extractYouTubeId(rawUrl: string): string | null {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) return null;

  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const parts = parsed.pathname.split("/").filter(Boolean);

    if (host === "youtu.be" && parts[0]) {
      return /^[a-zA-Z0-9_-]{6,20}$/.test(parts[0]) ? parts[0] : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (parts[0] === "watch" || parsed.pathname === "/watch") {
        const v = parsed.searchParams.get("v");
        return v && /^[a-zA-Z0-9_-]{6,20}$/.test(v) ? v : null;
      }
      if ((parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") && parts[1]) {
        return /^[a-zA-Z0-9_-]{6,20}$/.test(parts[1]) ? parts[1] : null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

const RESERVED_X_SEGMENTS = new Set([
  "i",
  "intent",
  "home",
  "search",
  "explore",
  "notifications",
  "messages",
  "settings",
  "compose",
  "hashtag",
  "share",
]);

export function extractTweetHandle(rawUrl: string): string | null {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) return null;

  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "x.com" && host !== "twitter.com" && host !== "mobile.twitter.com") {
      return null;
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 3 && parts[1] === "status" && !RESERVED_X_SEGMENTS.has(parts[0].toLowerCase())) {
      return `@${parts[0].replace(/^@/, "")}`;
    }
    if (parts.length >= 1 && !RESERVED_X_SEGMENTS.has(parts[0].toLowerCase())) {
      return `@${parts[0].replace(/^@/, "")}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function isTweetUrl(rawUrl: string): boolean {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) return false;
  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    return host === "x.com" || host === "twitter.com" || host === "mobile.twitter.com";
  } catch {
    return false;
  }
}

export function isGifUrl(rawUrl: string): boolean {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) return /\.gif(\?.*)?$/i.test(rawUrl.trim());
  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    return (
      /\.gif$/i.test(parsed.pathname) ||
      host.includes("giphy.com") ||
      host.includes("tenor.com")
    );
  } catch {
    return /\.gif(\?.*)?$/i.test(rawUrl.trim());
  }
}

export function isEmbeddablePageUrl(rawUrl: string): boolean {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) return false;
  if (extractYouTubeId(normalized)) return true;
  if (isTweetUrl(normalized)) return true;

  try {
    const host = new URL(normalized).hostname.replace(/^www\./, "").toLowerCase();
    return (
      host.includes("youtube.com") ||
      host === "youtu.be" ||
      host.includes("vimeo.com") ||
      host.includes("loom.com")
    );
  } catch {
    return false;
  }
}

export function detectLinkFallback(rawUrl: string): LinkPreviewMetadata | null {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) return null;

  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, "");
    const lower = `${host}${path}`.toLowerCase();

    const youtubeId = extractYouTubeId(normalized);
    if (youtubeId) {
      return {
        url: normalized,
        host,
        kind: "video",
        embedType: "youtube",
        youtubeId,
        thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
      };
    }

    if (isTweetUrl(normalized)) {
      const handle = extractTweetHandle(normalized) ?? undefined;
      return {
        url: normalized,
        host,
        kind: "article",
        embedType: "tweet",
        author: handle,
        tweetAuthor: handle,
      };
    }

    let kind: DiscoveryKind = "website";
    if (
      host.includes("substack.com") ||
      host.includes("medium.com") ||
      host.includes("mirror.xyz") ||
      lower.includes("/blog") ||
      lower.includes("/article") ||
      lower.includes("/notes") ||
      lower.includes("/essay")
    ) {
      kind = "article";
    } else if (
      host.includes("dribbble.com") ||
      host.includes("behance.net") ||
      host.includes("are.na") ||
      host.includes("cosmos.so") ||
      host.includes("figma.com")
    ) {
      kind = "image";
    } else if (
      host.endsWith(".design") ||
      host.endsWith(".studio") ||
      host.includes("read.cv") ||
      host.includes("layers.to")
    ) {
      kind = "designer";
    } else if (
      host.includes("vimeo.com") ||
      host.includes("loom.com") ||
      host.includes("youtube.com") ||
      host === "youtu.be"
    ) {
      kind = "video";
    }

    return {
      url: normalized,
      host,
      kind,
      embedType: "webpage",
    };
  } catch {
    return null;
  }
}

const GENERIC_FILENAME_PATTERNS = [
  /^img[-_\s]?\d+/i,
  /^pxl[-_\s]?\d+/i,
  /^dsc[-_\s]?\d+/i,
  /^mvimg[-_\s]?\d+/i,
  /^screenshot/i,
  /^screen[-_\s]?shot/i,
  /^screen[-_\s]?recording/i,
  /^recording[-_\s]?\d*/i,
  /^image([-_\s]?\d+)?$/i,
  /^photo([-_\s]?\d+)?$/i,
  /^video([-_\s]?\d+)?$/i,
  /^clip([-_\s]?\d+)?$/i,
  /^download([-_\s]?\d+)?$/i,
  /^untitled/i,
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  /^[0-9a-f]{16,}$/i,
  /^\d{6,}$/,
];

/**
 * Turns a meaningful filename into a human-friendly title suggestion,
 * or returns null for camera/screenshot/generic names.
 */
export function deriveFilenameSuggestion(filename: string): string | null {
  const withoutExt = filename.replace(/\.[^/.]+$/, "").trim();
  if (!withoutExt) return null;

  if (GENERIC_FILENAME_PATTERNS.some((re) => re.test(withoutExt))) {
    return null;
  }

  const cleaned = withoutExt
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length < 3) return null;
  if (/^\d[\d\s.-]*$/.test(cleaned)) return null;

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
