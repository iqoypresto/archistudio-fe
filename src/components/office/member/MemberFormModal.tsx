"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRoleLabel } from "@/lib/utils/role";
import { memberFormSchema, type MemberFormValues } from "@/lib/validation/user.validation";
import { useAuthStore } from "@/stores/auth.store";
import type { CreateUserPayload, UpdateUserPayload, UserListItem } from "@/types/api/user.types";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: UserListItem | null;
  onSubmitCreate: (data: CreateUserPayload) => void;
  onSubmitUpdate: (id: string, data: UpdateUserPayload) => void;
  isSubmitting: boolean;
}

const EMPTY_VALUES: MemberFormValues = {
  name: "", username: "", phone: "", role: "SUPERVISOR", jobTitle: "Supervisor", password: "",
};

function buildDefaults(user: UserListItem | null): MemberFormValues {
  if (!user) return EMPTY_VALUES;
  const role = user.role === "ADMIN" || user.role === "SITE_MANAGER" ? user.role : "SUPERVISOR";
  return { name: user.name, username: user.username, phone: user.phone, role, jobTitle: user.jobTitle, password: "" };
}

export function MemberFormModal({
  isOpen, onClose, userToEdit, onSubmitCreate, onSubmitUpdate, isSubmitting,
}: MemberFormModalProps) {
  const currentActor = useAuthStore((state) => state.user);
  const isEditing = Boolean(userToEdit);
  const isAdminActor = currentActor?.role === "ADMIN";
  const { register, handleSubmit, reset, control, setError, clearErrors, formState: { errors } } =
    useForm<MemberFormValues>({ resolver: zodResolver(memberFormSchema), defaultValues: EMPTY_VALUES });

  useEffect(() => {
    reset(buildDefaults(userToEdit));
  }, [userToEdit, reset, isOpen]);

  const onFormSubmit = (data: MemberFormValues) => {
    if (isEditing && userToEdit) {
      onSubmitUpdate(userToEdit.id, {
        name: data.name, username: data.username, phone: data.phone, role: data.role, jobTitle: data.jobTitle,
      });
      return;
    }
    if (!data.password || data.password.length < 6) {
      setError("password", { message: "Kata sandi minimal 6 karakter." });
      return;
    }
    onSubmitCreate({
      name: data.name, username: data.username, phone: data.phone,
      role: data.role, jobTitle: data.jobTitle, password: data.password,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Ubah Data Anggota" : "Tambah Anggota Baru"}</DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Perbarui identitas, peran, atau jabatan paraf anggota tim."
              : "Buat akun internal baru dengan kata sandi manual tanpa pengiriman email."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold tracking-wider text-text-muted uppercase">
              Identitas &amp; Akses Login
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">Nama Lengkap</Label>
              <Input id="name" placeholder="Contoh: Budi Santoso" className="h-9 text-xs" {...register("name")} />
              {errors.name && <p className="text-xs text-status-danger-fg">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-medium">Username</Label>
                <Input id="username" placeholder="budis" className="h-9 text-xs" {...register("username")} />
                {errors.username && <p className="text-xs text-status-danger-fg">{errors.username.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium">Nomor HP</Label>
                <Input id="phone" placeholder="08123456789" className="h-9 text-xs tabular-nums" {...register("phone")} />
                {errors.phone && <p className="text-xs text-status-danger-fg">{errors.phone.message}</p>}
              </div>
            </div>

            {!isEditing && (
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">Kata Sandi Awal</Label>
                <PasswordInput
                  id="password"
                  placeholder="Minimal 6 karakter"
                  className="h-9 text-xs"
                  {...register("password", { onChange: () => clearErrors("password") })}
                />
                {errors.password && <p className="text-xs text-status-danger-fg">{errors.password.message}</p>}
              </div>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-3.5">
            <p className="text-[11px] font-semibold tracking-wider text-text-muted uppercase">
              Peran &amp; Paraf Laporan
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-medium">Peran</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      disabled={isAdminActor}
                      onValueChange={(val: string | null) =>
                        field.onChange(val === "ADMIN" || val === "SITE_MANAGER" ? val : "SUPERVISOR")
                      }
                    >
                      <SelectTrigger id="role" className="h-9 text-xs">
                        <SelectValue placeholder="Pilih Peran">{getRoleLabel(field.value)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {!isAdminActor && <SelectItem value="ADMIN">Admin</SelectItem>}
                        {!isAdminActor && <SelectItem value="SITE_MANAGER">Site Manager</SelectItem>}
                        <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {isAdminActor && <p className="text-[11px] text-text-muted">Admin hanya dapat mengelola Supervisor.</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jobTitle" className="text-xs font-medium">Jabatan Paraf</Label>
                <Input id="jobTitle" placeholder="Supervisor Lapangan" className="h-9 text-xs" {...register("jobTitle")} />
                <p className="text-[11px] text-text-muted">Tampil pada blok paraf laporan &amp; PDF.</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-9">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-9">
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Buat Akun"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
