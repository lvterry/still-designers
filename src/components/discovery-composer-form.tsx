"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Globe,
  Image as ImageIcon,
  Link2,
  Loader2,
  Play,
  Quote,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useCommunity, type CreatePostInput } from "@/context/community-context";
import { cn } from "@/lib/cn";
import {
  deriveFilenameSuggestion,
  detectLinkFallback,
  extractHost,
  isEmbeddablePageUrl,
  isGifUrl,
  normalizeUrl,
  type LinkPreviewMetadata,
} from "@/lib/link-utils";
import type {
  CardTone,
  DiscoveryKind,
  DiscoveryMedia,
} from "@/types/community";

type ComposerContentType = "quote" | "image" | "video" | "link";
type MediaSourceMode = "upload" | "link";

const TONES: CardTone[] = ["coral", "cobalt", "sun", "emerald", "pink", "sky"];

const CONTENT_TYPES: {
  value: ComposerContentType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "quote", label: "Quote", icon: Quote },
  { value: "image", label: "Image / GIF", icon: ImageIcon },
  { value: "video", label: "Video", icon: Video },
  { value: "link", label: "Link", icon: Link2 },
];

const IMAGE_UPLOAD_MAX_DATA_URL_BYTES = 2 * 1024 * 1024;

interface UploadedMediaState {
  url: string;
  isBlob: boolean;
  fileName: string;
  isGif: boolean;
  posterUrl?: string;
  durationSeconds?: number;
}

function captureVideoPoster(videoEl: HTMLVideoElement): string | undefined {
  try {
    const width = videoEl.videoWidth;
    const height = videoEl.videoHeight;
    if (!width || !height) return undefined;

    const maxWidth = 640;
    const scale = width > maxWidth ? maxWidth / width : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.75);
  } catch {
    return undefined;
  }
}

export interface DiscoveryComposerFormProps {
  open: boolean;
  defaultTone?: CardTone;
  defaultPromptId?: string;
  showWeeklyPromptOption?: boolean;
  autoFocusContent?: boolean;
  submitLabel: string;
  topSlot?: React.ReactNode;
  footerHint?: string;
  onCancel?: () => void;
  onToneChange?: (tone: CardTone) => void;
  onSubmitDiscovery: (input: CreatePostInput) => void;
}

/**
 * Shared 4-format discovery composer form used by both regular posting and onboarding.
 */
