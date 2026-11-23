import type { Metadata } from "next";
import { SupervisorHomeContent } from "@/components/field/home/SupervisorHomeContent";

export const instant = false;

export const metadata: Metadata = {
  title: "Home | ArchiStudio Lapangan",
};

export default function SupervisorHomePage() {
  return <SupervisorHomeContent />;
}
