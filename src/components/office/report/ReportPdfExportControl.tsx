"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfExportDialog } from "@/components/office/dashboard/PdfExportDialog";

export function ReportPdfExportControl() {
  const [open, setOpen] = useState(false);
  return <>
    <Button
      variant="outline"
      size="sm"
      className="h-9 gap-1.5 border-border bg-surface px-3 text-xs text-text-primary hover:bg-surface-active"
      onClick={() => setOpen(true)}
    >
      <FileDown className="size-3.5" /> Export PDF Harian
    </Button>
    {open && <PdfExportDialog isOpen onClose={() => setOpen(false)} />}
  </>;
}
