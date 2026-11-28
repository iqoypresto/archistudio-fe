"use client";

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

export interface PageInfoDialogProps {
  title: string;
  description: string;
  points?: string[];
}

export function PageInfoDialog({ title, description, points }: PageInfoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={title}
            title={title}
            className="size-8 text-text-muted hover:text-text-primary"
          />
        }
      >
        <Info className="size-4" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {points && points.length > 0 && (
          <ul className="-mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
