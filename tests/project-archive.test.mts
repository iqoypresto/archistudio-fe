import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "@/lib/api/axios";
import { projectApi } from "@/lib/api/project.api";
import {
  groupArchivedProjectsByYear,
  projectFormSchema,
  resolveProjectArchiveActions,
  restoreProjectSchema,
} from "@/lib/validation/project.validation";
import type { ArchivedProjectItem } from "@/types/api/project.types";

const BASE_ARCHIVED: ArchivedProjectItem = {
  id: "proj-2026",
  code: "VLA26",
  name: "Villa Seminyak",
  location: "Badung, Bali",
  clientName: "PT Bali Karya",
  startDate: "2026-01-01",
  endDate: null,
  status: "SELESAI",
  timezone: "Asia/Makassar",
  routineHolidays: [0],
  completedAt: "2026-11-10T05:00:00.000Z",
  archivedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-11-10T05:00:00.000Z",
  archiveType: "COMPLETED",
  archiveYear: 2026,
  archivedActionAt: "2026-11-10T05:00:00.000Z",
};

describe("TASK-17 Frontend Archive Project — Validation, Grouping, RBAC & API (US-22, BR-12, BR-39)", () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
  });

  it("[AC-22.1 / BR-39] projectFormSchema menolak status SELESAI dan restoreProjectSchema hanya menerima PERSIAPAN/BERJALAN", () => {
    const completedForm = projectFormSchema.safeParse({
      code: "VLA99",
      name: "Villa Selesai",
      location: "Ubud",
      clientName: "PT Test",
      startDate: "2026-11-01",
      status: "SELESAI",
      timezone: "Asia/Makassar",
      routineHolidays: [0],
    });
    assert.equal(completedForm.success, false);

    assert.equal(restoreProjectSchema.safeParse({ status: "PERSIAPAN" }).success, true);
    assert.equal(restoreProjectSchema.safeParse({ status: "BERJALAN" }).success, true);
    assert.equal(restoreProjectSchema.safeParse({ status: "SELESAI" }).success, false);
  });

  it("[AC-22.1 / BR-39] groupArchivedProjectsByYear mengelompokkan folder tahun terbaru di atas", () => {
    const manual2025: ArchivedProjectItem = {
      ...BASE_ARCHIVED,
      id: "proj-2025",
      code: "VLA25",
      status: "BERJALAN",
      completedAt: null,
      archivedAt: "2025-07-01T05:00:00.000Z",
      archiveType: "MANUAL",
      archiveYear: 2025,
      archivedActionAt: "2025-07-01T05:00:00.000Z",
    };

    const groups = groupArchivedProjectsByYear([manual2025, BASE_ARCHIVED]);
    assert.deepEqual(
      groups.map((group) => group.year),
      [2026, 2025],
    );
    assert.equal(groups[0]?.projects[0]?.id, "proj-2026");
    assert.equal(groups[1]?.projects[0]?.id, "proj-2025");
  });

  it("[AC-22.1 / BR-12, BR-39] resolveProjectArchiveActions membatasi aksi mutasi hanya untuk OWNER", () => {
    const ownerActive = resolveProjectArchiveActions("OWNER", { status: "BERJALAN", archivedAt: null });
    assert.deepEqual(ownerActive, {
      canViewArchive: true,
      canComplete: true,
      canArchive: true,
      canRestore: false,
    });

    const ownerArchived = resolveProjectArchiveActions("OWNER", { status: "SELESAI", archivedAt: null });
    assert.deepEqual(ownerArchived, {
      canViewArchive: true,
      canComplete: false,
      canArchive: false,
      canRestore: true,
    });

    const adminActive = resolveProjectArchiveActions("ADMIN", { status: "BERJALAN", archivedAt: null });
    assert.deepEqual(adminActive, {
      canViewArchive: true,
      canComplete: false,
      canArchive: false,
      canRestore: false,
    });

    const supPerms = resolveProjectArchiveActions("SUPERVISOR", { status: "BERJALAN", archivedAt: null });
    assert.equal(supPerms.canViewArchive, false);
  });

  it("[API Client / US-22] projectApi memanggil endpoint Office archive serta POST complete, archive, dan restore", async () => {
    const calls: string[] = [];

    api.defaults.adapter = async (config) => {
      const method = (config.method ?? "get").toUpperCase();
      const url = config.url ?? "";
      calls.push(`${method} ${url}`);

      if (method === "GET" && url === "/office/projects/archive") {
        return {
          data: { success: true, message: "OK", data: [BASE_ARCHIVED] },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }
      if (method === "POST" && url.startsWith("/office/projects/proj-2026/")) {
        return {
          data: { success: true, message: "OK", data: BASE_ARCHIVED },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }
      throw new Error(`Unexpected request: ${method} ${url}`);
    };

    const list = await projectApi.getArchivedProjects({ year: 2026 });
    assert.equal(list.length, 1);
    await projectApi.completeProject("proj-2026");
    await projectApi.archiveProject("proj-2026");
    await projectApi.restoreProject("proj-2026", { status: "BERJALAN" });

    assert.deepEqual(calls, [
      "GET /office/projects/archive",
      "POST /office/projects/proj-2026/complete",
      "POST /office/projects/proj-2026/archive",
      "POST /office/projects/proj-2026/restore",
    ]);
  });
});
