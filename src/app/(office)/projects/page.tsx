import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectListContent } from "@/components/office/project/ProjectListContent";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Project & Area"
        description="Kelola master proyek konstruksi, jadwal pelaksanaan, zona waktu IANA, dan hari libur rutin mingguan."
      />
      <ProjectListContent />
    </div>
  );
}
