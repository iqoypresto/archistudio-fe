import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "@/lib/api/axios";
import { projectApi } from "@/lib/api/project.api";
import { projectFormSchema } from "@/lib/validation/project.validation";
import type { ProjectListItem } from "@/types/api/project.types";

const MOCK_PROJECT: ProjectListItem = {
  id: "proj-10",
  code: "VLA01",
  name: "Villa Ubud Bali",
  location: "Ubud, Bali",
  clientName: "PT Graha Indah",
  startDate: "2026-11-01",
  endDate: null,
  status: "BERJALAN",
  timezone: "Asia/Makassar",
  routineHolidays: [0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  _count: { areas: 2 },
};

describe("TASK-04 Frontend Project Management — Unit Tests", () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
  });

  it("[Validation] projectFormSchema menolak nama kosong, kode < 2, atau format tanggal invalid", () => {
    const invalidCode = projectFormSchema.safeParse({
      code: "V",
      name: "Villa Bali",
      location: "Ubud",
      clientName: "PT Graha",
      startDate: "2026-11-01",
      status: "PERSIAPAN",
      timezone: "Asia/Jakarta",
      routineHolidays: [0],
    });
    assert.equal(invalidCode.success, false);

    const invalidDate = projectFormSchema.safeParse({
      code: "VLA01",
      name: "Villa Bali",
      location: "Ubud",
      clientName: "PT Graha",
      startDate: "01-11-2026",
      status: "PERSIAPAN",
      timezone: "Asia/Jakarta",
      routineHolidays: [0],
    });
    assert.equal(invalidDate.success, false);
  });

  it("[Validation / BR-07] projectFormSchema mengizinkan endDate kosong dan menolak endDate < startDate", () => {
    const validFlexibleEndDate = projectFormSchema.safeParse({
      code: "VLA01",
      name: "Villa Bali",
      location: "Ubud",
      clientName: "PT Graha",
      startDate: "2026-11-01",
      endDate: "",
      status: "PERSIAPAN",
      timezone: "Asia/Jakarta",
      routineHolidays: [0],
    });
    assert.equal(validFlexibleEndDate.success, true);

    const invalidDateOrder = projectFormSchema.safeParse({
      code: "VLA01",
      name: "Villa Bali",
      location: "Ubud",
      clientName: "PT Graha",
      startDate: "2026-11-10",
      endDate: "2026-11-05",
      status: "PERSIAPAN",
      timezone: "Asia/Jakarta",
      routineHolidays: [0],
    });
    assert.equal(invalidDateOrder.success, false);
  });

  it("[API Client] projectApi memanggil endpoint /projects dengan method dan payload yang tepat", async () => {
    api.defaults.adapter = async (config) => {
      const url = config.url ?? "";
      const method = (config.method ?? "get").toLowerCase();

      if (url.includes("/projects/proj-10/archive") && method === "patch") {
        return {
          data: {
            success: true,
            message: "Project berhasil diarsipkan.",
            data: { id: "proj-10", deletedAt: new Date().toISOString() },
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      if (url.endsWith("/projects") && method === "post") {
        return {
          data: {
            success: true,
            message: "Project berhasil dibuat.",
            data: MOCK_PROJECT,
          },
          status: 201,
          statusText: "Created",
          headers: {},
          config,
        };
      }

      if (url.endsWith("/projects") && method === "get") {
        return {
          data: {
            success: true,
            message: "Daftar project berhasil diambil.",
            data: [MOCK_PROJECT],
            meta: {
              page: 1,
              pageSize: 10,
              totalItems: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
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

    const listRes = await projectApi.getProjects({ page: 1, pageSize: 10 });
    assert.equal(listRes.success, true);
    assert.equal(listRes.data.length, 1);
    assert.equal(listRes.data[0]?.code, "VLA01");

    const createRes = await projectApi.createProject({
      code: "VLA01",
      name: "Villa Ubud Bali",
      location: "Ubud, Bali",
      clientName: "PT Graha Indah",
      startDate: "2026-11-01",
      timezone: "Asia/Makassar",
      routineHolidays: [0],
    });
    assert.equal(createRes.id, "proj-10");

    const archiveRes = await projectApi.archiveProject("proj-10");
    assert.equal(archiveRes.id, "proj-10");
  });
});
