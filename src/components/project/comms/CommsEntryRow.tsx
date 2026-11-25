import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatIdDate } from "@/lib/utils/office-format";
import { getRoleLabel } from "@/lib/utils/role";
import { getCommsDirectionLabel } from "@/lib/validation/comms.validation";
import type { CommsEntryItem } from "@/types/api/comms.types";

interface CommsEntryRowProps {
  entry: CommsEntryItem;
  showDirection: boolean;
  canEdit: boolean;
  onEdit: (entry: CommsEntryItem) => void;
}

export function CommsEntryRow({ entry, showDirection, canEdit, onEdit }: CommsEntryRowProps) {
  return (
    <article className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-surface-input/30 sm:flex-row sm:items-start sm:justify-between sm:px-5">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-muted">
          <span className="font-medium text-text-secondary">{formatIdDate(entry.entryDate)}</span>
          {showDirection && (
            <>
              <span>·</span>
              <span>{getCommsDirectionLabel(entry.direction)}</span>
            </>
          )}
          {entry.createdBy && (
            <>
              <span>·</span>
              <span>
                {entry.createdBy.name} ({getRoleLabel(entry.createdBy.role)})
              </span>
            </>
          )}
        </div>
        <h3 className="text-sm font-semibold text-text-primary">{entry.subject}</h3>
        {entry.note && (
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-text-secondary">
            {entry.note}
          </p>
        )}
        {entry.attachmentViewUrl && (
          <div className="pt-1">
            <a
              href={entry.attachmentViewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-input px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-surface-active hover:text-text-primary"
            >
              <Paperclip className="size-3" />
              <span>{entry.attachmentName ?? "Lampiran"}</span>
            </a>
          </div>
        )}
      </div>

      {canEdit && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0 self-start px-2.5 text-xs text-text-secondary hover:text-text-primary"
          onClick={() => onEdit(entry)}
        >
          Ubah
        </Button>
      )}
    </article>
  );
}
