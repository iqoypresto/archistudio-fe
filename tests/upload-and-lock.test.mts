import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyQueueItemPatch,
  prepareRetryItem,
  removeQueueItem,
} from "@/hooks/upload-queue.hooks";
import {
  canSubmitPhotoQueue,
  validateSelectedPhotoFiles,
} from "@/lib/validation/upload.validation";
import type { PhotoQueueItem } from "@/types/api/upload.types";

function makeQueueItem(
  id: string,
  status: PhotoQueueItem["status"],
  storageKey: string | null = null
): PhotoQueueItem {
  return {
    id,
    fileName: `${id}.jpg`,
    contentType: "image/jpeg",
    previewUrl: `blob:${id}`,
    file: new Blob(["img"], { type: "image/jpeg" }),
    status,
    progress: status === "uploaded" ? 100 : 0,
    caption: "",
    storageKey,
    takenAt: "2026-11-16T08:00:00.000Z",
    errorMessage: status === "failed" ? "Sinyal terputus" : null,
  };
}

describe("TASK-06 Frontend Upload Validation & Retry Queue", () => {
  it("[AC-08.2 / BR-16] menolak jumlah foto < 1 atau > 10 serta format selain JPG/PNG/WebP", () => {
    const emptyCheck = validateSelectedPhotoFiles(0, []);
    assert.equal(emptyCheck.ok, false);
    if (!emptyCheck.ok) {
      assert.equal(emptyCheck.code, "INVALID_PHOTO_COUNT");
    }

    const overLimitCheck = validateSelectedPhotoFiles(9, [
      { name: "a.jpg", type: "image/jpeg", size: 1024 },
      { name: "b.png", type: "image/png", size: 1024 },
    ]);
    assert.equal(overLimitCheck.ok, false);
    if (!overLimitCheck.ok) {
      assert.equal(overLimitCheck.code, "INVALID_PHOTO_COUNT");
    }

    const badMimeCheck = validateSelectedPhotoFiles(0, [
      { name: "dokumen.pdf", type: "application/pdf", size: 2048 },
    ]);
    assert.equal(badMimeCheck.ok, false);
    if (!badMimeCheck.ok) {
      assert.equal(badMimeCheck.code, "UNSUPPORTED_FILE_TYPE");
    }

    const validCheck = validateSelectedPhotoFiles(1, [
      { name: "progres.webp", type: "image/webp", size: 50_000 },
    ]);
    assert.equal(validCheck.ok, true);
  });

  it("[NFR-02] retry satu foto gagal mempertahankan foto lain yang sudah terunggah", () => {
    const photo1 = makeQueueItem("p1", "uploaded", "projects/p/areas/a/2026-11-16/1.jpg");
    const photo2 = makeQueueItem("p2", "failed", null);

    const blockedSubmit = canSubmitPhotoQueue([photo1, photo2]);
    assert.equal(blockedSubmit.ready, false);

    const afterRetryPrep = prepareRetryItem([photo1, photo2], "p2");
    assert.equal(afterRetryPrep[0]?.status, "uploaded");
    assert.equal(afterRetryPrep[0]?.storageKey, "projects/p/areas/a/2026-11-16/1.jpg");
    assert.equal(afterRetryPrep[1]?.status, "idle");
    assert.equal(afterRetryPrep[1]?.errorMessage, null);

    const afterUploadRetry = applyQueueItemPatch(afterRetryPrep, "p2", {
      status: "uploaded",
      progress: 100,
      storageKey: "projects/p/areas/a/2026-11-16/2.jpg",
    });
    assert.equal(canSubmitPhotoQueue(afterUploadRetry).ready, true);

    const afterRemove = removeQueueItem(afterUploadRetry, "p1");
    assert.equal(afterRemove.length, 1);
    assert.equal(canSubmitPhotoQueue(afterRemove).ready, true);
    assert.equal(canSubmitPhotoQueue([]).ready, false);
  });
});
