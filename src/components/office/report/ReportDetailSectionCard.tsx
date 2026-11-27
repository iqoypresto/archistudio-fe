import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportDetailSectionCard({
  title,
  children,
  trailing,
  contentClassName = "p-3",
}: {
  title: string;
  children: ReactNode;
  trailing?: ReactNode;
  contentClassName?: string;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-[1rem] border-[#ead9cc] bg-[#fffdfb] py-0 shadow-none ring-0">
      <CardHeader className="flex flex-row items-center justify-between gap-2 bg-[#f6e8df] px-3.5 py-2">
        <CardTitle className="min-w-0 break-words text-sm font-bold text-[#9c471d]">
          {title}
        </CardTitle>
        {trailing}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
