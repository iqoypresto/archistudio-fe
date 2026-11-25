import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { getProjectNavGroups } from "@/components/layout/workspace-nav.config";
import {
  isProjectRoutePath,
  resolveProjectSectionOpen,
  useSidebarNavStore,
} from "@/stores/sidebar-nav.store";

function computeOpen(pathname: string): boolean {
  const state = useSidebarNavStore.getState();
  return resolveProjectSectionOpen(
    state.projectSectionPreference,
    isProjectRoutePath(pathname),
    state.lastRouteWasProject,
  );
}

describe("Sidebar Project Dropdown Interactivity", () => {
  beforeEach(() => useSidebarNavStore.getState().reset());

  it("detects canonical Office and Field project routes, not the legacy redirect route", () => {
    assert.equal(isProjectRoutePath("/office/dashboard"), false);
    assert.equal(isProjectRoutePath("/office/projects"), true);
    assert.equal(isProjectRoutePath("/office/projects/proj-1"), true);
    assert.equal(isProjectRoutePath("/field/projects/proj-1/drawings"), true);
    assert.equal(isProjectRoutePath("/projects"), false);
    assert.equal(computeOpen("/office/dashboard"), false);
    assert.equal(computeOpen("/office/projects"), true);
    assert.equal(computeOpen("/field/projects/proj-1/drawings"), true);
  });

  it("keeps the project section open across route remounts and project switches", () => {
    useSidebarNavStore.getState().syncProjectRoute(false);
    assert.equal(computeOpen("/office/dashboard"), false);
    useSidebarNavStore.getState().setProjectSectionOpen(true);
    assert.equal(computeOpen("/office/dashboard"), true);
    useSidebarNavStore.getState().syncProjectRoute(false);
    assert.equal(computeOpen("/office/reports"), true);
    assert.equal(computeOpen("/office/projects"), true);
    useSidebarNavStore.getState().syncProjectRoute(true);
    assert.equal(computeOpen("/office/projects"), true);
    assert.equal(computeOpen("/office/projects/proj-a"), true);
    assert.equal(computeOpen("/office/projects/proj-b/comms/in"), true);
    assert.equal(computeOpen("/office/projects"), true);
  });

  it("respects a manual close while inside Office project routes", () => {
    useSidebarNavStore.getState().syncProjectRoute(true);
    useSidebarNavStore.getState().setProjectSectionOpen(false);
    assert.equal(computeOpen("/office/projects/proj-a"), false);
    assert.equal(computeOpen("/office/projects/proj-a/drawings"), false);
    assert.equal(computeOpen("/office/dashboard"), false);
    useSidebarNavStore.getState().syncProjectRoute(false);
    assert.equal(computeOpen("/office/dashboard"), false);
    assert.equal(computeOpen("/office/projects/proj-b"), true);
  });

  it("closes cleanly when leaving project routes for Office routes", () => {
    useSidebarNavStore.getState().syncProjectRoute(true);
    useSidebarNavStore.getState().setProjectSectionOpen(true);
    assert.equal(computeOpen("/office/projects/proj-a"), true);
    assert.equal(computeOpen("/office/dashboard"), false);
    useSidebarNavStore.getState().syncProjectRoute(false);
    assert.equal(computeOpen("/office/dashboard"), false);
  });

  it("resets cleanly on logout", () => {
    useSidebarNavStore.getState().syncProjectRoute(false);
    useSidebarNavStore.getState().setProjectSectionOpen(true);
    assert.equal(computeOpen("/office/dashboard"), true);
    useSidebarNavStore.getState().reset();
    assert.equal(computeOpen("/office/dashboard"), false);
    assert.equal(computeOpen("/office/projects"), true);
  });

  it("keeps the Office project navigation structure and canonical hrefs", () => {
    const ownerGroups = getProjectNavGroups("proj-1", "OWNER");
    assert.equal(ownerGroups.length, 4);
    assert.equal(ownerGroups[0].collapsible, false);
    assert.equal(ownerGroups[0].showLabel, false);
    assert.deepEqual(ownerGroups[0].items.map((item) => item.label), ["Overview & Area", "Drawing"]);
    assert.deepEqual(ownerGroups[0].items.map((item) => item.href), [
      "/office/projects/proj-1",
      "/office/projects/proj-1/drawings",
    ]);
    const collapsibleGroups = ownerGroups.slice(1);
    assert.deepEqual(collapsibleGroups.map((group) => group.label), ["Comms", "Document Out", "Document In"]);
    for (const group of collapsibleGroups) {
      assert.equal(group.collapsible, true);
      assert.ok(group.icon, `Expected explicit icon on collapsible group "${group.label}"`);
    }
    for (const group of ownerGroups) {
      for (const item of group.items) assert.equal(item.icon, undefined);
    }
  });
});
