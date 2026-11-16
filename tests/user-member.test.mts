import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { api } from "@/lib/api/axios";
import { userApi } from "@/lib/api/user.api";
import {
  memberFormSchema,
  resetPasswordFormSchema,
} from "@/lib/validation/user.validation";
import type { UserListItem } from "@/types/api/user.types";

const MOCK_USER: UserListItem = {
  id: "user-10",
  name: "Budi Santoso",
  username: "budis",
  phone: "081234567890",
  role: "SUPERVISOR",
  jobTitle: "Supervisor Lapangan",
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("TASK-03 Frontend User Management — Unit Tests", () => {
  const originalAdapter = api.defaults.adapter;

  beforeEach(() => {
    // Reset state before each test
  });

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
  });

  it("[Validation] memberFormSchema menolak nama kosong, username < 3, atau nomor HP non-angka", () => {
    const invalidName = memberFormSchema.safeParse({
      name: "   ",
      username: "budi",
      phone: "08123456789",
      role: "SUPERVISOR",
    });
    assert.equal(invalidName.success, false);

    const invalidUsername = memberFormSchema.safeParse({
      name: "Budi",
      username: "bu",
      phone: "08123456789",
      role: "SUPERVISOR",
    });
    assert.equal(invalidUsername.success, false);

    const invalidPhone = memberFormSchema.safeParse({
      name: "Budi",
      username: "budis",
      phone: "telepon-budi",
      role: "SUPERVISOR",
    });
    assert.equal(invalidPhone.success, false);

    const valid = memberFormSchema.safeParse({
      name: "Budi Santoso",
      username: "budis.lapangan",
      phone: "081234567890",
      role: "SUPERVISOR",
      jobTitle: "Supervisor",
    });
    assert.equal(valid.success, true);
  });

  it("[Validation] resetPasswordFormSchema menolak password < 6 dan konfirmasi tidak cocok", () => {
    const tooShort = resetPasswordFormSchema.safeParse({
      newPassword: "123",
      confirmPassword: "123",
    });
    assert.equal(tooShort.success, false);

    const mismatch = resetPasswordFormSchema.safeParse({
      newPassword: "password123",
      confirmPassword: "passwordBerbeda",
    });
    assert.equal(mismatch.success, false);

    const valid = resetPasswordFormSchema.safeParse({
      newPassword: "password123",
      confirmPassword: "password123",
    });
    assert.equal(valid.success, true);
  });

  it("[API Client] userApi memanggil endpoint /users dengan method dan payload yang tepat", async () => {
    api.defaults.adapter = async (config) => {
      const url = config.url ?? "";
      const method = (config.method ?? "get").toLowerCase();

      if (url.includes("/users/user-10/status") && method === "patch") {
        return {
          data: {
            success: true,
            message: "Status pengguna berhasil diperbarui.",
            data: { id: "user-10", isActive: false },
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      if (url.includes("/users/user-10/reset-password") && method === "patch") {
        return {
          data: {
            success: true,
            message: "Kata sandi berhasil di-reset.",
            data: { id: "user-10", username: "budis" },
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      if (url.endsWith("/users") && method === "get") {
        return {
          data: {
            success: true,
            message: "Daftar pengguna berhasil diambil.",
            data: [MOCK_USER],
            meta: {
              page: 1,
              pageSize: 10,
              totalItems: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      throw new Error(`Unexpected request: ${method} ${url}`);
    };

    const listRes = await userApi.getUsers({ page: 1, pageSize: 10 });
    assert.equal(listRes.success, true);
    assert.equal(listRes.data.length, 1);
    assert.equal(listRes.data[0]?.username, "budis");

    const statusRes = await userApi.toggleStatus("user-10", { isActive: false });
    assert.equal(statusRes.isActive, false);

    const resetRes = await userApi.resetPassword("user-10", {
      newPassword: "newsecret123",
    });
    assert.equal(resetRes.username, "budis");
  });
});
