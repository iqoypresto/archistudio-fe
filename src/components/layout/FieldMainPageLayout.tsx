import type { ReactNode } from "react";
import { FieldMainPageContent } from "./FieldMainPageContent";
import { FieldPageHeader } from "./FieldPageHeader";

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
      <FieldPageHeader>{headerContent}</FieldPageHeader>
      <FieldMainPageContent overlap={overlap}>{children}</FieldMainPageContent>
    </>
  );
}
