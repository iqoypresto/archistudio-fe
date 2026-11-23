import { redirect } from "next/navigation";

export const instant = false;

export default function FieldTasksPage() {
  redirect("/field/reports");
}
