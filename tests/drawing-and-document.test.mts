import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "@/lib/api/axios";
import { drawingApi } from "@/lib/api/drawing.api";
import { projectDocumentApi } from "@/lib/api/project-document.api";
import {
  MAX_DRAWING_BYTES,
  resolveDrawingPermissions,
  validateCompressedDrawingSize,
  validateDrawingFileType,
} from "@/lib/validation/drawing.validation";
import {
  MAX_PROJECT_DOCUMENT_BYTES,
  resolveProjectDocumentPermissions,
  validateProjectDocumentFile,
} from "@/lib/validation/project-document.validation";

describe("TASK-19 Frontend Drawing & Dokumen Keluar — Validation, RBAC & API (US-18, US-19)", () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
  });

  it("[AC-18.1 / BR-32, BR-33] validasi tipe & ukuran Drawing serta izin lihat/kelola per role", () => {
    assert.equal(validateDrawingFileType({ type: "image/jpeg" }).valid, true);
    assert.equal(validateDrawingFileType({ type: "image/webp" }).valid, true);
    assert.equal(validateDrawingFileType({ type: "application/pdf" }).valid, false);
    assert.equal(validateCompressedDrawingSize(MAX_DRAWING_BYTES).valid, true);
    assert.equal(validateCompressedDrawingSize(MAX_DRAWING_BYTES + 1).valid, false);

    assert.deepEqual(resolveDrawingPermissions("OWNER", { status: "BERJALAN", archivedAt: null }), {
      canView: true,
      canManage: true,
      isProjectReadOnly: false,
    });
    assert.deepEqual(resolveDrawingPermissions("SITE_MANAGER", { status: "BERJALAN", archivedAt: null }), {
      canView: true,
      canManage: false,
      isProjectReadOnly: false,
    });
    assert.deepEqual(resolveDrawingPermissions("SUPERVISOR", { status: "BERJALAN", archivedAt: null }), {
      canView: true,
      canManage: false,
      isProjectReadOnly: false,
    });
    assert.equal(resolveDrawingPermissions("OWNER", { status: "SELESAI", archivedAt: null }).canManage, false);
  });

  it("[AC-19.1 / BR-34] validasi file Dokumen Keluar (PDF/Word/Excel <= 5 MB) & guard OWNER-only", () => {
    assert.equal(validateProjectDocumentFile({ type: "application/pdf", size: 1024 }).valid, true);
    assert.equal(
      validateProjectDocumentFile({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: MAX_PROJECT_DOCUMENT_BYTES,
      }).valid,
      true,
    );
    assert.equal(validateProjectDocumentFile({ type: "image/png", size: 1024 }).valid, false);
    assert.equal(
      validateProjectDocumentFile({ type: "application/pdf", size: MAX_PROJECT_DOCUMENT_BYTES + 1 }).valid,
      false,
    );

    assert.equal(resolveProjectDocumentPermissions("OWNER", { status: "BERJALAN" }).canMutate, true);
    assert.equal(resolveProjectDocumentPermissions("ADMIN", { status: "BERJALAN" }).canView, false);
    assert.equal(resolveProjectDocumentPermissions("SUPERVISOR", { status: "BERJALAN" }).canView, false);
  });

  it("[API Client / US-18, US-19] drawingApi & projectDocumentApi memanggil endpoint & alur sesi upload yang tepat", async () => {
    const calls: string[] = [];

    api.defaults.adapter = async (config) => {
      const method = (config.method ?? "get").toUpperCase();
      const url = config.url ?? "";
      calls.push(`${method} ${url}`);
      if (url === "/office/uploads/sessions") {
        return {
          data: {
            success: true,
            message: "OK",
            data: {
              storedFileId: "sf-1",
              uploadSessionId: "us-1",
              chunkSizeBytes: 4 * 1024 * 1024,
              expiresAt: "2026-11-21T00:00:00.000Z",
              fileName: "file.bin",
              contentType: "application/octet-stream",
              fileSizeBytes: 4,
            },
          },
          status: 201,
          statusText: "Created",
          headers: {},
          config,
        };
      }
      if (url === "/office/uploads/sessions/us-1/chunks") {
        return {
          data: { success: true, message: "OK", data: { nextOffsetBytes: 4 } },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }
      if (url === "/office/uploads/sessions/us-1/complete") {
        return {
          data: {
            success: true,
            message: "OK",
            data: {
              storedFileId: "sf-1",
              uploadSessionId: "us-1",
              fileName: "file.bin",
              contentType: "application/octet-stream",
              fileSizeBytes: 4,
              uploadedAt: "2026-11-20T00:00:00.000Z",
            },
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }
      return {
        data: { success: true, message: "OK", data: method === "GET" ? [] : { id: "x-1" } },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    const drawingBlob = new Blob(["webp"], { type: "image/webp" });
    const docFile = new File(["pdf1"], "q1.pdf", { type: "application/pdf" });

    await drawingApi.getDrawings("p-1");
    await drawingApi.uploadDrawing("p-1", drawingBlob, "denah.webp", "image/webp");
    await drawingApi.createDrawing("p-1", { storedFileId: "sf-1" });
    await drawingApi.archiveDrawing("drw-1");

    await projectDocumentApi.getDocuments("p-1", { type: "QUOTATION" });
    await projectDocumentApi.uploadDocument("p-1", "QUOTATION", docFile);
    await projectDocumentApi.createDocument("p-1", {
      type: "QUOTATION",
      storedFileId: "sf-1",
    });
    await projectDocumentApi.deleteDocument("doc-1");

    assert.deepEqual(calls, [
      "GET /office/projects/p-1/drawings",
      "POST /office/uploads/sessions",
      "PUT /office/uploads/sessions/us-1/chunks",
      "POST /office/uploads/sessions/us-1/complete",
      "POST /office/projects/p-1/drawings",
      "POST /office/drawings/drw-1/archive",
      "GET /office/projects/p-1/documents",
      "POST /office/uploads/sessions",
      "PUT /office/uploads/sessions/us-1/chunks",
      "POST /office/uploads/sessions/us-1/complete",
      "POST /office/projects/p-1/documents",
      "DELETE /office/documents/doc-1",
    ]);
  });
});
