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

  it("[API Client / US-18, US-19] drawingApi & projectDocumentApi memanggil endpoint & purpose sign yang tepat", async () => {
    const calls: string[] = [];

    api.defaults.adapter = async (config) => {
      const method = (config.method ?? "get").toUpperCase();
      const url = config.url ?? "";
      calls.push(`${method} ${url}`);
      return {
        data: { success: true, message: "OK", data: method === "GET" ? [] : { id: "x-1" } },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    await drawingApi.getDrawings("p-1");
    await drawingApi.signDrawingUpload({
      projectId: "p-1",
      fileName: "denah.webp",
      contentType: "image/webp",
      fileSizeBytes: 1024,
    });
    await drawingApi.createDrawing("p-1", {
      storageKey: "projects/p-1/drawings/1.webp",
      fileName: "denah.webp",
      mimeType: "image/webp",
      sizeBytes: 1024,
    });
    await drawingApi.archiveDrawing("drw-1");

    await projectDocumentApi.getDocuments("p-1", { type: "QUOTATION" });
    await projectDocumentApi.signDocumentUpload({
      projectId: "p-1",
      type: "QUOTATION",
      fileName: "q1.pdf",
      contentType: "application/pdf",
      fileSizeBytes: 2048,
    });
    await projectDocumentApi.createDocument("p-1", {
      type: "QUOTATION",
      storageKey: "projects/p-1/documents/QUOTATION/1.pdf",
      fileName: "q1.pdf",
      mimeType: "application/pdf",
      sizeBytes: 2048,
    });
    await projectDocumentApi.deleteDocument("doc-1");

    assert.deepEqual(calls, [
      "GET /office/projects/p-1/drawings",
      "POST /office/uploads/sign",
      "POST /office/projects/p-1/drawings",
      "POST /office/drawings/drw-1/archive",
      "GET /office/projects/p-1/documents",
      "POST /office/uploads/sign",
      "POST /office/projects/p-1/documents",
      "DELETE /office/documents/doc-1",
    ]);
  });
});
