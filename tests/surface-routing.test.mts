import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FIELD_BOTTOM_TABS } from "@/components/layout/field-bottom-nav.config";
import { getGlobalNavGroups, getProjectNavGroups } from "@/components/layout/workspace-nav.config";
import { api } from "@/lib/api/axios";
import { apiSurfacePath } from "@/lib/api/api-surface";
import { projectApi } from "@/lib/api/project.api";
import { resolveLegacyProjectPath } from "@/lib/routing/legacy-project-path";
import { getDefaultRouteForRole } from "@/stores/auth.store";

describe("TASK-22 frontend route surfaces (AC-23.1, AC-23.2, BR-03, BR-40)", () => {
  it("normalizes API paths under the requested surface", () => {
    assert.equal(apiSurfacePath("office", "/projects"), "/office/projects");
    assert.equal(apiSurfacePath("field", "reports/my-areas-status"), "/field/reports/my-areas-status");
  });

  it("routes default and legacy Project URLs by role", () => {
    assert.equal(getDefaultRouteForRole("OWNER"), "/office/dashboard");
    assert.equal(getDefaultRouteForRole("ADMIN"), "/office/dashboard");
    assert.equal(getDefaultRouteForRole("SUPERVISOR"), "/field/home");
    assert.equal(getDefaultRouteForRole("SITE_MANAGER"), "/field/home");
    assert.equal(resolveLegacyProjectPath("OWNER"), "/office/projects");
    assert.equal(resolveLegacyProjectPath("SUPERVISOR"), "/field/projects");
    assert.equal(resolveLegacyProjectPath("ADMIN", "p-1", ["document-out"]), "/office/projects/p-1/document-out");
    assert.equal(resolveLegacyProjectPath("SUPERVISOR", "p-1", ["drawings"]), "/field/projects/p-1/drawings");
    assert.equal(resolveLegacyProjectPath("SITE_MANAGER", "p-1", ["comms", "in"]), "/field/projects/p-1/comms/in");
    assert.equal(resolveLegacyProjectPath("SUPERVISOR", "p-1", ["document-out"]), "/field/projects/p-1");
  });

  it("provides four canonical Field bottom-navigation tabs", () => {
    assert.deepEqual(FIELD_BOTTOM_TABS.map(({ href, label }) => [href, label]), [
      ["/field/home", "Beranda"],
      ["/field/reports", "Laporan"],
      ["/field/history", "Riwayat"],
      ["/field/projects", "Project"],
    ]);
  });

  it("keeps global and project navigation inside each role surface", () => {
    const fieldHrefs = getGlobalNavGroups("SUPERVISOR").flatMap((group) => group.items.map((item) => item.href));
    const officeHrefs = getGlobalNavGroups("OWNER").flatMap((group) => group.items.map((item) => item.href));
    assert.ok(fieldHrefs.every((href) => href.startsWith("/field/")));
    assert.ok(officeHrefs.every((href) => href.startsWith("/office/")));
    assert.ok(getProjectNavGroups("p-1", "SUPERVISOR")[0].items.every((item) => item.href.startsWith("/field/")));
    assert.ok(getProjectNavGroups("p-1", "OWNER")[0].items.every((item) => item.href.startsWith("/office/")));
  });

  it("uses the canonical API namespace for Office and Field project lists", async () => {
    const originalAdapter = api.defaults.adapter;
    const requestedUrls: string[] = [];
    api.defaults.adapter = async (config) => {
      requestedUrls.push(config.url ?? "");
      return {
        data: {
          success: true,
          message: "ok",
          data: [],
          meta: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };
    try {
      await projectApi.getProjects({ page: 1, pageSize: 10 }, "office");
      await projectApi.getProjects({ page: 1, pageSize: 10 }, "field");
    } finally {
      api.defaults.adapter = originalAdapter;
    }
    assert.ok(requestedUrls[0]?.endsWith("/office/projects"));
    assert.ok(requestedUrls[1]?.endsWith("/field/projects"));
  });
});
