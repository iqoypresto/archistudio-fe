"use client";

import { ImageIcon } from "lucide-react";
import { useStoredFileUrl } from "@/hooks/use-stored-file-url.hooks";

export function StoredFileImage({
  contentPath,
  alt,
  className,
  fallbackClassName,
}: {
  contentPath: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const src = useStoredFileUrl(contentPath);
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  ) : (
    <div className={`grid place-items-center text-text-muted ${fallbackClassName ?? className ?? ""}`} aria-label={alt}>
      <ImageIcon className="size-6" />
    </div>
  );
}
