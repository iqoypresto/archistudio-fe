import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "@/lib/api/axios";
import { paymentApi } from "@/lib/api/payment.api";
import {
  canAccessPayments,
  MAX_PAYMENT_PROOF_BYTES,
  payeeFormSchema,
  paymentRecordFormSchema,
  validatePaymentProofFile,
} from "@/lib/validation/payment.validation";

describe("TASK-16 Frontend Pembayaran Freelance/Agent — Validation, Guard & API (US-17, BR-36)", () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
  });

  it("[AC-17.1 / BR-36] payeeFormSchema mewajibkan nama & mengizinkan HP opsional; record schema memvalidasi nominal > 0", () => {
    assert.equal(payeeFormSchema.safeParse({ name: "", phone: "" }).success, false);
    assert.equal(payeeFormSchema.safeParse({ name: "Budi Drafter", phone: "" }).success, true);
    assert.equal(payeeFormSchema.safeParse({ name: "Sari Agent", phone: "081234567890" }).success, true);

    assert.equal(
      paymentRecordFormSchema.safeParse({
        status: "UNPAID",
        amount: "0",
        recordDate: "2026-11-20",
        dueDate: "",
      }).success,
      false,
    );
    assert.equal(
      paymentRecordFormSchema.safeParse({
        status: "PAID",
        amount: "2500000",
        recordDate: "2026-11-20",
        dueDate: "2026-11-30",
      }).success,
      true,
    );
  });

  it("[AC-17.1 / BR-36] validatePaymentProofFile hanya menerima JPG/PNG maks. 2 MB", () => {
    assert.equal(validatePaymentProofFile({ type: "image/jpeg", size: 512_000 }).valid, true);
    assert.equal(validatePaymentProofFile({ type: "image/png", size: MAX_PAYMENT_PROOF_BYTES }).valid, true);
    assert.equal(validatePaymentProofFile({ type: "image/webp", size: 100_000 }).valid, false);
    assert.equal(validatePaymentProofFile({ type: "application/pdf", size: 100_000 }).valid, false);
    assert.equal(validatePaymentProofFile({ type: "image/jpeg", size: MAX_PAYMENT_PROOF_BYTES + 1 }).valid, false);
  });

  it("[AC-17.1 / BR-36] canAccessPayments hanya mengizinkan OWNER", () => {
    assert.equal(canAccessPayments("OWNER"), true);
    assert.equal(canAccessPayments("ADMIN"), false);
    assert.equal(canAccessPayments("SUPERVISOR"), false);
    assert.equal(canAccessPayments(undefined), false);
  });

  it("[API Client / US-17] paymentApi memanggil endpoint payments & uploads/sign purpose payment-proof", async () => {
    const calls: string[] = [];

    api.defaults.adapter = async (config) => {
      const method = (config.method ?? "get").toUpperCase();
      const url = config.url ?? "";
      calls.push(`${method} ${url}`);

      if (url === "/uploads/sign") {
        return {
          data: {
            success: true,
            message: "OK",
            data: {
              uploadUrl: "https://r2.local/upload",
              storageKey: "payments/p-1/proofs/1.jpg",
              expiresInSeconds: 300,
              purpose: "payment-proof",
              fileName: "bukti.jpg",
              contentType: "image/jpeg",
              fileSizeBytes: 1024,
            },
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      return {
        data: { success: true, message: "OK", data: method === "GET" ? [] : { id: "item-1" } },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    await paymentApi.getPeople({ type: "FREELANCE" });
    await paymentApi.createPerson({ type: "FREELANCE", name: "Budi", phone: null });
    await paymentApi.getRecords("p-1");
    await paymentApi.createRecord("p-1", { status: "UNPAID", amount: 500000, recordDate: "2026-11-20" });
    await paymentApi.updateRecord("rec-1", { status: "PAID" });
    const signed = await paymentApi.signProofUpload({
      payeeId: "p-1",
      fileName: "bukti.jpg",
      contentType: "image/jpeg",
      fileSizeBytes: 1024,
    });

    assert.equal(signed.purpose, "payment-proof");
    assert.deepEqual(calls, [
      "GET /payments/people",
      "POST /payments/people",
      "GET /payments/people/p-1/records",
      "POST /payments/people/p-1/records",
      "PATCH /payments/records/rec-1",
      "POST /uploads/sign",
    ]);
  });
});
