"use client";

import { Label } from "@/components/ui/label";
import { DAY_OF_WEEK_OPTIONS } from "@/lib/validation/project.validation";

interface RoutineHolidaysFieldProps {
  value: number[];
  onChange: (value: number[]) => void;
}

export function RoutineHolidaysField({ value, onChange }: RoutineHolidaysFieldProps) {
  const toggleDay = (day: number) => {
    const next = value.includes(day)
      ? value.filter((v) => v !== day)
      : [...value, day];
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      <Label>Hari Libur Rutin Mingguan (BR-11)</Label>
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {DAY_OF_WEEK_OPTIONS.map((day) => {
          const isSelected = value?.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`h-8 rounded-md px-2.5 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-subtle text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
