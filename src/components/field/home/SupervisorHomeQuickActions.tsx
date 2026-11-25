"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, FileImage, Layers3, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectsQuery } from "@/hooks/project.hooks";

export function SupervisorHomeQuickActions() {
  const [isPickerOpen, setPickerOpen] = useState(false);
  const projectsQuery = useProjectsQuery({ page: 1, pageSize: 100 }, { enabled: isPickerOpen, surface: "field" });
  const projects = projectsQuery.data?.data ?? [];

  function openDrawings(): void {
    setPickerOpen(true);
  }

  return (
    <>
      <section aria-label="Akses cepat" className="mt-3 grid grid-cols-2 gap-3">
        <Button type="button" onClick={openDrawings} className="min-h-[5.75rem] gap-1.5 rounded-2xl bg-[#557b8d] px-1 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#466b7c] min-[360px]:gap-2 min-[360px]:px-2 min-[360px]:text-base">
          <FileImage className="size-6 shrink-0 sm:size-7" aria-hidden="true" />
          Gambar Kerja
        </Button>
        <Link href="/field/projects" className="inline-flex min-h-[5.75rem] items-center justify-center gap-1.5 rounded-2xl bg-[#707354] px-1 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#5f6247] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f6247] min-[360px]:gap-2 min-[360px]:px-2 min-[360px]:text-base">
          <Layers3 className="size-6 shrink-0 sm:size-7" aria-hidden="true" />
          Project Saya
        </Link>
      </section>
      <Sheet open={isPickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="max-h-[82svh] rounded-t-3xl border-[#e9e1db] bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-[#24211f]">
          <SheetHeader className="px-1 pt-6">
            <SheetTitle className="text-xl font-bold text-[#24211f]">Pilih project</SheetTitle>
            <SheetDescription className="text-base text-[#625c57]">Pilih project untuk membuka gambar kerja.</SheetDescription>
          </SheetHeader>
          <Button type="button" variant="ghost" aria-label="Tutup pilihan project" onClick={() => setPickerOpen(false)} className="absolute right-3 top-3 size-12 rounded-full text-[#625c57]">
            <X className="size-5" />
          </Button>
          <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-2">
            {projectsQuery.isLoading ? <ProjectPickerLoading />
              : projectsQuery.isError ? <ProjectPickerError retry={() => void projectsQuery.refetch()} />
                : projects.length === 0 ? <ProjectPickerEmpty />
                  : projects.map((project) => (
                    <Link key={project.id} href={`/field/projects/${project.id}/drawings`} onClick={() => setPickerOpen(false)} className="flex min-h-16 items-center gap-3 border-b border-[#eee7e1] py-3 focus-visible:outline-2 focus-visible:outline-[#694632]">
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-bold text-[#24211f]">{project.name}</span>
                        <span className="mt-1 flex items-center gap-1 text-sm text-[#625c57]"><MapPin className="size-4 shrink-0" />{project.location}</span>
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-[#694632]" />
                    </Link>
                  ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function ProjectPickerLoading() {
  return <div aria-busy="true" aria-label="Memuat project" className="space-y-3 py-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>;
}

function ProjectPickerError({ retry }: { retry: () => void }) {
  return <div className="py-4"><p className="text-base text-[#5d5854]">Daftar project belum dapat dimuat.</p><Button type="button" variant="outline" onClick={retry} className="mt-3 min-h-12">Coba lagi</Button></div>;
}

function ProjectPickerEmpty() {
  return <p className="py-4 text-base text-[#5d5854]">Belum ada project aktif yang bisa dipilih.</p>;
}
