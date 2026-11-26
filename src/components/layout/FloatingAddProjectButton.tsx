"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { ProjectFormModal } from "@/components/office/project/ProjectFormModal";
import { useCreateProjectMutation } from "@/hooks/project.hooks";
import type { UserRole } from "@/types/api/auth.types";
import {
  canShowFloatingAddProject,
  getOfficeProjectDetailHref,
} from "./floating-add-project.helpers";

export function FloatingAddProjectButton({ role }: { role?: UserRole | null }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createMutation = useCreateProjectMutation((createdProject) => {
    setIsModalOpen(false);
    router.push(getOfficeProjectDetailHref(createdProject.id));
  });

  if (!canShowFloatingAddProject(role)) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        aria-label="Tambah Project Baru"
        title="Tambah Project Baru"
        className="group fixed right-5 bottom-5 z-40 inline-flex h-12 min-w-12 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-[0_10px_28px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-white/25 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:translate-y-0 motion-reduce:transition-none sm:right-6 sm:bottom-6 sm:hover:px-4 sm:focus-visible:px-4"
      >
        <FolderPlus className="size-5 shrink-0" aria-hidden="true" />
        <span
          aria-hidden="true"
          className="hidden sm:inline-block sm:max-w-0 sm:overflow-hidden sm:whitespace-nowrap sm:opacity-0 sm:transition-[max-width,opacity,margin] sm:duration-200 sm:ease-out sm:group-hover:ml-2 sm:group-hover:max-w-36 sm:group-hover:opacity-100 sm:group-focus-visible:ml-2 sm:group-focus-visible:max-w-36 sm:group-focus-visible:opacity-100 motion-reduce:transition-none"
        >
          Tambah Project
        </span>
      </button>

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectToEdit={null}
        onSubmitCreate={(data) => createMutation.mutate(data)}
        onSubmitUpdate={() => {}}
        isSubmitting={createMutation.isPending}
      />
    </>
  );
}
