import type { ReportFormValues } from "@/lib/validation/report.validation";
import type { SupportedImageMime } from "@/types/api/upload.types";

export interface LocalPhoto {
  id: string; fileName: string; contentType: SupportedImageMime; file: Blob;
  caption: string; takenAt: string | null; storageKey: string | null;
}
export interface LocalReport {
  values: Partial<ReportFormValues>;
  photos: LocalPhoto[];
  savedAt: string;
}

const DATABASE = "archistudio-supervisor-local";
const STORE = "reports";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transact<T>(key: string, mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = operation(tx.objectStore(STORE));
    let result: T;
    request.onsuccess = () => { result = request.result; };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export const localReportKey = (userId: string, areaId: string, date: string) =>
  `${userId}:${areaId}:${date}`;
export const readLocalReport = (key: string) =>
  transact<LocalReport | undefined>(key, "readonly", (store) => store.get(key));
export const writeLocalReport = (key: string, report: LocalReport) =>
  transact<IDBValidKey>(key, "readwrite", (store) => store.put(report, key));
export const removeLocalReport = (key: string) =>
  transact<undefined>(key, "readwrite", (store) => store.delete(key));
