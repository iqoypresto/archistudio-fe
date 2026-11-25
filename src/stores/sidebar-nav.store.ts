import { create } from "zustand";

export interface SidebarNavState {
  projectSectionPreference: boolean | null;
  lastRouteWasProject: boolean | null;
  setProjectSectionOpen: (open: boolean) => void;
  syncProjectRoute: (isProjectRoute: boolean) => void;
  reset: () => void;
}

export function isProjectRoutePath(pathname: string): boolean {
  return pathname === "/projects" || pathname.startsWith("/projects/");
}

export function resolveProjectSectionOpen(
  preference: boolean | null,
  isProjectRoute: boolean,
  lastRouteWasProject: boolean | null,
): boolean {
  if (isProjectRoute) {
    if (lastRouteWasProject === false && preference === false) {
      return true;
    }
    return preference ?? true;
  }
  if (lastRouteWasProject === true) {
    return false;
  }
  return preference ?? false;
}

export const useSidebarNavStore = create<SidebarNavState>((set) => ({
  projectSectionPreference: null,
  lastRouteWasProject: null,

  setProjectSectionOpen: (open) => {
    set({ projectSectionPreference: open });
  },

  syncProjectRoute: (isProjectRoute) => {
    set((state) => {
      if (state.lastRouteWasProject === isProjectRoute) {
        return state;
      }

      if (isProjectRoute) {
        return {
          lastRouteWasProject: true,
          projectSectionPreference: null,
        };
      }

      return {
        lastRouteWasProject: false,
        projectSectionPreference:
          state.lastRouteWasProject === true ? null : state.projectSectionPreference,
      };
    });
  },

  reset: () => {
    set({
      projectSectionPreference: null,
      lastRouteWasProject: null,
    });
  },
}));
