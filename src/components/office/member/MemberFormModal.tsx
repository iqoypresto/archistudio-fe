"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth.store";
import {
  memberFormSchema,
  type MemberFormValues,
} from "@/lib/validation/user.validation";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserListItem,
} from "@/types/api/user.types";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: UserListItem | null;
  onSubmitCreate: (data: CreateUserPayload) => void;
  onSubmitUpdate: (id: string, data: UpdateUserPayload) => void;
  isSubmitting: boolean;
}

const EMPTY_MEMBER_VALUES: MemberFormValues = {
  name: "",
  username: "",
  phone: "",
  role: "SUPERVISOR",
  jobTitle: "Supervisor",
  password: "",
};

function buildMemberDefaults(userToEdit: UserListItem | null): MemberFormValues {
  if (!userToEdit) return EMPTY_MEMBER_VALUES;
  return {
    name: userToEdit.name,
    username: userToEdit.username,
    phone: userToEdit.phone,
    role: userToEdit.role === "ADMIN" ? "ADMIN" : "SUPERVISOR",
    jobTitle: userToEdit.jobTitle,
    password: "",
  };
}

export function MemberFormModal({
  isOpen,
  onClose,
  userToEdit,
  onSubmitCreate,
  onSubmitUpdate,
  isSubmitting,
}: MemberFormModalProps) {
  const currentActor = useAuthStore((state) => state.user);
  const isEditing = Boolean(userToEdit);
  const isAdminActor = currentActor?.role === "ADMIN";

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: EMPTY_MEMBER_VALUES,
  });

  useEffect(() => {
    reset(buildMemberDefaults(userToEdit));
  }, [userToEdit, reset, isOpen]);

  const onFormSubmit = (data: MemberFormValues) => {
    if (isEditing && userToEdit) {
      onSubmitUpdate(userToEdit.id, {
        name: data.name,
        username: data.username,
        phone: data.phone,
        role: data.role,
        jobTitle: data.jobTitle,
      });
    } else {
      if (!data.password || data.password.length < 6) {
        setError("password", { message: "Kata sandi minimal 6 karakter." });
        return;
      }
      onSubmitCreate({
        name: data.name,
        username: data.username,
        phone: data.phone,
        role: data.role,
        jobTitle: data.jobTitle,
        password: data.password,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Ubah Data Anggota" : "Tambah Anggota Baru"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui profil atau jabatan anggota tim."
              : "Buat akun anggota internal baru. Kata sandi dibuat manual tanpa pengiriman email."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" placeholder="Contoh: Budi Santoso" {...register("name")} />
            {errors.name && <p className="text-status-danger-fg text-xs">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="budis" {...register("username")} />
              {errors.username && (
                <p className="text-status-danger-fg text-xs">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Nomor HP</Label>
              <Input id="phone" placeholder="08123456789" {...register("phone")} />
              {errors.phone && (
                <p className="text-status-danger-fg text-xs">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="role">Peran (Role)</Label>
              <select
                id="role"
                {...register("role")}
                disabled={isAdminActor}
                className="border-border bg-surface text-text-primary focus:ring-primary h-9 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 disabled:opacity-60"
              >
                {!isAdminActor && <option value="ADMIN">Admin</option>}
                <option value="SUPERVISOR">Supervisor</option>
              </select>
              {isAdminActor && (
                <p className="text-text-secondary text-xs">Admin hanya dapat mengelola Supervisor.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jobTitle">Jabatan Paraf</Label>
              <Input id="jobTitle" placeholder="Supervisor Lapangan" {...register("jobTitle")} />
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="password">Kata Sandi Awal</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 6 karakter"
                {...register("password")}
                onChange={() => clearErrors("password")}
              />
              {errors.password && (
                <p className="text-status-danger-fg text-xs">{errors.password.message}</p>
              )}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="min-h-11">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-h-11">
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Buat Akun"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
