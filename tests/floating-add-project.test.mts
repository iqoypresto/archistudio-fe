import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canShowFloatingAddProject,
  getOfficeProjectDetailHref,
} from "@/components/layout/floating-add-project.helpers";

describe("Floating Add Project Shortcut", () => {
  it("hanya menampilkan shortcut untuk role OWNER dan ADMIN", () => {
    assert.equal(canShowFloatingAddProject("OWNER"), true);
    assert.equal(canShowFloatingAddProject("ADMIN"), true);
    assert.equal(canShowFloatingAddProject("SITE_MANAGER"), false);
    assert.equal(canShowFloatingAddProject("SUPERVISOR"), false);
    assert.equal(canShowFloatingAddProject(undefined), false);
    assert.equal(canShowFloatingAddProject(null), false);
  });

  it("membentuk route detail project kanonis pada Office surface", () => {
    assert.equal(getOfficeProjectDetailHref("proj-42"), "/office/projects/proj-42");
  });
});
