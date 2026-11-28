import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PaginationPageSizeSelect({
  value,
  options,
  disabled,
  onChange,
}: {
  value: number;
  options: readonly number[];
  disabled: boolean;
  onChange: (size: number) => void;
}) {
  const normalizedOptions = options.includes(value)
    ? options
    : [...options, value].sort((a, b) => a - b);

  return (
    <div className="flex items-center gap-2 text-xs text-text-secondary">
      <span>Baris</span>
      <Select
        value={String(value)}
        disabled={disabled}
        onValueChange={(next: string | null) => {
          const parsed = Number(next);
          if (Number.isInteger(parsed) && parsed > 0 && parsed !== value) {
            onChange(parsed);
          }
        }}
      >
        <SelectTrigger aria-label="Jumlah baris per halaman" className="h-10 w-28 text-xs tabular-nums md:h-8 md:w-25">
          <SelectValue>{value} / hal</SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {normalizedOptions.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size} / hal
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
