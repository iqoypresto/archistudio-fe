"use client";

import { useEffect, useState } from "react";
import { fileApi } from "@/lib/api/file.api";
import {
  getCachedStoredFile,
  getPreviewFallbackStoredFile,
  type StoredFileVariant,
} from "@/lib/api/file-cache";

export interface UseStoredFileUrlOptions {
  variant?: StoredFileVariant;
  enabled?: boolean;
}

export interface StoredFileUrlState {
  src: string | null;
  isLoading: boolean;
  isError: boolean;
}

interface AsyncLoadResult {
  key: string;
  url: string | null;
  error: boolean;
}

export function useStoredFileUrl(
  contentPath: string | null | undefined,
  options?: UseStoredFileUrlOptions,
): StoredFileUrlState {
  const variant = options?.variant ?? "full";
  const enabled = options?.enabled ?? true;
  const requestKey = contentPath ? `${variant}:${contentPath}` : null;
  const [asyncResult, setAsyncResult] = useState<AsyncLoadResult | null>(null);

  const exactCached = contentPath ? getCachedStoredFile(contentPath, variant) : null;
  const fallbackCached =
    contentPath && !exactCached ? getPreviewFallbackStoredFile(contentPath, variant) : null;

  useEffect(() => {
    if (!contentPath || !requestKey || !enabled || exactCached) return;
    let active = true;
    void fileApi
      .getCachedEntry(contentPath, variant)
      .then((entry) => {
        if (active) setAsyncResult({ key: requestKey, url: entry.objectUrl || null, error: false });
      })
      .catch(() => {
        if (active) setAsyncResult({ key: requestKey, url: null, error: true });
      });
    return () => {
      active = false;
    };
  }, [contentPath, enabled, exactCached, requestKey, variant]);

  if (!contentPath || !requestKey) return { src: null, isLoading: false, isError: false };
  if (exactCached) return { src: exactCached.objectUrl || null, isLoading: false, isError: false };

  const matched = asyncResult?.key === requestKey ? asyncResult : null;
  if (matched?.url) return { src: matched.url, isLoading: false, isError: false };
  if (fallbackCached?.objectUrl) return { src: fallbackCached.objectUrl, isLoading: false, isError: false };
  if (matched?.error) return { src: null, isLoading: false, isError: true };
  return { src: null, isLoading: true, isError: false };
}
