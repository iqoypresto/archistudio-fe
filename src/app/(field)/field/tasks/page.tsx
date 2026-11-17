import type { Metadata } from "next";
import { FieldTaskListContent } from "@/components/field/task/FieldTaskListContent";

export const instant = false;

export const metadata: Metadata = {
  title: "Tugas Lapor | ArchiStudio Lapangan",
};

export default function FieldTasksPage() {
  return <FieldTaskListContent />;
}
