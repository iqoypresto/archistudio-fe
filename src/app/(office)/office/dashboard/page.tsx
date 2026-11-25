import type { Metadata } from "next";
import { DashboardContent } from "@/components/office/dashboard/DashboardContent";

export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard Monitoring | ArchiStudio Office",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
