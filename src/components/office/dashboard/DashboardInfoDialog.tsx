import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DashboardInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Tentang Dashboard Monitoring"
            title="Tentang Dashboard Monitoring"
          />
        }
      >
        <Info className="size-4" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tentang Dashboard Monitoring</DialogTitle>
          <DialogDescription>
            Dashboard ini membantu memantau pelaporan harian melalui:
          </DialogDescription>
        </DialogHeader>
        <ul className="-mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Status laporan hari ini untuk setiap area.</li>
          <li>Filter project dan status untuk mempersempit daftar area.</li>
          <li>Rekap keterlambatan supervisor dan area yang tertunggak.</li>
          <li>Export PDF laporan berdasarkan project dan tanggal pilihan.</li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
