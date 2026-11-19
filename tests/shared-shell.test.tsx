import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { AuthUserProfile, UserRole } from "@/types/api/auth.types";
import type { ProjectDetail } from "@/types/api/project.types";
import { useAuthStore } from "@/stores/auth.store";
import { getGlobalNavGroups, getProjectNavGroups } from "@/components/layout/workspace-nav.config";
import { ProjectWorkspaceShell } from "@/components/layout/ProjectWorkspaceShell";

const mocks = vi.hoisted(() => ({
  pathname: "/projects/project-allowed/document-in/reports/daily",
  push: vi.fn(),
  projectsQuery: vi.fn(),
  projectDetailQuery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: mocks.push, replace: vi.fn() }),
}));

vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
      React.createElement("a", { ...props, href }, children),
  };
});

vi.mock("@/hooks/project.hooks", () => ({
  useProjectsQuery: mocks.projectsQuery,
  useProjectDetailQuery: mocks.projectDetailQuery,
}));

vi.mock("@/hooks/auth.hooks", () => ({
  useLogoutMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const PROJECT: ProjectDetail = {
  id: "project-allowed",
  code: "VLA01",
  name: "Villa Ubud",
  location: "Ubud",
  clientName: "PT Graha",
  startDate: "2026-11-01",
  endDate: null,
  status: "BERJALAN",
  timezone: "Asia/Makassar",
  routineHolidays: [0],
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
  areas: [{ id: "area-1", code: "A1", name: "Area Satu" }],
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, isHydrated: false });
});

describe("TASK-10 AC-23.1 — shared workspace shell", () => {
  it("[AC-23.1 / BR-40] menampilkan menu global dan project sesuai role", () => {
    const ownerLinks = getGlobalNavGroups("OWNER").flatMap((group) => group.items.map((item) => item.href));
    const adminGroups = getGlobalNavGroups("ADMIN");
    const supervisorLinks = getGlobalNavGroups("SUPERVISOR").flatMap((group) => group.items.map((item) => item.href));

    expect(ownerLinks).toContain("/hr/freelance/payment");
    expect(ownerLinks).toContain("/hr/agent/payment");
    expect(adminGroups.some((group) => group.label === "Human Resources")).toBe(false);
    expect(supervisorLinks).toEqual(["/field/tasks", "/field/history", "/projects"]);
    expect(getProjectNavGroups(PROJECT.id, "OWNER").some((group) => group.label === "Document Out")).toBe(true);
    expect(getProjectNavGroups(PROJECT.id, "SUPERVISOR").some((group) => group.label === "Document In")).toBe(false);
  });

  it("[AC-23.1 / BR-03, BR-40] Project Switcher menampilkan scope API dan membuka project terpilih", () => {
    renderWorkspace("/projects", "SUPERVISOR");
    const switcher = screen.getAllByRole("combobox", { name: "Pilih project" })[0];
    const options = Array.from(switcher!.querySelectorAll("option")).map((option) => option.textContent ?? "");

    expect(options.some((option) => option.includes("VLA01") && option.includes("Villa Ubud"))).toBe(true);
    expect(options.some((option) => option.includes("SECRET"))).toBe(false);
    fireEvent.change(switcher!, { target: { value: PROJECT.id } });
    expect(mocks.push).toHaveBeenCalledWith(`/projects/${PROJECT.id}`);
  });

  it("[AC-23.1 / BR-40] header desktop dan drawer mobile menampilkan breadcrumb serta project aktif", async () => {
    renderWorkspace(`/projects/${PROJECT.id}/drawings`, "SUPERVISOR");
    const desktopBreadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(desktopBreadcrumb.textContent).toContain("VLA01");
    expect(desktopBreadcrumb.textContent).toContain("Villa Ubud");
    expect(desktopBreadcrumb.textContent).toContain("Drawing In/Out");

    fireEvent.click(screen.getByRole("button", { name: "Buka navigasi project" }));
    const drawer = await screen.findByRole("dialog");
    const mobileBreadcrumb = within(drawer).getByRole("navigation", { name: "Breadcrumb" });
    expect(mobileBreadcrumb.textContent).toContain("VLA01");
    expect(mobileBreadcrumb.textContent).toContain("Villa Ubud");
    expect(drawer.textContent).toContain("VLA01");
  });
});

function renderWorkspace(pathname: string, role: UserRole): void {
  mocks.pathname = pathname;
  setQueryResults();
  useAuthStore.setState({ user: makeUser(role), isHydrated: true });
  render(<ProjectWorkspaceShell projectId={PROJECT.id}><main>Konten project</main></ProjectWorkspaceShell>);
}

function setQueryResults(): void {
  mocks.projectsQuery.mockReturnValue({ data: projectListResponse(), isLoading: false, isError: false, refetch: vi.fn() });
  mocks.projectDetailQuery.mockReturnValue({ data: PROJECT, isLoading: false, isError: false, refetch: vi.fn() });
}

function projectListResponse() {
  return {
    success: true,
    message: "Daftar project.",
    data: [PROJECT],
    meta: { page: 1, pageSize: 100, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
  };
}

function makeUser(role: UserRole): AuthUserProfile {
  return { id: "supervisor-1", name: "Sari", username: "sari", phone: "081234567890", role, jobTitle: "Supervisor" };
}
