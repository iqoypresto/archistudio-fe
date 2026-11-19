import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectWorkspaceShell } from "@/components/layout/ProjectWorkspaceShell";
import { ProjectListContent } from "@/components/office/project/ProjectListContent";

export const instant = false;

export default function ProjectsPage() {
  return (
    <ProjectWorkspaceShell>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <PageHeader title="Semua Project" description="Pilih project sesuai hak akses Anda." />
        <ProjectListContent />
      </div>
    </ProjectWorkspaceShell>
  );
}
