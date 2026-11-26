"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoredFileUrl } from "@/hooks/use-stored-file-url.hooks";
import {
  getPreviewFallbackStoredFile,
  type StoredFileVariant,
} from "@/lib/api/file-cache";

export interface StoredFileImageProps {
  contentPath: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  variant?: StoredFileVariant;
  eager?: boolean;
}

export function StoredFileImage({
  contentPath,
  alt,
  className,
  fallbackClassName,
  variant = "full",
  eager = false,
}: StoredFileImageProps) {
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(eager);
  const hasCached = Boolean(contentPath && getPreviewFallbackStoredFile(contentPath, variant));
  const shouldLoad = eager || isVisible || hasCached;

  useEffect(() => {
    if (shouldLoad || !contentPath) return;
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setIsVisible(true));
      return;
    }
    const target = placeholderRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "240px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [contentPath, shouldLoad]);

  const { src, isLoading } = useStoredFileUrl(contentPath, { variant, enabled: shouldLoad });
  const placeholderClass = fallbackClassName ?? className ?? "";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} decoding="async" className={className} />
    );
  }

  if (contentPath && isLoading) {
    return (
      <div ref={placeholderRef} className={placeholderClass} aria-busy="true" aria-label={alt}>
        <Skeleton className="h-full w-full rounded-none" />
      </div>
    );
  }

  return (
    <div
      ref={placeholderRef}
      className={`grid place-items-center text-text-muted ${placeholderClass}`}
      aria-label={alt}
    >
      <ImageIcon className="size-6" />
    </div>
  );
}
