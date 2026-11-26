import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "@/lib/api/axios";
import { fileApi } from "@/lib/api/file.api";
import {
  buildStoredFilePath,
  clearStoredFileCache,
  getCachedStoredFile,
  getPreviewFallbackStoredFile,
  loadStoredFile,
} from "@/lib/api/file-cache";
import { useAuthStore } from "@/stores/auth.store";

describe("Stored File Cache & Preview Deduplication", () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    clearStoredFileCache();
  });

  it("buildStoredFilePath membentuk query variant=thumb tanpa merusak URL full", () => {
    assert.equal(buildStoredFilePath("/files/a/content", "full"), "/files/a/content");
    assert.equal(buildStoredFilePath("/files/a/content", "thumb"), "/files/a/content?variant=thumb");
    assert.equal(
      buildStoredFilePath("/files/a/content?foo=1", "thumb"),
      "/files/a/content?foo=1&variant=thumb",
    );
  });

  it("melakukan deduplikasi request paralel & cache hit tanpa fetch ulang", async () => {
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return new Blob(["img-bytes"], { type: "image/jpeg" });
    };

    const [first, second] = await Promise.all([
      loadStoredFile("/files/1/content", "full", fetcher),
      loadStoredFile("/files/1/content", "full", fetcher),
    ]);
    const third = await loadStoredFile("/files/1/content", "full", fetcher);

    assert.equal(fetchCount, 1);
    assert.equal(first, second);
    assert.equal(first, third);
  });

  it("menyediakan fallback thumb instan untuk preview full dan reuse full untuk thumb", async () => {
    const thumbEntry = await loadStoredFile("/files/2/content", "thumb", async () => {
      return new Blob(["thumb"], { type: "image/webp" });
    });

    assert.equal(getCachedStoredFile("/files/2/content", "full"), null);
    assert.equal(getPreviewFallbackStoredFile("/files/2/content", "full"), thumbEntry);

    const fullEntry = await loadStoredFile("/files/2/content", "full", async () => {
      return new Blob(["full"], { type: "image/jpeg" });
    });

    assert.equal(getPreviewFallbackStoredFile("/files/2/content", "full"), fullEntry);
    assert.equal(getCachedStoredFile("/files/2/content", "thumb"), thumbEntry);

    const fullOnly = await loadStoredFile("/files/3/content", "full", async () => {
      return new Blob(["full-3"], { type: "image/jpeg" });
    });
    assert.equal(getCachedStoredFile("/files/3/content", "thumb"), fullOnly);
  });

  it("fileApi.getCachedEntry memakai URL variant yang tepat dan dibersihkan saat clearSession", async () => {
    const requestedUrls: string[] = [];
    api.defaults.adapter = async (config) => {
      requestedUrls.push(config.url ?? "");
      return {
        data: new Blob(["ok"], { type: "image/jpeg" }),
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    await fileApi.getCachedEntry("/files/9/content", "thumb");
    await fileApi.getCachedEntry("/files/9/content", "thumb");
    assert.deepEqual(requestedUrls, ["/files/9/content?variant=thumb"]);

    useAuthStore.getState().clearSession();
    assert.equal(getCachedStoredFile("/files/9/content", "thumb"), null);
  });

  it("membuang hasil request in-flight lama jika cache dibersihkan saat request berjalan", async () => {
    let resolveBlob!: (blob: Blob) => void;
    const pending = loadStoredFile(
      "/files/stale/content",
      "full",
      () => new Promise<Blob>((resolve) => { resolveBlob = resolve; }),
    );

    clearStoredFileCache();
    resolveBlob(new Blob(["stale"], { type: "image/jpeg" }));
    const entry = await pending;

    assert.equal(entry.objectUrl, "");
    assert.equal(getCachedStoredFile("/files/stale/content", "full"), null);
  });
});
