import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type AspectRatioProps = ComponentProps<"div"> & { ratio: number };

export function AspectRatio({ ratio, className, style, ...props }: AspectRatioProps) {
  return (
    <div
      {...props}
      className={cn(className)}
      style={{ ...style, aspectRatio: ratio }}
    />
  );
}
