import { useWatch, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  NO_WORK_REASONS,
  type ReportFormValues,
} from "@/lib/validation/report.validation";
import { cn } from "@/lib/utils";

export function NoWorkReportFields({
  form,
  disabled,
}: {
  form: UseFormReturn<ReportFormValues>;
  disabled?: boolean;
}) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = form;
  const currentReason = useWatch({ control, name: "noWorkReason" }) ?? "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-semibold text-text-primary">
          Alasan Tidak Ada Pekerjaan
        </Label>
        <div className="grid grid-cols-2 gap-2.5">
          {NO_WORK_REASONS.map((reason) => {
            const active =
              reason === "Lainnya"
                ? currentReason.length > 0 &&
                  !NO_WORK_REASONS.slice(0, 3).includes(
                    currentReason as (typeof NO_WORK_REASONS)[number]
                  )
                : currentReason === reason;
            return (
              <Button
                key={reason}
                type="button"
                disabled={disabled}
                variant="outline"
                aria-pressed={active}
                onClick={() =>
                  setValue("noWorkReason", reason === "Lainnya" ? "" : reason, {
                    shouldValidate: true,
                  })
                }
                className={cn(
                  "h-auto min-h-12 rounded-xl px-3 py-2 text-base font-medium transition-colors",
                  active
                    ? "border-[#c98f6d] bg-primary-soft font-semibold text-primary shadow-2xs"
                    : "border-border bg-surface-input text-text-secondary hover:bg-surface-active/60"
                )}
              >
                {reason}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="noWorkReason" className="text-base font-semibold text-text-primary">
          Keterangan Alasan
        </Label>
        <Textarea
          id="noWorkReason"
          rows={3}
          disabled={disabled}
          placeholder="Jelaskan kondisi lapangan (wajib disertai minimal 1 foto bukti)"
          className="w-full rounded-xl border-border bg-surface-input p-3 text-base text-text-primary focus-visible:ring-ring"
          {...register("noWorkReason")}
        />
        {errors.noWorkReason && (
          <p className="text-sm font-medium text-status-danger-fg">
            {errors.noWorkReason.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="locationText" className="text-base font-semibold text-text-primary">
          Catatan Lokasi (Opsional)
        </Label>
        <Input
          id="locationText"
          type="text"
          disabled={disabled}
          placeholder="Contoh: Gerbang Utama Proyek"
          className="min-h-12 text-base"
          {...register("locationText")}
        />
      </div>
    </div>
  );
}
