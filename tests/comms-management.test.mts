import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "@/lib/api/axios";
import { commsApi } from "@/lib/api/comms.api";
import {
  canEditCommsEntry,
  commsFormSchema,
  MAX_COMMS_ATTACHMENT_BYTES,
  resolveCommsPermissions,
  validateCommsAttachmentFile,
} from "@/lib/validation/comms.validation";

describe("TASK-20 Frontend Comms Project — Validation, RBAC & API (US-20, BR-35)", () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
  });

  it("[AC-20.1 / BR-35] commsFormSchema & validateCommsAttachmentFile memvalidasi field wajib dan lampiran <= 5 MB", () => {
    assert.equal(
      commsFormSchema.safeParse({ entryDate: "2026-11-20", direction: "INBOUND", subject: "" }).success,
      false,
    );
    assert.equal(
      commsFormSchema.safeParse({
        entryDate: "2026-11-20",
        direction: "OUTBOUND",
        subject: "Konfirmasi jadwal",
        note: "Kirim dokumen via email",
      }).success,
      true,
    );

    assert.equal(validateCommsAttachmentFile({ type: "application/pdf", size: 2048 }).valid, true);
    assert.equal(
      validateCommsAttachmentFile({
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: MAX_COMMS_ATTACHMENT_BYTES,
      }).valid,
      true,
    );
    assert.equal(validateCommsAttachmentFile({ type: "image/jpeg", size: 2048 }).valid, false);
    assert.equal(
      validateCommsAttachmentFile({ type: "application/pdf", size: MAX_COMMS_ATTACHMENT_BYTES + 1 }).valid,
      false,
    );
  });

  it("[AC-20.1 / BR-35, D-05, K-02] resolveCommsPermissions mengizinkan 4 role (baca-saja di arsip) & Edit hanya pembuat atau OWNER", () => {
    for (const role of ["OWNER", "ADMIN", "SITE_MANAGER", "SUPERVISOR"] as const) {
      assert.deepEqual(resolveCommsPermissions(role, { status: "BERJALAN", archivedAt: null }), {
        canView: true,
        canMutate: true,
        isProjectReadOnly: false,
      });
      assert.deepEqual(resolveCommsPermissions(role, { status: "SELESAI", archivedAt: null }), {
        canView: true,
        canMutate: false,
        isProjectReadOnly: true,
      });
    }

    const entryBySm = { createdBy: { id: "u-sm" } };
    assert.equal(canEditCommsEntry({ id: "u-sm", role: "SITE_MANAGER" }, entryBySm), true);
    assert.equal(canEditCommsEntry({ id: "u-owner", role: "OWNER" }, entryBySm), true);
    assert.equal(canEditCommsEntry({ id: "u-admin", role: "ADMIN" }, entryBySm), false);
    assert.equal(canEditCommsEntry({ id: "u-sup", role: "SUPERVISOR" }, entryBySm), false);
  });

  it("[API Client / US-20] commsApi memanggil endpoint Office /comms & alur sesi upload comms-attachment", async () => {
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
              fileName: "mom.pdf",
              contentType: "application/pdf",
              fileSizeBytes: 3,
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
          data: { success: true, message: "OK", data: { nextOffsetBytes: 3 } },
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
              fileName: "mom.pdf",
              contentType: "application/pdf",
              fileSizeBytes: 3,
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
        data: { success: true, message: "OK", data: method === "GET" ? [] : { id: "c-1" } },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    const file = new File(["pdf"], "mom.pdf", { type: "application/pdf" });
    await commsApi.getEntries("p-1", { dateFrom: "2026-11-01", dateTo: "2026-11-20" });
    const uploaded = await commsApi.uploadAttachment("p-1", file);
    assert.equal(uploaded.storedFileId, "sf-1");
    await commsApi.createEntry("p-1", {
      entryDate: "2026-11-20",
      direction: "INBOUND",
      subject: "MoM",
    });
    await commsApi.updateEntry("c-1", { direction: "OUTBOUND" });

    assert.deepEqual(calls, [
      "GET /office/projects/p-1/comms",
      "POST /office/uploads/sessions",
      "PUT /office/uploads/sessions/us-1/chunks",
      "POST /office/uploads/sessions/us-1/complete",
      "POST /office/projects/p-1/comms",
      "PATCH /office/comms/c-1",
    ]);
  });
});
