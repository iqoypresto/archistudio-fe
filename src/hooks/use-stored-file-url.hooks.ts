"use client";

import { useEffect, useState } from "react";
import { fileApi } from "@/lib/api/file.api";

export function useStoredFileUrl(contentPath: string | null | undefined): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!contentPath) {
      setObjectUrl(null);
      return;
    }

    let active = true;
    let createdUrl: string | null = null;
    setObjectUrl(null);
    void fileApi.getContent(contentPath).then((blob) => {
      if (!active) return;
      createdUrl = URL.createObjectURL(blob);
      setObjectUrl(createdUrl);
    }).catch(() => {
      if (active) setObjectUrl(null);
    });

    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [contentPath]);

  return objectUrl;
}