export function DiscoveryComposerForm({
  open,
  defaultTone = "coral",
  defaultPromptId,
  showWeeklyPromptOption = false,
  autoFocusContent = true,
  submitLabel,
  topSlot,
  footerHint,
  onCancel,
  onToneChange,
  onSubmitDiscovery,
}: DiscoveryComposerFormProps) {
  const { pinnedPrompt } = useCommunity();

  const [contentType, setContentType] = useState<ComposerContentType>("quote");

  // Quote fields
  const [quoteText, setQuoteText] = useState("");

  // Image / GIF fields
  const [imageSourceMode, setImageSourceMode] = useState<MediaSourceMode>("upload");
  const [uploadedImage, setUploadedImage] = useState<UploadedMediaState | null>(null);
  const [imageLinkUrl, setImageLinkUrl] = useState("");
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [imageDragging, setImageDragging] = useState(false);

  // Video fields
  const [videoSourceMode, setVideoSourceMode] = useState<MediaSourceMode>("upload");
  const [uploadedVideo, setUploadedVideo] = useState<UploadedMediaState | null>(null);
  const [videoLinkUrl, setVideoLinkUrl] = useState("");
  const [videoLinkDuration, setVideoLinkDuration] = useState<number | undefined>(undefined);
  const [videoPreviewError, setVideoPreviewError] = useState(false);
  const [videoDragging, setVideoDragging] = useState(false);

  // Link fields
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPreview, setLinkPreview] = useState<LinkPreviewMetadata | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  // Shared fields
  const [author, setAuthor] = useState("");
  const [authorTouched, setAuthorTouched] = useState(false);
  const [optionalSourceUrl, setOptionalSourceUrl] = useState("");
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [titleDerivedFromLink, setTitleDerivedFromLink] = useState(false);
  const [personalTake, setPersonalTake] = useState("");
  const [tone, setTone] = useState<CardTone>(defaultTone);
  const [attachToWeeklyPrompt, setAttachToWeeklyPrompt] = useState(false);
  const [error, setError] = useState("");

  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
  const createdBlobUrlsRef = useRef<Set<string>>(new Set());

  const revokeBlobUrl = useCallback((url?: string | null) => {
    if (!url || !url.startsWith("blob:")) return;
    if (createdBlobUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      createdBlobUrlsRef.current.delete(url);
    }
  }, []);

  const revokeAllUncommittedBlobs = useCallback(() => {
    for (const url of createdBlobUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    createdBlobUrlsRef.current.clear();
  }, []);

  // Reset form when modal opens; clean up uncommitted blob URLs when closing or unmounting
  useEffect(() => {
    if (!open) {
      revokeAllUncommittedBlobs();
      return;
    }

    setContentType("quote");
    setQuoteText("");
    setImageSourceMode("upload");
    setUploadedImage(null);
    setImageLinkUrl("");
    setImagePreviewError(false);
    setImageDragging(false);
    setVideoSourceMode("upload");
    setUploadedVideo(null);
    setVideoLinkUrl("");
    setVideoLinkDuration(undefined);
    setVideoPreviewError(false);
    setVideoDragging(false);
    setLinkUrl("");
    setLinkPreview(null);
    setLinkLoading(false);
    setAuthor("");
    setAuthorTouched(false);
    setOptionalSourceUrl("");
    setTitle("");
    setTitleTouched(false);
    setTitleDerivedFromLink(false);
    setPersonalTake("");
    setTone(defaultTone);
    onToneChange?.(defaultTone);
    setAttachToWeeklyPrompt(Boolean(defaultPromptId));
    setError("");
  }, [open, defaultTone, defaultPromptId, onToneChange, revokeAllUncommittedBlobs]);

  useEffect(() => {
    return () => {
      revokeAllUncommittedBlobs();
    };
  }, [revokeAllUncommittedBlobs]);

  const normalizedLinkUrl = useMemo(() => normalizeUrl(linkUrl), [linkUrl]);
  const linkFallback = useMemo(
    () => (normalizedLinkUrl ? detectLinkFallback(normalizedLinkUrl) : null),
    [normalizedLinkUrl]
  );

  // Fetch metadata for Link content type
  useEffect(() => {
    if (!open || contentType !== "link" || !normalizedLinkUrl) {
      setLinkLoading(false);
      if (!normalizedLinkUrl) setLinkPreview(null);
      return;
    }

    const fallback = detectLinkFallback(normalizedLinkUrl);
    setLinkPreview(fallback);

    if (fallback?.author && !authorTouched) {
      setAuthor(fallback.author);
    }

    const controller = new AbortController();
    setLinkLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/link-preview?url=${encodeURIComponent(normalizedLinkUrl)}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          setLinkLoading(false);
          return;
        }
        const data = (await res.json()) as LinkPreviewMetadata;
        if (controller.signal.aborted) return;

        setLinkPreview(data);
        if (data.author && !authorTouched) {
          setAuthor(data.author);
        }
        if (data.title && !titleTouched) {
          setTitle(data.title);
          setTitleDerivedFromLink(true);
        }
      } catch {
        // Fallback already applied; ignore abort/network error
      } finally {
        if (!controller.signal.aborted) {
          setLinkLoading(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, contentType, normalizedLinkUrl, authorTouched, titleTouched]);

  const handleSelectContentType = (next: ComposerContentType) => {
    setContentType(next);
    if (error) setError("");
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image or GIF file (PNG, JPG, WebP, GIF).");
      return;
    }
    setError("");
    const isGif = file.type === "image/gif" || /\.gif$/i.test(file.name);

    if (file.size <= IMAGE_UPLOAD_MAX_DATA_URL_BYTES) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        if (!result) return;
        setUploadedImage((prev) => {
          revokeBlobUrl(prev?.url);
          return {
            url: result,
            isBlob: false,
            fileName: file.name,
            isGif,
          };
        });
      };
      reader.readAsDataURL(file);
    } else {
      const objectUrl = URL.createObjectURL(file);
      createdBlobUrlsRef.current.add(objectUrl);
      setUploadedImage((prev) => {
        revokeBlobUrl(prev?.url);
        return {
          url: objectUrl,
          isBlob: true,
          fileName: file.name,
          isGif,
        };
      });
    }
  };

  const handleVideoFile = (file: File) => {
    const looksLikeVideo =
      file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name);
    if (!looksLikeVideo) {
      setError("Please choose a video file (MP4, WebM, or MOV).");
      return;
    }
    setError("");
    const objectUrl = URL.createObjectURL(file);
    createdBlobUrlsRef.current.add(objectUrl);
    setUploadedVideo((prev) => {
      revokeBlobUrl(prev?.url);
      return {
        url: objectUrl,
        isBlob: true,
        fileName: file.name,
        isGif: false,
      };
    });
  };

  const normalizedImageLinkUrl = useMemo(
    () => normalizeUrl(imageLinkUrl),
    [imageLinkUrl]
  );
  const normalizedVideoLinkUrl = useMemo(
    () => normalizeUrl(videoLinkUrl),
    [videoLinkUrl]
  );
  const videoLinkIsEmbeddablePage = useMemo(
    () => isEmbeddablePageUrl(videoLinkUrl),
    [videoLinkUrl]
  );

  const activeFileSuggestion = useMemo(() => {
    if (contentType === "image" && imageSourceMode === "upload" && uploadedImage) {
      return deriveFilenameSuggestion(uploadedImage.fileName);
    }
    if (contentType === "video" && videoSourceMode === "upload" && uploadedVideo) {
      return deriveFilenameSuggestion(uploadedVideo.fileName);
    }
    return null;
  }, [contentType, imageSourceMode, uploadedImage, videoSourceMode, uploadedVideo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedAuthor = author.trim();
    const trimmedTake = personalTake.trim();
    const trimmedTitle = title.trim();

    if (contentType === "quote" && !quoteText.trim()) {
      setError("Paste or write the quoted text first.");
      return;
    }

    if (contentType === "image") {
      if (imageSourceMode === "upload" && !uploadedImage?.url) {
        setError("Upload an image or GIF file, or switch to Paste link.");
        return;
      }
      if (imageSourceMode === "link" && !normalizedImageLinkUrl) {
        setError("Paste a valid image or GIF URL.");
        return;
      }
    }

    if (contentType === "video") {
      if (videoSourceMode === "upload" && !uploadedVideo?.url) {
        setError("Upload a video file, or switch to Paste link.");
        return;
      }
      if (videoSourceMode === "link" && !normalizedVideoLinkUrl) {
        setError("Paste a valid video file URL.");
        return;
      }
    }

    if (contentType === "link" && !normalizedLinkUrl) {
      setError("Paste a valid link to a tweet, YouTube video, or webpage.");
      return;
    }

    if (contentType !== "link" && optionalSourceUrl.trim()) {
      if (!normalizeUrl(optionalSourceUrl)) {
        setError("Please enter a valid source URL or leave it blank.");
        return;
      }
    }

    if (!trimmedAuthor) {
      setError("Add the original author or creator for credit.");
      return;
    }

    if (!trimmedTake) {
      setError("Tell everyone what inspired you about this piece.");
      return;
    }

    let kind: DiscoveryKind = "website";
    let media: DiscoveryMedia;
    let resolvedSourceUrl = "";
    let resolvedSourceName = "";

    if (contentType === "quote") {
      const normalizedOptional = optionalSourceUrl.trim()
        ? normalizeUrl(optionalSourceUrl) ?? ""
        : "";
      const host = normalizedOptional ? extractHost(normalizedOptional) : "";

      kind = "article";
      resolvedSourceUrl = normalizedOptional;
      resolvedSourceName = host;
      media = {
        type: "quote",
        quoteText: quoteText.trim(),
        quoteAuthor: trimmedAuthor,
        quoteSource: host || undefined,
      };
    } else if (contentType === "image") {
      const normalizedOptional = optionalSourceUrl.trim()
        ? normalizeUrl(optionalSourceUrl) ?? ""
        : "";
      const host = normalizedOptional ? extractHost(normalizedOptional) : "";
      const url =
        imageSourceMode === "upload"
          ? uploadedImage!.url
          : normalizedImageLinkUrl!;
      const isGif =
        imageSourceMode === "upload"
          ? uploadedImage!.isGif
          : isGifUrl(url);

      if (imageSourceMode === "upload" && uploadedImage?.isBlob) {
        createdBlobUrlsRef.current.delete(uploadedImage.url);
      }

      kind = "image";
      resolvedSourceUrl = normalizedOptional;
      resolvedSourceName = host;
      media = isGif
        ? {
            type: "gif",
            url,
            posterUrl: url,
            alt: trimmedTitle || `GIF by ${trimmedAuthor}`,
          }
        : {
            type: "image",
            url,
            alt: trimmedTitle || `Image by ${trimmedAuthor}`,
          };
    } else if (contentType === "video") {
      const normalizedOptional = optionalSourceUrl.trim()
        ? normalizeUrl(optionalSourceUrl) ?? ""
        : "";
      const host = normalizedOptional ? extractHost(normalizedOptional) : "";
      const url =
        videoSourceMode === "upload"
          ? uploadedVideo!.url
          : normalizedVideoLinkUrl!;
      const posterUrl =
        videoSourceMode === "upload" ? uploadedVideo?.posterUrl : undefined;
      const durationSeconds =
        videoSourceMode === "upload"
          ? uploadedVideo?.durationSeconds
          : videoLinkDuration;

      if (videoSourceMode === "upload" && uploadedVideo?.isBlob) {
        createdBlobUrlsRef.current.delete(uploadedVideo.url);
      }

      kind = "video";
      resolvedSourceUrl = normalizedOptional;
      resolvedSourceName = host;
      media = {
        type: "video",
        url,
        posterUrl: posterUrl || undefined,
        alt: trimmedTitle || `Video by ${trimmedAuthor}`,
        durationSeconds,
        hasAudio: true,
      };
    } else {
      const activePreview = linkPreview ?? linkFallback!;
      kind = activePreview.kind;
      resolvedSourceUrl = activePreview.url;
      resolvedSourceName = activePreview.host;
      media = {
        type: "link",
        url: activePreview.url,
        host: activePreview.host,
        embedType: activePreview.embedType,
        youtubeId: activePreview.youtubeId,
        thumbnailUrl: activePreview.thumbnailUrl,
        previewTitle: activePreview.title,
        previewDescription: activePreview.description,
        tweetText: activePreview.tweetText,
        tweetAuthor: activePreview.tweetAuthor,
      };
    }

    onSubmitDiscovery({
      title: trimmedTitle,
      kind,
      tone,
      media,
      originalCreator: trimmedAuthor,
      sourceName: resolvedSourceName,
      sourceUrl: resolvedSourceUrl,
      personalTake: trimmedTake,
      promptId:
        showWeeklyPromptOption && attachToWeeklyPrompt
          ? pinnedPrompt.id
          : undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 space-y-5 overflow-y-auto px-7 py-6"
    >
      {topSlot}

      {/* 4-way content type selector */}
      <div>
        <span className="block text-[14px] font-bold text-ink">
          What are you sharing?
        </span>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CONTENT_TYPES.map((item) => {
            const Icon = item.icon;
            const active = contentType === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleSelectContentType(item.value)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl border-2 px-2.5 py-2.5 text-[13.5px] font-bold transition-colors",
                  active
                    ? "border-cobalt bg-subtle-surface text-ink"
                    : "border-line bg-canvas text-ink-secondary hover:border-line-strong hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Quote inputs */}
      {contentType === "quote" && (
        <label className="block">
          <span className="block text-[14px] font-bold text-ink">
            Quote
          </span>
          <textarea
            rows={3}
            value={quoteText}
            onChange={(e) => {
              setQuoteText(e.target.value);
              if (error) setError("");
            }}
            placeholder="Paste or type the exact quote you want highlighted..."
            autoFocus={autoFocusContent}
            className="mt-1.5 w-full resize-none rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] leading-relaxed text-ink transition-colors focus:border-cobalt focus:outline-none"
          />
        </label>
      )}

      {/* 2. Image / GIF inputs */}
      {contentType === "image" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-bold text-ink">
              Image or GIF
            </span>
            <div className="inline-flex rounded-xl border border-line bg-canvas p-0.5 text-[12.5px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setImageSourceMode("upload");
                  if (error) setError("");
                }}
                className={cn(
                  "rounded-lg px-2.5 py-1 transition-colors",
                  imageSourceMode === "upload"
                    ? "bg-elevated text-ink shadow-xs"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageSourceMode("link");
                  if (error) setError("");
                }}
                className={cn(
                  "rounded-lg px-2.5 py-1 transition-colors",
                  imageSourceMode === "link"
                    ? "bg-elevated text-ink shadow-xs"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                Paste link
              </button>
            </div>
          </div>

          {imageSourceMode === "upload" ? (
            <>
              <input
                ref={imageFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                  e.target.value = "";
                }}
              />

              {uploadedImage ? (
                <div className="space-y-2">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border-2 border-line bg-muted-surface">
                    <img
                      src={uploadedImage.url}
                      alt={uploadedImage.fileName}
                      className="h-full w-full object-cover"
                    />
                    {uploadedImage.isGif && (
                      <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-lg bg-ink/75 px-2 py-0.5 text-[11px] font-extrabold tracking-[0.06em] text-ink-on-bold backdrop-blur-xs">
                        GIF
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[13px]">
                    <span className="truncate font-medium text-ink-secondary">
                      {uploadedImage.fileName}
                    </span>
                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => imageFileInputRef.current?.click()}
                        className="font-bold text-cobalt hover:underline"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          revokeBlobUrl(uploadedImage.url);
                          setUploadedImage(null);
                        }}
                        className="inline-flex items-center gap-1 font-bold text-danger hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setImageDragging(true);
                  }}
                  onDragLeave={() => setImageDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setImageDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageFile(file);
                  }}
                  className={cn(
                    "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-colors",
                    imageDragging
                      ? "border-cobalt bg-subtle-surface"
                      : "border-line-strong bg-canvas hover:border-cobalt hover:bg-subtle-surface/60"
                  )}
                >
                  <Upload className="h-6 w-6 text-cobalt" />
                  <span className="text-[14px] font-bold text-ink">
                    Click to upload or drop an image / GIF
                  </span>
                  <span className="text-[12.5px] text-ink-muted">
                    PNG, JPG, WebP, or GIF
                  </span>
                </button>
              )}
            </>
          ) : (
            <div className="space-y-2.5">
              <div className="relative">
                <Link2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  value={imageLinkUrl}
                  onChange={(e) => {
                    setImageLinkUrl(e.target.value);
                    setImagePreviewError(false);
                    if (error) setError("");
                  }}
                  placeholder="https://example.com/poster.png or .gif"
                  className="w-full rounded-2xl border-2 border-line bg-canvas py-2.5 pr-4 pl-10 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                />
              </div>

              {normalizedImageLinkUrl && (
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border-2 border-line bg-muted-surface">
                  {imagePreviewError ? (
                    <div className="flex h-full items-center justify-center px-4 text-center text-[13px] font-medium text-ink-muted">
                      Preview unavailable — double check that the link points directly to an image or GIF.
                    </div>
                  ) : (
                    <>
                      <img
                        src={normalizedImageLinkUrl}
                        alt="Image preview"
                        onError={() => setImagePreviewError(true)}
                        className="h-full w-full object-cover"
                      />
                      {isGifUrl(normalizedImageLinkUrl) && (
                        <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-lg bg-ink/75 px-2 py-0.5 text-[11px] font-extrabold tracking-[0.06em] text-ink-on-bold backdrop-blur-xs">
                          GIF
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Video inputs */}
      {contentType === "video" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-bold text-ink">
              Video
            </span>
            <div className="inline-flex rounded-xl border border-line bg-canvas p-0.5 text-[12.5px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setVideoSourceMode("upload");
                  if (error) setError("");
                }}
                className={cn(
                  "rounded-lg px-2.5 py-1 transition-colors",
                  videoSourceMode === "upload"
                    ? "bg-elevated text-ink shadow-xs"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                Upload video
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideoSourceMode("link");
                  if (error) setError("");
                }}
                className={cn(
                  "rounded-lg px-2.5 py-1 transition-colors",
                  videoSourceMode === "link"
                    ? "bg-elevated text-ink shadow-xs"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                Paste link
              </button>
            </div>
          </div>

          {videoSourceMode === "upload" ? (
            <>
              <input
                ref={videoFileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleVideoFile(file);
                  e.target.value = "";
                }}
              />

              {uploadedVideo ? (
                <div className="space-y-2">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border-2 border-line bg-muted-surface">
                    <video
                      src={uploadedVideo.url}
                      controls
                      muted
                      playsInline
                      onLoadedMetadata={(e) => {
                        const dur = e.currentTarget.duration;
                        if (Number.isFinite(dur) && dur > 0) {
                          setUploadedVideo((prev) =>
                            prev ? { ...prev, durationSeconds: dur } : prev
                          );
                        }
                      }}
                      onLoadedData={(e) => {
                        const el = e.currentTarget;
                        const poster = captureVideoPoster(el);
                        if (poster) {
                          setUploadedVideo((prev) =>
                            prev && !prev.posterUrl
                              ? { ...prev, posterUrl: poster }
                              : prev
                          );
                        }
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[13px]">
                    <span className="truncate font-medium text-ink-secondary">
                      {uploadedVideo.fileName}
                    </span>
                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => videoFileInputRef.current?.click()}
                        className="font-bold text-cobalt hover:underline"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          revokeBlobUrl(uploadedVideo.url);
                          setUploadedVideo(null);
                        }}
                        className="inline-flex items-center gap-1 font-bold text-danger hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => videoFileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setVideoDragging(true);
                  }}
                  onDragLeave={() => setVideoDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setVideoDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleVideoFile(file);
                  }}
                  className={cn(
                    "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-colors",
                    videoDragging
                      ? "border-cobalt bg-subtle-surface"
                      : "border-line-strong bg-canvas hover:border-cobalt hover:bg-subtle-surface/60"
                  )}
                >
                  <Upload className="h-6 w-6 text-cobalt" />
                  <span className="text-[14px] font-bold text-ink">
                    Click to upload or drop a video file
                  </span>
                  <span className="text-[12.5px] text-ink-muted">
                    MP4, WebM, or MOV
                  </span>
                </button>
              )}
            </>
          ) : (
            <div className="space-y-2.5">
              <div className="relative">
                <Link2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  value={videoLinkUrl}
                  onChange={(e) => {
                    setVideoLinkUrl(e.target.value);
                    setVideoLinkDuration(undefined);
                    setVideoPreviewError(false);
                    if (error) setError("");
                  }}
                  placeholder="https://example.com/clip.mp4 or .webm"
                  className="w-full rounded-2xl border-2 border-line bg-canvas py-2.5 pr-4 pl-10 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                />
              </div>

              {videoLinkIsEmbeddablePage && normalizedVideoLinkUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setLinkUrl(normalizedVideoLinkUrl);
                    setContentType("link");
                    setError("");
                  }}
                  className="w-full rounded-2xl border-2 border-cobalt/40 bg-subtle-surface px-3.5 py-2 text-left text-[13px] font-bold text-cobalt transition-colors hover:border-cobalt"
                >
                  That looks like a webpage or YouTube link — switch to Link tab →
                </button>
              )}

              {normalizedVideoLinkUrl && !videoLinkIsEmbeddablePage && (
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border-2 border-line bg-muted-surface">
                  {videoPreviewError ? (
                    <div className="flex h-full items-center justify-center px-4 text-center text-[13px] font-medium text-ink-muted">
                      Video preview unavailable — make sure the URL links directly to an MP4 or WebM file.
                    </div>
                  ) : (
                    <video
                      src={normalizedVideoLinkUrl}
                      controls
                      muted
                      playsInline
                      onLoadedMetadata={(e) => {
                        const dur = e.currentTarget.duration;
                        if (Number.isFinite(dur) && dur > 0) {
                          setVideoLinkDuration(dur);
                        }
                      }}
                      onError={() => setVideoPreviewError(true)}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Link input + inline metadata preview */}
      {contentType === "link" && (
        <div className="space-y-3">
          <label className="block">
            <span className="block text-[14px] font-bold text-ink">
              Link
            </span>
            <div className="relative mt-1.5">
              <Link2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => {
                  setLinkUrl(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Paste a link to a tweet, YouTube video, or webpage"
                autoFocus={autoFocusContent}
                className="w-full rounded-2xl border-2 border-line bg-canvas py-2.5 pr-10 pl-10 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
              />
              {linkLoading && (
                <Loader2 className="absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 animate-spin text-cobalt" />
              )}
            </div>
            <p className="mt-1.5 text-[12.5px] text-ink-muted">
              Source links directly to this URL.
            </p>
          </label>

          {linkPreview && (
            <div className="overflow-hidden rounded-2xl border-2 border-line bg-canvas">
              {linkPreview.embedType === "youtube" && linkPreview.thumbnailUrl && (
                <div className="relative aspect-[16/9] w-full bg-muted-surface">
                  <img
                    src={linkPreview.thumbnailUrl}
                    alt={linkPreview.title || "YouTube video thumbnail"}
                    className="h-full w-full object-cover"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/75 text-ink-on-bold backdrop-blur-xs">
                      <Play className="ml-0.5 h-4 w-4 fill-current" />
                    </span>
                  </span>
                  <span className="pointer-events-none absolute bottom-2 left-2 rounded-lg bg-ink/75 px-2 py-0.5 text-[11px] font-extrabold text-ink-on-bold backdrop-blur-xs">
                    YouTube
                  </span>
                </div>
              )}

              {linkPreview.embedType !== "youtube" && linkPreview.thumbnailUrl && (
                <div className="aspect-[16/9] w-full overflow-hidden bg-muted-surface">
                  <img
                    src={linkPreview.thumbnailUrl}
                    alt={linkPreview.title || linkPreview.host}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-1 px-4 py-3">
                <div className="flex items-center justify-between gap-2 text-[12px] font-bold text-ink-muted">
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Globe className="h-3.5 w-3.5 shrink-0 text-cobalt" />
                    {linkPreview.host}
                  </span>
                  {linkLoading && (
                    <span className="text-cobalt">Fetching details…</span>
                  )}
                </div>

                {linkPreview.tweetText ? (
                  <p className="line-clamp-3 text-[13.5px] leading-snug font-medium text-ink">
                    {linkPreview.tweetText}
                  </p>
                ) : (
                  <>
                    {linkPreview.title && (
                      <p className="line-clamp-2 text-[14px] font-extrabold text-ink">
                        {linkPreview.title}
                      </p>
                    )}
                    {linkPreview.description && (
                      <p className="line-clamp-2 text-[13px] text-ink-secondary">
                        {linkPreview.description}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Author (required for all 4 types) */}
      <label className="block">
        <span className="block text-[14px] font-bold text-ink">
          Author
        </span>
        <input
          type="text"
          value={author}
          onChange={(e) => {
            setAuthor(e.target.value);
            setAuthorTouched(true);
            if (error) setError("");
          }}
          placeholder={
            contentType === "quote"
              ? "Who said or wrote this quote?"
              : contentType === "link"
                ? "Creator, channel, or @handle"
                : "Original creator or maker"
          }
          className="mt-1.5 w-full rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
        />
      </label>

      {/* Optional Source URL (Quote, Image/GIF, Video only) */}
      {contentType !== "link" && (
        <label className="block">
          <span className="block text-[14px] font-bold text-ink">
            Source URL (optional)
          </span>
          <div className="relative mt-1.5">
            <Link2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={optionalSourceUrl}
              onChange={(e) => {
                setOptionalSourceUrl(e.target.value);
                if (error) setError("");
              }}
              placeholder="https://... where others can find the original"
              className="w-full rounded-2xl border-2 border-line bg-canvas py-2.5 pr-4 pl-10 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
            />
          </div>
        </label>
      )}

      {/* Title (optional for all types; auto-derived for Link) */}
      <label className="block">
        <span className="block text-[14px] font-bold text-ink">
          Title (optional)
        </span>
        <div className="relative mt-1.5">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleTouched(true);
              setTitleDerivedFromLink(false);
            }}
            placeholder={
              contentType === "link"
                ? "Auto-derived from link when available — or leave blank"
                : "Leave blank or give this spark a short headline"
            }
            className="w-full rounded-2xl border-2 border-line bg-canvas py-2.5 pr-10 pl-4 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
          />
          {title && (
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setTitleTouched(true);
                setTitleDerivedFromLink(false);
              }}
              aria-label="Clear title"
              className="absolute top-1/2 right-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-subtle-surface hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {contentType === "link" && titleDerivedFromLink && title && (
          <p className="mt-1.5 text-[12.5px] font-medium text-cobalt">
            Derived from link — edit or leave blank.
          </p>
        )}
        {activeFileSuggestion && !title && (
          <button
            type="button"
            onClick={() => {
              setTitle(activeFileSuggestion);
              setTitleTouched(true);
            }}
            className="mt-1.5 text-[12.5px] font-bold text-cobalt hover:underline"
          >
            Use “{activeFileSuggestion}”
          </button>
        )}
      </label>

      {/* Personal take */}
      <label className="block">
        <span className="block text-[14px] font-bold text-ink">
          What inspired you?
        </span>
        <textarea
          rows={3}
          value={personalTake}
          onChange={(e) => {
            setPersonalTake(e.target.value);
            if (error) setError("");
          }}
          placeholder="Share what caught your eye or made you think differently..."
          className="mt-1.5 w-full resize-none rounded-2xl border-2 border-line bg-canvas px-4 py-2.5 text-[15px] leading-relaxed text-ink transition-colors focus:border-cobalt focus:outline-none"
        />
      </label>

      {/* Card color */}
      <div>
        <span className="block text-[14px] font-bold text-ink">
          Card color
        </span>
        <div className="mt-2.5 flex items-center gap-3">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              data-tone={t}
              onClick={() => {
                setTone(t);
                onToneChange?.(t);
              }}
              aria-label={`Choose ${t} color`}
              aria-pressed={tone === t}
              className="h-8 w-8 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: "var(--tone-bg)",
                outline:
                  tone === t ? "3px solid var(--ink-primary)" : "none",
                outlineOffset: tone === t ? "3px" : "0px",
              }}
            />
          ))}
        </div>
      </div>

      {showWeeklyPromptOption && (
        <div className="border-t border-line pt-4 text-[14px]">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={attachToWeeklyPrompt}
              onChange={(e) => setAttachToWeeklyPrompt(e.target.checked)}
              className="mt-1 h-4 w-4 accent-cobalt"
            />
            <span className="text-ink-secondary">
              Link to this week’s prompt: “{pinnedPrompt.title}”
            </span>
          </label>
        </div>
      )}

      {error && (
        <p className="text-[14px] font-semibold text-danger">{error}</p>
      )}

      {footerHint ? (
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-[13px] text-ink-muted">{footerHint}</span>
          <button
            type="submit"
            data-tone="emerald"
            className="toy-button shrink-0 rounded-2xl px-6 py-2.5 text-[15px] font-extrabold"
          >
            {submitLabel}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-3 pt-1">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-[14.5px] font-bold text-ink-secondary hover:text-ink"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            data-tone="emerald"
            className="toy-button rounded-2xl px-6 py-2.5 text-[15px] font-extrabold"
          >
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
