"use client";

import { Label } from "@/components/ui/label";
import { DAY_OF_WEEK_OPTIONS } from "@/lib/validation/project.validation";
import { cn } from "@/lib/utils";

interface RoutineHolidaysFieldProps {
  value: number[];
  onChange: (value: number[]) => void;
}

export function RoutineHolidaysField({ value, onChange }: RoutineHolidaysFieldProps) {
  const toggleDay = (day: number) => {
    const next = value.includes(day) ? value.filter((v) => v !== day) : [...value, day];
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">Hari Libur Rutin Mingguan</Label>
      <div className="grid grid-cols-7 gap-1.5">
        {DAY_OF_WEEK_OPTIONS.map((day) => {
          const isSelected = value?.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleDay(day.value)}
              className={cn(
                "h-8 rounded-lg border text-xs font-medium transition-colors",
                isSelected
                  ? "border-white/20 bg-primary text-text-primary"
                  : "border-border bg-surface-input text-text-secondary hover:text-text-primary",
              )}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
