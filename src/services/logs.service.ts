import {
  collection,
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
import { SITE_CONFIG } from '@/config/site';
import type { DailyLog } from '@/types/database';
import type { DailyLogInput } from '@/validations/schemas';
import { formatMonthLabel, getMonthKey } from '@/utils/format';

const DAILY_LOGS_COL = 'daily_logs';

function toIsoString(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  return new Date().toISOString();
}

function mapDailyLogDoc(id: string, data: DocumentData): DailyLog {
  return {
    id,
    date: String(data.date ?? ''),
    monthKey: String(data.monthKey ?? ''),
    organicWasteKg: Number(data.organicWasteKg ?? 0),
    foodWasteKg: Number(data.foodWasteKg ?? 0),
    maggotHarvestKg: Number(data.maggotHarvestKg ?? 0),
    compostProducedKg: Number(data.compostProducedKg ?? 0),
    kasgotProducedKg: Number(data.kasgotProducedKg ?? 0),
    pocProducedLiter: Number(data.pocProducedLiter ?? 0),
    contributorId: typeof data.contributorId === 'string' ? data.contributorId : undefined,
    contributorName: typeof data.contributorName === 'string' ? data.contributorName : undefined,
    earnedPoints: typeof data.earnedPoints === 'number' ? data.earnedPoints : undefined,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    recordedBy: String(data.recordedBy ?? ''),
    createdAt: toIsoString(data.createdAt),
    updatedAt: data.updatedAt ? toIsoString(data.updatedAt) : undefined,
  };
}

export async function getRecentDailyLogs(limitCount = 20): Promise<DailyLog[]> {
  const q = query(
    collection(db, DAILY_LOGS_COL),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => mapDailyLogDoc(d.id, d.data()))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export interface CreateDailyLogResult {
  logId: string;
  totalWasteKg: number;
  earnedPoints: number;
}

/**
 * Menyimpan log lapangan harian secara ATOMIK via Firestore runTransaction:
 * 1. Membuat dokumen baru di daily_logs/{autoId}
 * 2. Memperbarui agregat tunggal impact_summary/current
 * 3. Memperbarui agregat bulanan impact_monthly/{YYYY-MM}
 * 4. Jika contributorId diisi, menambah totalDepositedKg & pointsBalance pada contributors/{id}
 */
export async function createDailyLog(
  input: DailyLogInput,
  recordedBy: string
): Promise<CreateDailyLogResult> {
  const monthKey = getMonthKey(input.date);
  const monthLabel = formatMonthLabel(monthKey);
  const totalWasteKg = roundTwo(input.organicWasteKg + input.foodWasteKg);
  const compostAndKasgotKg = roundTwo(input.compostProducedKg + input.kasgotProducedKg);
  const co2SavedKg = roundTwo(totalWasteKg * SITE_CONFIG.co2FactorPerKgOrganic);
  const contributorId = input.contributorId?.trim() || undefined;

  const newLogRef = doc(collection(db, DAILY_LOGS_COL));
  const summaryRef = doc(db, 'impact_summary', 'current');
  const monthlyRef = doc(db, 'impact_monthly', monthKey);
  const contributorRef = contributorId ? doc(db, 'contributors', contributorId) : null;

  let finalEarnedPoints = 0;

  await runTransaction(db, async (tx) => {
    // FASE 1 TRANSAKSI: Semua READ wajib sebelum WRITE
    const summarySnap = await tx.get(summaryRef);
    const monthlySnap = await tx.get(monthlyRef);
    const contributorSnap = contributorRef ? await tx.get(contributorRef) : null;

    const currentSummary = summarySnap.exists() ? summarySnap.data() : {};
    const currentMonthly = monthlySnap.exists() ? monthlySnap.data() : {};
    const hasContributor = Boolean(contributorRef && contributorSnap?.exists());
    const contributorData = hasContributor && contributorSnap ? contributorSnap.data() : null;

    const earnedPoints =
      hasContributor && totalWasteKg > 0
        ? Math.round(totalWasteKg * SITE_CONFIG.pointsPerKgWaste)
        : 0;
    finalEarnedPoints = earnedPoints;

    // FASE 2 TRANSAKSI: Semua WRITE
    const logPayload: Record<string, unknown> = {
      date: input.date,
      monthKey,
      organicWasteKg: input.organicWasteKg,
      foodWasteKg: input.foodWasteKg,
      maggotHarvestKg: input.maggotHarvestKg,
      compostProducedKg: input.compostProducedKg,
      kasgotProducedKg: input.kasgotProducedKg,
      pocProducedLiter: input.pocProducedLiter,
      recordedBy,
      createdAt: serverTimestamp(),
    };

    if (hasContributor && contributorId && contributorData) {
      logPayload.contributorId = contributorId;
      logPayload.contributorName = String(contributorData.name ?? '');
      logPayload.earnedPoints = earnedPoints;
    }
    if (input.notes?.trim()) {
      logPayload.notes = input.notes.trim();
    }

    tx.set(newLogRef, logPayload);

    tx.set(summaryRef, {
      totalWasteProcessedKg: roundTwo(
        Number(currentSummary.totalWasteProcessedKg ?? 0) + totalWasteKg
      ),
      totalFoodWasteKg: roundTwo(
        Number(currentSummary.totalFoodWasteKg ?? 0) + input.foodWasteKg
      ),
      totalOrganicWasteKg: roundTwo(
        Number(currentSummary.totalOrganicWasteKg ?? 0) + input.organicWasteKg
      ),
      totalMaggotHarvestKg: roundTwo(
        Number(currentSummary.totalMaggotHarvestKg ?? 0) + input.maggotHarvestKg
      ),
      totalCompostAndKasgotKg: roundTwo(
        Number(currentSummary.totalCompostAndKasgotKg ?? 0) + compostAndKasgotKg
      ),
      totalCompostKg: roundTwo(
        Number(currentSummary.totalCompostKg ?? 0) + input.compostProducedKg
      ),
      totalKasgotKg: roundTwo(
        Number(currentSummary.totalKasgotKg ?? 0) + input.kasgotProducedKg
      ),
      totalPocLiter: roundTwo(
        Number(currentSummary.totalPocLiter ?? 0) + input.pocProducedLiter
      ),
      activeContributorsCount: Number(currentSummary.activeContributorsCount ?? 0),
      estimatedCo2SavedKg: roundTwo(
        Number(currentSummary.estimatedCo2SavedKg ?? 0) + co2SavedKg
      ),
      totalLogsCount: Number(currentSummary.totalLogsCount ?? 0) + 1,
      lastUpdatedAt: serverTimestamp(),
    });

    tx.set(monthlyRef, {
      monthKey,
      label: String(currentMonthly.label ?? monthLabel),
      wasteKg: roundTwo(Number(currentMonthly.wasteKg ?? 0) + totalWasteKg),
      foodWasteKg: roundTwo(Number(currentMonthly.foodWasteKg ?? 0) + input.foodWasteKg),
      organicWasteKg: roundTwo(
        Number(currentMonthly.organicWasteKg ?? 0) + input.organicWasteKg
      ),
      maggotKg: roundTwo(Number(currentMonthly.maggotKg ?? 0) + input.maggotHarvestKg),
      compostKg: roundTwo(Number(currentMonthly.compostKg ?? 0) + input.compostProducedKg),
      kasgotKg: roundTwo(Number(currentMonthly.kasgotKg ?? 0) + input.kasgotProducedKg),
      pocLiter: roundTwo(Number(currentMonthly.pocLiter ?? 0) + input.pocProducedLiter),
      co2SavedKg: roundTwo(Number(currentMonthly.co2SavedKg ?? 0) + co2SavedKg),
      logsCount: Number(currentMonthly.logsCount ?? 0) + 1,
      updatedAt: serverTimestamp(),
    });

    if (contributorRef && hasContributor && contributorData && totalWasteKg > 0) {
      tx.update(contributorRef, {
        totalDepositedKg: roundTwo(Number(contributorData.totalDepositedKg ?? 0) + totalWasteKg),
        pointsBalance: Number(contributorData.pointsBalance ?? 0) + earnedPoints,
        lastDepositAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  });

  return {
    logId: newLogRef.id,
    totalWasteKg,
    earnedPoints: finalEarnedPoints,
  };
}

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
