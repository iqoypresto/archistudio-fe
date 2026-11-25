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
  beforeEach(() => {
    useSidebarNavStore.getState().reset();
  });

  it("auto-opens on /projects and /projects/[id] routes, closed by default on office routes", () => {
    assert.equal(isProjectRoutePath("/dashboard"), false);
    assert.equal(isProjectRoutePath("/projects"), true);
    assert.equal(isProjectRoutePath("/projects/proj-1"), true);
    assert.equal(isProjectRoutePath("/projects/proj-1/drawings"), true);

    assert.equal(computeOpen("/dashboard"), false);
    assert.equal(computeOpen("/projects"), true);
    assert.equal(computeOpen("/projects/proj-1/drawings"), true);
  });

  it("stays open across (office) -> (project) remount and across project switches", () => {
    useSidebarNavStore.getState().syncProjectRoute(false);
    assert.equal(computeOpen("/dashboard"), false);

    // User opens Project dropdown on /dashboard
    useSidebarNavStore.getState().setProjectSectionOpen(true);
    assert.equal(computeOpen("/dashboard"), true);

    // Navigating to another office route keeps user's open preference
    useSidebarNavStore.getState().syncProjectRoute(false);
    assert.equal(computeOpen("/reports"), true);

    // Navigating to /projects (remounts OfficeAppShell) stays open immediately
    assert.equal(computeOpen("/projects"), true);
    useSidebarNavStore.getState().syncProjectRoute(true);
    assert.equal(computeOpen("/projects"), true);

    // Selecting project A -> switching to project B -> back to /projects all stay open
    assert.equal(computeOpen("/projects/proj-a"), true);
    assert.equal(computeOpen("/projects/proj-b"), true);
    assert.equal(computeOpen("/projects/proj-b/comms/in"), true);
    assert.equal(computeOpen("/projects"), true);
  });

  it("respects manual close while inside project routes, and auto-opens again after leaving and re-entering", () => {
    useSidebarNavStore.getState().syncProjectRoute(true);
    assert.equal(computeOpen("/projects/proj-a"), true);

    // User manually closes dropdown while in /projects/proj-a
    useSidebarNavStore.getState().setProjectSectionOpen(false);
    assert.equal(computeOpen("/projects/proj-a"), false);
    assert.equal(computeOpen("/projects/proj-a/drawings"), false);

    // User leaves to /dashboard
    assert.equal(computeOpen("/dashboard"), false);
    useSidebarNavStore.getState().syncProjectRoute(false);
    assert.equal(computeOpen("/dashboard"), false);

    // Later enters /projects/proj-b from dashboard -> auto-opens again
    assert.equal(computeOpen("/projects/proj-b"), true);
    useSidebarNavStore.getState().syncProjectRoute(true);
    assert.equal(computeOpen("/projects/proj-b"), true);
  });

  it("closes cleanly without flicker when leaving project routes back to office routes", () => {
    useSidebarNavStore.getState().syncProjectRoute(true);
    useSidebarNavStore.getState().setProjectSectionOpen(true);
    assert.equal(computeOpen("/projects/proj-a"), true);

    // Frame 0 on /dashboard before syncProjectRoute(false) runs
    assert.equal(computeOpen("/dashboard"), false);
    useSidebarNavStore.getState().syncProjectRoute(false);
    assert.equal(computeOpen("/dashboard"), false);
  });

  it("resets cleanly on logout", () => {
    useSidebarNavStore.getState().syncProjectRoute(false);
    useSidebarNavStore.getState().setProjectSectionOpen(true);
    assert.equal(computeOpen("/dashboard"), true);

    useSidebarNavStore.getState().reset();
    assert.equal(computeOpen("/dashboard"), false);
    assert.equal(computeOpen("/projects"), true);
  });

  it("structures project nav groups like Human Resources (flat Overview/Drawing, iconless child items, explicit group icons)", () => {
    const ownerGroups = getProjectNavGroups("proj-1", "OWNER");
    assert.equal(ownerGroups.length, 4);

    // Primary project items sit directly under switcher without duplicate "Project" accordion
    assert.equal(ownerGroups[0].collapsible, false);
    assert.equal(ownerGroups[0].showLabel, false);
    assert.deepEqual(
      ownerGroups[0].items.map((item) => item.label),
      ["Overview & Area", "Drawing"],
    );

    // Collapsible sub-groups carry explicit header icons; all child items are text-only (no icons)
    const collapsibleGroups = ownerGroups.slice(1);
    assert.deepEqual(
      collapsibleGroups.map((group) => group.label),
      ["Comms", "Document Out", "Document In"],
    );
    for (const group of collapsibleGroups) {
      assert.equal(group.collapsible, true);
      assert.ok(group.icon, `Expected explicit icon on collapsible group "${group.label}"`);
    }
    for (const group of ownerGroups) {
      for (const item of group.items) {
        assert.equal(item.icon, undefined, `Expected iconless child item "${item.label}"`);
      }
    }
  });
});
