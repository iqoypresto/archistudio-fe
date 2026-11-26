export type StoredFileVariant = "full" | "thumb";

export interface CachedStoredFile {
  blob: Blob;
  objectUrl: string;
  variant: StoredFileVariant;
}

const MAX_CACHE_ENTRIES = 120;
const cacheEntries = new Map<string, CachedStoredFile>();
const inflightRequests = new Map<string, Promise<CachedStoredFile>>();
let cacheGeneration = 0;

function toCacheKey(contentPath: string, variant: StoredFileVariant): string {
  return `${variant}:${contentPath}`;
}

function createObjectUrlSafe(blob: Blob): string {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return "";
  return URL.createObjectURL(blob);
}

function revokeObjectUrlSafe(url: string): void {
  if (!url || typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") return;
  URL.revokeObjectURL(url);
}

function touchEntry(key: string, entry: CachedStoredFile): CachedStoredFile {
  cacheEntries.delete(key);
  cacheEntries.set(key, entry);
  return entry;
}

function evictOldestIfNeeded(): void {
  while (cacheEntries.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cacheEntries.keys().next().value;
    if (oldestKey === undefined) break;
    const oldest = cacheEntries.get(oldestKey);
    cacheEntries.delete(oldestKey);
    if (oldest) revokeObjectUrlSafe(oldest.objectUrl);
  }
}

export function buildStoredFilePath(
  contentPath: string,
  variant: StoredFileVariant = "full",
): string {
  if (variant === "full") return contentPath;
  const separator = contentPath.includes("?") ? "&" : "?";
  return `${contentPath}${separator}variant=thumb`;
}

export function getCachedStoredFile(
  contentPath: string,
  variant: StoredFileVariant = "full",
): CachedStoredFile | null {
  const exactKey = toCacheKey(contentPath, variant);
  const exact = cacheEntries.get(exactKey);
  if (exact) return touchEntry(exactKey, exact);

  if (variant === "thumb") {
    const fullKey = toCacheKey(contentPath, "full");
    const full = cacheEntries.get(fullKey);
    if (full) return touchEntry(fullKey, full);
  }
  return null;
}

export function getPreviewFallbackStoredFile(
  contentPath: string,
  variant: StoredFileVariant = "full",
): CachedStoredFile | null {
  const exact = getCachedStoredFile(contentPath, variant);
  if (exact) return exact;

  if (variant === "full") {
    const thumbKey = toCacheKey(contentPath, "thumb");
    const thumb = cacheEntries.get(thumbKey);
    if (thumb) return touchEntry(thumbKey, thumb);
  }
  return null;
}

export function loadStoredFile(
  contentPath: string,
  variant: StoredFileVariant,
  fetcher: (requestPath: string) => Promise<Blob>,
): Promise<CachedStoredFile> {
  const cached = getCachedStoredFile(contentPath, variant);
  if (cached) return Promise.resolve(cached);

  const key = toCacheKey(contentPath, variant);
  const existing = inflightRequests.get(key);
  if (existing) return existing;

  const generation = cacheGeneration;
  const requestPath = buildStoredFilePath(contentPath, variant);
  const promise = fetcher(requestPath)
    .then((blob) => {
      if (generation !== cacheGeneration) return { blob, objectUrl: "", variant };
      const entry: CachedStoredFile = { blob, objectUrl: createObjectUrlSafe(blob), variant };
      evictOldestIfNeeded();
      cacheEntries.set(key, entry);
      return entry;
    })
    .finally(() => {
      if (inflightRequests.get(key) === promise) inflightRequests.delete(key);
    });

  inflightRequests.set(key, promise);
  return promise;
}

export function clearStoredFileCache(): void {
  cacheGeneration += 1;
  for (const entry of cacheEntries.values()) revokeObjectUrlSafe(entry.objectUrl);
  cacheEntries.clear();
  inflightRequests.clear();
}
