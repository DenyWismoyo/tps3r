import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  ProductionBatch,
  ProductionBatchStatus,
  ProductionBatchType,
} from '@/types/database';
import type { ProductionBatchInput } from '@/validations/schemas';

const BATCHES_COL = 'production_batches';

function toIsoString(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  return new Date().toISOString();
}

function mapBatchDoc(id: string, data: DocumentData): ProductionBatch {
  return {
    id,
    code: String(data.code ?? ''),
    type: (data.type as ProductionBatchType) ?? 'biopond_maggot',
    startDate: String(data.startDate ?? ''),
    targetHarvestDate: String(data.targetHarvestDate ?? ''),
    estimatedInputKg: Number(data.estimatedInputKg ?? 0),
    status: (data.status as ProductionBatchStatus) ?? 'aktif',
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    recordedBy: String(data.recordedBy ?? ''),
    createdAt: toIsoString(data.createdAt),
    updatedAt: data.updatedAt ? toIsoString(data.updatedAt) : undefined,
  };
}

export async function getProductionBatchesAdmin(): Promise<ProductionBatch[]> {
  const q = query(collection(db, BATCHES_COL), orderBy('targetHarvestDate', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapBatchDoc(d.id, d.data()));
}

export async function createProductionBatch(
  input: ProductionBatchInput,
  recordedBy: string
): Promise<string> {
  const payload: Record<string, unknown> = {
    code: input.code.toUpperCase(),
    type: input.type,
    startDate: input.startDate,
    targetHarvestDate: input.targetHarvestDate,
    estimatedInputKg: input.estimatedInputKg,
    status: 'aktif',
    recordedBy,
    createdAt: serverTimestamp(),
  };

  if (input.notes?.trim()) {
    payload.notes = input.notes.trim();
  }

  const refDoc = await addDoc(collection(db, BATCHES_COL), payload);
  return refDoc.id;
}

export async function updateBatchStatus(
  id: string,
  status: ProductionBatchStatus
): Promise<void> {
  await updateDoc(doc(db, BATCHES_COL, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProductionBatch(id: string): Promise<void> {
  await deleteDoc(doc(db, BATCHES_COL, id));
}
