import type { ReactNode } from "react";
import { FieldMainPageContent } from "./FieldMainPageContent";
import { FieldMainPageHeader } from "./FieldMainPageHeader";

export function FieldMainPageLayout({
  headerContent,
  children,
  overlap,
}: {
  headerContent: ReactNode;
  children: ReactNode;
  overlap?: "standard" | "raised";
}) {
  return (
    <>
      <FieldMainPageHeader>{headerContent}</FieldMainPageHeader>
      <FieldMainPageContent overlap={overlap}>{children}</FieldMainPageContent>
    </>
  );
}
