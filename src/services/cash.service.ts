import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  CashCategory,
  CashTransaction,
  CashTransactionType,
} from '@/types/database';
import type { CashTransactionInput } from '@/validations/schemas';
import { getMonthKey } from '@/utils/format';

const CASH_COL = 'cash_transactions';

function toIsoString(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  return new Date().toISOString();
}

function mapCashDoc(id: string, data: DocumentData): CashTransaction {
  return {
    id,
    date: String(data.date ?? ''),
    monthKey: String(data.monthKey ?? ''),
    type: (data.type as CashTransactionType) ?? 'pemasukan',
    category: (data.category as CashCategory) ?? 'lainnya',
    amount: Number(data.amount ?? 0),
    description: String(data.description ?? ''),
    productId: typeof data.productId === 'string' ? data.productId : undefined,
    productName: typeof data.productName === 'string' ? data.productName : undefined,
    qtySold: typeof data.qtySold === 'number' ? data.qtySold : undefined,
    recordedBy: String(data.recordedBy ?? ''),
    createdAt: toIsoString(data.createdAt),
    updatedAt: data.updatedAt ? toIsoString(data.updatedAt) : undefined,
  };
}

export async function getCashTransactionsAdmin(
  limitCount = 100
): Promise<CashTransaction[]> {
  const q = query(
    collection(db, CASH_COL),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => mapCashDoc(d.id, d.data()))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

/**
 * Mencatat transaksi kas operasional. Jika pemasukan dikaitkan dengan produk + qtySold > 0,
 * stok produk di koleksi `products` ikut dikurangi secara atomik dalam satu transaksi.
 */
export async function createCashTransaction(
  input: CashTransactionInput,
  recordedBy: string
): Promise<string> {
  const monthKey = getMonthKey(input.date);
  const newTxRef = doc(collection(db, CASH_COL));
  const productId = input.type === 'pemasukan' && input.productId?.trim() ? input.productId.trim() : undefined;
  const qtySold = productId && input.qtySold && input.qtySold > 0 ? input.qtySold : undefined;
  const productRef = productId ? doc(db, 'products', productId) : null;

  await runTransaction(db, async (tx) => {
    const productSnap = productRef ? await tx.get(productRef) : null;
    const productData = productSnap?.exists() ? productSnap.data() : null;

    const payload: Record<string, unknown> = {
      date: input.date,
      monthKey,
      type: input.type,
      category: input.category,
      amount: Math.round(input.amount),
      description: input.description,
      recordedBy,
      createdAt: serverTimestamp(),
    };

    if (productRef && productData && qtySold) {
      const nextStock = Math.max(0, Number(productData.stockQty ?? 0) - qtySold);
      payload.productId = productId;
      payload.productName = String(productData.name ?? '');
      payload.qtySold = qtySold;

      tx.update(productRef, {
        stockQty: nextStock,
        status: nextStock <= 0 ? 'soldout' : String(productData.status ?? 'available'),
        updatedAt: serverTimestamp(),
      });
    }

    tx.set(newTxRef, payload);
  });

  return newTxRef.id;
}

export async function deleteCashTransaction(id: string): Promise<void> {
  await deleteDoc(doc(db, CASH_COL, id));
}
