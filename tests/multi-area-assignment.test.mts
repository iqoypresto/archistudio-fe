import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { areaApi } from "@/lib/api/area.api";
import { api } from "@/lib/api/axios";
import {
  filterAssignableSupervisors,
  resolveAreaPermissions,
} from "@/lib/validation/area-access";

const SUPERVISORS = [
  { id: "sup-1", name: "Budi (Aktif di Area A)" },
  { id: "sup-2", name: "Andi (Aktif di Project Lain)" },
  { id: "sup-3", name: "Candra" },
];

describe("TASK-11 Frontend Penugasan Multi-Area & Role Read-Only (US-24, BR-09)", () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
  });

  it("[AC-24.1 / BR-09] filterAssignableSupervisors tetap menampilkan supervisor yang aktif di area/project lain", () => {
    const candidatesForAreaB = filterAssignableSupervisors(SUPERVISORS, "sup-1");
    assert.deepEqual(
      candidatesForAreaB.map((item) => item.id),
      ["sup-2", "sup-3"],
    );

    const candidatesForEmptyArea = filterAssignableSupervisors(SUPERVISORS, null);
    assert.equal(candidatesForEmptyArea.length, 3);
  });

  it("[AC-24.2 / BR-03, BR-09] resolveAreaPermissions membatasi SUPERVISOR menjadi baca saja", () => {
    const supervisorPerms = resolveAreaPermissions("SUPERVISOR", {
      status: "BERJALAN",
      archivedAt: null,
    });
    assert.deepEqual(supervisorPerms, {
      isSupervisorReadOnly: true,
      isProjectReadOnly: false,
      canViewHistory: false,
      canEditArea: false,
    });

    const adminPerms = resolveAreaPermissions("ADMIN", {
      status: "BERJALAN",
      archivedAt: null,
    });
    assert.deepEqual(adminPerms, {
      isSupervisorReadOnly: false,
      isProjectReadOnly: false,
      canViewHistory: true,
      canEditArea: true,
    });
  });

  it("[BR-12 / BR-39] resolveAreaPermissions menonaktifkan edit namun mempertahankan riwayat pada project SELESAI/arsip", () => {
    const completedPerms = resolveAreaPermissions("OWNER", {
      status: "SELESAI",
      archivedAt: null,
    });
    assert.equal(completedPerms.isProjectReadOnly, true);
    assert.equal(completedPerms.canEditArea, false);
    assert.equal(completedPerms.canViewHistory, true);

    const archivedPerms = resolveAreaPermissions("ADMIN", {
      status: "BERJALAN",
      archivedAt: "2026-11-19T00:00:00.000Z",
    });
    assert.equal(archivedPerms.isProjectReadOnly, true);
    assert.equal(archivedPerms.canEditArea, false);
    assert.equal(archivedPerms.canViewHistory, true);
  });

  it("[API Client / US-24] areaApi menugaskan supervisor yang sama ke dua area berbeda dan membaca riwayat", async () => {
    const calledUrls: string[] = [];

    api.defaults.adapter = async (config) => {
      const url = config.url ?? "";
      const method = (config.method ?? "get").toLowerCase();
      calledUrls.push(`${method.toUpperCase()} ${url}`);

      if (method === "post" && url.endsWith("/assignments")) {
        return {
          data: {
            success: true,
            message: "Penugasan berhasil.",
            data: {
              id: `assign-${calledUrls.length}`,
              supervisorId: "sup-2",
              startDate: "2026-11-19",
              endDate: null,
              supervisor: {
                id: "sup-2",
                name: "Andi",
                username: "andi",
                phone: "081200000002",
                jobTitle: "Supervisor",
              },
            },
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      if (method === "get" && url === "/areas/area-a/assignments") {
        return {
          data: {
            success: true,
            message: "Riwayat berhasil diambil.",
            data: [],
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      throw new Error(`Unexpected request: ${method} ${url}`);
    };

    const first = await areaApi.assignSupervisor("area-a", {
      supervisorId: "sup-2",
      effectiveStartDate: "2026-11-19",
    });
    const second = await areaApi.assignSupervisor("area-b", {
      supervisorId: "sup-2",
      effectiveStartDate: "2026-11-19",
    });
    const history = await areaApi.getAssignmentHistory("area-a");

    assert.equal(first.supervisorId, "sup-2");
    assert.equal(second.supervisorId, "sup-2");
    assert.deepEqual(history, []);
    assert.deepEqual(calledUrls, [
      "POST /areas/area-a/assignments",
      "POST /areas/area-b/assignments",
      "GET /areas/area-a/assignments",
    ]);
  });
});
