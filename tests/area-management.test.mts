import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "@/lib/api/axios";
import { areaApi } from "@/lib/api/area.api";
import {
  areaFormSchema,
  assignSupervisorFormSchema,
} from "@/lib/validation/area.validation";
import type { AreaListItem } from "@/types/api/area.types";

const MOCK_AREA: AreaListItem = {
  id: "area-10",
  projectId: "proj-10",
  code: "A",
  name: "Area Kolam Renang",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  activeAssignment: {
    id: "assign-1",
    supervisorId: "sup-1",
    startDate: "2026-11-01",
    endDate: null,
    supervisor: {
      id: "sup-1",
      name: "Supervisor 1",
      username: "sup1",
      phone: "081234567890",
      jobTitle: "Supervisor",
    },
  },
};

describe("TASK-05 Frontend Area & Supervisor Assignment — Unit Tests", () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
  });

  it("[Validation] areaFormSchema menolak kode kosong dan mentransformasi ke huruf kapital", () => {
    const invalidCode = areaFormSchema.safeParse({
      code: "",
      name: "Area Utama",
    });
    assert.equal(invalidCode.success, false);

    const valid = areaFormSchema.safeParse({
      code: "lt1",
      name: "Lantai 1",
    });
    assert.equal(valid.success, true);
    if (valid.success) {
      assert.equal(valid.data.code, "LT1");
    }
  });

  it("[Validation] assignSupervisorFormSchema menolak supervisor kosong dan tanggal tidak valid", () => {
    const invalidEmpty = assignSupervisorFormSchema.safeParse({
      supervisorId: "",
      effectiveStartDate: "2026-11-10",
    });
    assert.equal(invalidEmpty.success, false);

    const invalidDate = assignSupervisorFormSchema.safeParse({
      supervisorId: "sup-2",
      effectiveStartDate: "10-11-2026",
    });
    assert.equal(invalidDate.success, false);

    const valid = assignSupervisorFormSchema.safeParse({
      supervisorId: "sup-2",
      effectiveStartDate: "2026-11-10",
    });
    assert.equal(valid.success, true);
  });

  it("[API Client] areaApi memanggil endpoint area & penugasan dengan method dan payload yang tepat", async () => {
    api.defaults.adapter = async (config) => {
      const url = config.url ?? "";
      const method = (config.method ?? "get").toLowerCase();

      if (url.includes("/projects/proj-10/areas") && method === "get") {
        return {
          data: {
            success: true,
            message: "Daftar area berhasil diambil.",
            data: [MOCK_AREA],
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      if (url.includes("/projects/proj-10/areas") && method === "post") {
        return {
          data: {
            success: true,
            message: "Area baru berhasil dibuat.",
            data: MOCK_AREA,
          },
          status: 201,
          statusText: "Created",
          headers: {},
          config,
        };
      }

      if (url.includes("/areas/area-10/assignments") && method === "post") {
        return {
          data: {
            success: true,
            message: "Penugasan berhasil diperbarui.",
            data: {
              id: "assign-2",
              supervisorId: "sup-2",
              startDate: "2026-11-10",
              endDate: null,
              supervisor: {
                id: "sup-2",
                name: "Supervisor 2",
                username: "sup2",
                phone: "081299998888",
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

      throw new Error(`Unexpected request: ${method} ${url}`);
    };

    const listRes = await areaApi.getAreasByProject("proj-10");
    assert.equal(listRes.length, 1);
    assert.equal(listRes[0]?.code, "A");

    const createRes = await areaApi.createArea("proj-10", {
      code: "A",
      name: "Area Kolam Renang",
      initialSupervisorId: "sup-1",
      startDate: "2026-11-01",
    });
    assert.equal(createRes.id, "area-10");

    const assignRes = await areaApi.assignSupervisor("area-10", {
      supervisorId: "sup-2",
      effectiveStartDate: "2026-11-10",
    });
    assert.equal(assignRes.id, "assign-2");
    assert.equal(assignRes.supervisorId, "sup-2");
  });
});
