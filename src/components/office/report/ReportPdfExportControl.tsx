"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfExportDialog } from "@/components/office/dashboard/PdfExportDialog";

export function ReportPdfExportControl() {
  const [open, setOpen] = useState(false);
  return <>
    <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
      <FileDown className="size-4" /> Export PDF Harian
    </Button>
    <PdfExportDialog isOpen={open} onClose={() => setOpen(false)} />
  </>;
}
