import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Contributor, ContributorType } from '@/types/database';
import type { ContributorInput } from '@/validations/schemas';
import { normalizePhoneIndonesia } from '@/utils/format';

const CONTRIBUTORS_COL = 'contributors';

function toIsoString(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  return new Date().toISOString();
}

function mapContributorDoc(id: string, data: DocumentData): Contributor {
  return {
    id,
    memberCode: String(data.memberCode ?? ''),
    name: String(data.name ?? ''),
    type: (data.type as ContributorType) ?? 'warga',
    phoneNormalized: String(data.phoneNormalized ?? ''),
    address: String(data.address ?? ''),
    totalDepositedKg: Number(data.totalDepositedKg ?? 0),
    pointsBalance: Number(data.pointsBalance ?? 0),
    isActive: data.isActive !== false,
    pickupDays: Array.isArray(data.pickupDays) ? (data.pickupDays as string[]) : [],
    lastDepositAt: data.lastDepositAt ? toIsoString(data.lastDepositAt) : undefined,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    createdAt: data.createdAt ? toIsoString(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? toIsoString(data.updatedAt) : undefined,
  };
}

/**
 * Pencarian publik Cek Poin Penyetor tanpa login.
 * Mematuhi batas anti-scraping firestore.rules (limit <= 5).
 */
export async function lookupContributor(queryText: string): Promise<Contributor | null> {
  const cleaned = queryText.trim();
  if (!cleaned) return null;

  const upperCode = cleaned.toUpperCase();
  const normalizedPhone = normalizePhoneIndonesia(cleaned);

  // 1. Cek berdasarkan Kode Member terlebih dahulu (misal TPS-001)
  const byCodeQuery = query(
    collection(db, CONTRIBUTORS_COL),
    where('memberCode', '==', upperCode),
    limit(5)
  );
  const byCodeSnap = await getDocs(byCodeQuery);
  const firstCode = byCodeSnap.docs[0];
  if (firstCode) {
    return mapContributorDoc(firstCode.id, firstCode.data());
  }

  // 2. Cek berdasarkan Nomor HP ternormalisasi (misal 628123456789)
  if (normalizedPhone.length >= 8) {
    const byPhoneQuery = query(
      collection(db, CONTRIBUTORS_COL),
      where('phoneNormalized', '==', normalizedPhone),
      limit(5)
    );
    const byPhoneSnap = await getDocs(byPhoneQuery);
    const firstPhone = byPhoneSnap.docs[0];
    if (firstPhone) {
      return mapContributorDoc(firstPhone.id, firstPhone.data());
    }
  }

  return null;
}

export interface PublicTopContributor {
  id: string;
  memberCode: string;
  name: string;
  type: ContributorType;
  totalDepositedKg: number;
}

/**
 * Mengambil 5 mitra penyetor teraktif untuk Papan Apresiasi publik (limit <= 5 sesuai firestore.rules).
 * Hanya mengembalikan data non-PII (tanpa nomor HP & tanpa alamat).
 */
export async function getTopContributorsPublic(): Promise<PublicTopContributor[]> {
  try {
    const q = query(
      collection(db, CONTRIBUTORS_COL),
      orderBy('totalDepositedKg', 'desc'),
      limit(5)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        memberCode: String(data.memberCode ?? ''),
        name: String(data.name ?? ''),
        type: (data.type as ContributorType) ?? 'warga',
        totalDepositedKg: Number(data.totalDepositedKg ?? 0),
      };
    });
  } catch {
    return [];
  }
}

export async function getAllContributorsAdmin(): Promise<Contributor[]> {
  const snap = await getDocs(collection(db, CONTRIBUTORS_COL));
  return snap.docs
    .map((d) => mapContributorDoc(d.id, d.data()))
    .sort((a, b) => a.memberCode.localeCompare(b.memberCode));
}

export async function createContributor(input: ContributorInput): Promise<string> {
  const phoneNormalized = normalizePhoneIndonesia(input.phone);
  const payload: Record<string, unknown> = {
    memberCode: input.memberCode.toUpperCase(),
    name: input.name,
    type: input.type,
    phoneNormalized,
    address: input.address,
    totalDepositedKg: 0,
    pointsBalance: 0,
    isActive: input.isActive,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (input.pickupDays && input.pickupDays.length > 0) {
    payload.pickupDays = input.pickupDays;
  }
  if (input.notes?.trim()) {
    payload.notes = input.notes.trim();
  }

  const refDoc = await addDoc(collection(db, CONTRIBUTORS_COL), payload);

  // Sinkronisasi hitungan penyetor aktif di impact_summary/current secara aman
  if (input.isActive) {
    const summaryRef = doc(db, 'impact_summary', 'current');
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(summaryRef);
      if (snap.exists()) {
        const currentCount = Number(snap.data().activeContributorsCount ?? 0);
        tx.update(summaryRef, {
          activeContributorsCount: currentCount + 1,
          lastUpdatedAt: serverTimestamp(),
        });
      }
    }).catch(() => undefined);
  }

  return refDoc.id;
}

export async function updateContributor(
  id: string,
  input: Partial<ContributorInput>
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (input.memberCode !== undefined) payload.memberCode = input.memberCode.toUpperCase();
  if (input.name !== undefined) payload.name = input.name;
  if (input.type !== undefined) payload.type = input.type;
  if (input.phone !== undefined) payload.phoneNormalized = normalizePhoneIndonesia(input.phone);
  if (input.address !== undefined) payload.address = input.address;
  if (input.isActive !== undefined) payload.isActive = input.isActive;
  if (input.notes !== undefined) payload.notes = input.notes.trim() || null;

  await updateDoc(doc(db, CONTRIBUTORS_COL, id), payload);
}

/**
 * Penukaran (redeem) poin penyetor menjadi pupuk/kasgot/sayuran secara atomik.
 */
export async function redeemContributorPoints(
  contributorId: string,
  pointsToRedeem: number,
  rewardNote: string
): Promise<number> {
  const refDoc = doc(db, CONTRIBUTORS_COL, contributorId);
  let remainingBalance = 0;

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(refDoc);
    if (!snap.exists()) {
      throw new Error('Data penyetor tidak ditemukan.');
    }
    const data = snap.data();
    const currentPoints = Number(data.pointsBalance ?? 0);
    if (pointsToRedeem <= 0 || pointsToRedeem > currentPoints) {
      throw new Error(`Saldo poin tidak mencukupi (tersedia ${currentPoints} poin).`);
    }

    remainingBalance = currentPoints - pointsToRedeem;
    const prevNotes = typeof data.notes === 'string' && data.notes ? `${data.notes} | ` : '';
    const dateTag = new Date().toISOString().slice(0, 10);
    const updatedNotes = `${prevNotes}[${dateTag}] Tukar ${pointsToRedeem} poin: ${rewardNote}`.slice(
      -500
    );

    tx.update(refDoc, {
      pointsBalance: remainingBalance,
      notes: updatedNotes,
      updatedAt: serverTimestamp(),
    });
  });

  return remainingBalance;
}
