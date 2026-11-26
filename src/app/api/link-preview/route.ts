import { NextRequest, NextResponse } from "next/server";
import {
  detectLinkFallback,
  extractTweetHandle,
  normalizeUrl,
  type LinkPreviewMetadata,
} from "@/lib/link-utils";

const FETCH_TIMEOUT_MS = 3500;
const MAX_HTML_BYTES = 150_000;

function isPrivateOrBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    lower === "localhost" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal") ||
    lower.endsWith(".localhost")
  ) {
    return true;
  }

  // IPv6 private/link-local ranges
  if (
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("fe80") ||
    lower.startsWith("::ffff:")
  ) {
    return true;
  }

  // IPv4 private / loopback / link-local / CGNAT ranges
  const ipv4Match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(lower);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (
      a === 127 ||
      a === 10 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    ) {
      return true;
    }
  }

  return false;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    });
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function extractMetaTag(html: string, keys: string[]): string | undefined {
  const metaTagRegex = /<meta\s+[^>]*>/gi;
  const attrRegex = /([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;

  let match: RegExpExecArray | null;
  while ((match = metaTagRegex.exec(html)) !== null) {
    const tag = match[0];
    const attrs: Record<string, string> = {};
    let attrMatch: RegExpExecArray | null;
    attrRegex.lastIndex = 0;
    while ((attrMatch = attrRegex.exec(tag)) !== null) {
      const key = attrMatch[1].toLowerCase();
      const val = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";
      attrs[key] = val;
    }

    const identifier = (attrs.property || attrs.name || "").toLowerCase();
    if (keys.includes(identifier) && attrs.content) {
      const decoded = decodeHtmlEntities(attrs.content).trim();
      if (decoded) return decoded;
    }
  }

  return undefined;
}

function extractHtmlTitle(html: string): string | undefined {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!match?.[1]) return undefined;
  const cleaned = decodeHtmlEntities(match[1]).replace(/\s+/g, " ").trim();
  return cleaned || undefined;
}

async function readUpToBytes(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) {
    return (await response.text()).slice(0, maxBytes);
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (total < maxBytes) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      total += value.byteLength;
    }
  } finally {
    await reader.cancel().catch(() => {});
  }

  const combined = new Uint8Array(Math.min(total, maxBytes));
  let offset = 0;
  for (const chunk of chunks) {
    const remaining = combined.length - offset;
    if (remaining <= 0) break;
    const slice = chunk.subarray(0, remaining);
    combined.set(slice, offset);
    offset += slice.length;
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(combined);
}

async function fetchYouTubeOEmbed(
  url: string,
  base: LinkPreviewMetadata,
  signal: AbortSignal
): Promise<LinkPreviewMetadata> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(endpoint, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) return { ...base, fetched: false };

  const data = (await res.json()) as {
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
  };

  return {
    ...base,
    title: data.title?.trim() || base.title,
    author: data.author_name?.trim() || base.author,
    thumbnailUrl: data.thumbnail_url?.trim() || base.thumbnailUrl,
    fetched: true,
  };
}

async function fetchTweetOEmbed(
  url: string,
  base: LinkPreviewMetadata,
  signal: AbortSignal
): Promise<LinkPreviewMetadata> {
  const endpoint = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
  const res = await fetch(endpoint, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) return { ...base, fetched: false };

  const data = (await res.json()) as {
    author_name?: string;
    author_url?: string;
    html?: string;
  };

  let tweetText: string | undefined;
  if (data.html) {
    const pMatch = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(data.html);
    if (pMatch?.[1]) {
      tweetText = stripTags(pMatch[1]) || undefined;
    }
  }

  const handleFromUrl = data.author_url ? extractTweetHandle(data.author_url) : null;
  const tweetAuthor = handleFromUrl || base.tweetAuthor;
  const author = data.author_name?.trim() || tweetAuthor || base.author;

  // Derive a clean short title from tweet text if present (user can edit or clear it)
  const derivedTitle = tweetText
    ? tweetText.length > 84
      ? `${tweetText.slice(0, 81).trimEnd()}…`
      : tweetText
    : undefined;

  return {
    ...base,
    author,
    tweetAuthor,
    tweetText,
    title: derivedTitle,
    fetched: true,
  };
}

async function fetchWebpageMetadata(
  url: string,
  base: LinkPreviewMetadata,
  signal: AbortSignal
): Promise<LinkPreviewMetadata> {
  const res = await fetch(url, {
    signal,
    redirect: "follow",
    headers: {
      Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (compatible; StillDesignersPreview/1.0; +https://stilldesigners.com)",
    },
  });

  if (!res.ok) return { ...base, fetched: false };

  // Guard against redirects into private IP ranges
  if (res.url) {
    try {
      const finalHost = new URL(res.url).hostname;
      if (isPrivateOrBlockedHost(finalHost)) {
        return { ...base, fetched: false };
      }
    } catch {
      return { ...base, fetched: false };
    }
  }

  const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
    return { ...base, fetched: false };
  }

  const html = await readUpToBytes(res, MAX_HTML_BYTES);

  const title =
    extractMetaTag(html, ["og:title", "twitter:title"]) ??
    extractHtmlTitle(html);

  const description = extractMetaTag(html, [
    "og:description",
    "twitter:description",
    "description",
  ]);

  const rawImage = extractMetaTag(html, [
    "og:image",
    "og:image:secure_url",
    "twitter:image",
    "twitter:image:src",
  ]);

  let thumbnailUrl = base.thumbnailUrl;
  if (rawImage) {
    try {
      const resolved = new URL(rawImage, res.url || url);
      if (resolved.protocol === "http:" || resolved.protocol === "https:") {
        thumbnailUrl = resolved.toString();
      }
    } catch {
      // Ignore invalid relative image URLs
    }
  }

  const author =
    extractMetaTag(html, ["author", "article:author", "og:site_name"]) ??
    base.author;

  return {
    ...base,
    title: title || base.title,
    description: description || base.description,
    thumbnailUrl,
    author,
    fetched: true,
  };
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url") ?? "";
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) {
    return NextResponse.json(
      { error: "Please provide a valid http or https URL." },
      { status: 400 }
    );
  }

  const parsed = new URL(normalized);
  if (isPrivateOrBlockedHost(parsed.hostname)) {
    return NextResponse.json(
      { error: "Private or local network URLs cannot be previewed." },
      { status: 400 }
    );
  }

  const fallback = detectLinkFallback(normalized);
  if (!fallback) {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    let result: LinkPreviewMetadata;
    if (fallback.embedType === "youtube") {
      result = await fetchYouTubeOEmbed(normalized, fallback, controller.signal);
    } else if (fallback.embedType === "tweet") {
      result = await fetchTweetOEmbed(normalized, fallback, controller.signal);
    } else {
      result = await fetchWebpageMetadata(normalized, fallback, controller.signal);
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ...fallback, fetched: false });
  } finally {
    clearTimeout(timeout);
  }
}
