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
    inorganicWasteKg:
      typeof data.inorganicWasteKg === 'number' ? data.inorganicWasteKg : 0,
    residueToTpaKg:
      typeof data.residueToTpaKg === 'number' ? data.residueToTpaKg : 0,
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

export async function getRecentDailyLogs(limitCount = 30): Promise<DailyLog[]> {
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
  date: string;
  totalWasteKg: number;
  earnedPoints: number;
  contributorName?: string;
  contributorMemberCode?: string;
  contributorPhone?: string;
  newPointsBalance?: number;
}

/**
 * Menyimpan log lapangan harian secara ATOMIK via Firestore runTransaction:
 * 1. daily_logs/{autoId}
 * 2. impact_summary/current
 * 3. impact_monthly/{YYYY-MM}
 * 4. contributors/{contributorId} (jika ada)
 */
export async function createDailyLog(
  input: DailyLogInput,
  recordedBy: string
): Promise<CreateDailyLogResult> {
  const monthKey = getMonthKey(input.date);
  const monthLabel = formatMonthLabel(monthKey);
  const organicTotalKg = roundTwo(input.organicWasteKg + input.foodWasteKg);
  const inorganicKg = roundTwo(input.inorganicWasteKg ?? 0);
  const residueKg = roundTwo(input.residueToTpaKg ?? 0);
  const compostAndKasgotKg = roundTwo(input.compostProducedKg + input.kasgotProducedKg);
  const co2SavedKg = roundTwo(organicTotalKg * SITE_CONFIG.co2FactorPerKgOrganic);
  const contributorId = input.contributorId?.trim() || undefined;

  const newLogRef = doc(collection(db, DAILY_LOGS_COL));
  const summaryRef = doc(db, 'impact_summary', 'current');
  const monthlyRef = doc(db, 'impact_monthly', monthKey);
  const contributorRef = contributorId ? doc(db, 'contributors', contributorId) : null;

  let finalEarnedPoints = 0;
  let contributorName: string | undefined;
  let contributorMemberCode: string | undefined;
  let contributorPhone: string | undefined;
  let newPointsBalance: number | undefined;

  await runTransaction(db, async (tx) => {
    const summarySnap = await tx.get(summaryRef);
    const monthlySnap = await tx.get(monthlyRef);
    const contributorSnap = contributorRef ? await tx.get(contributorRef) : null;

    const currentSummary = summarySnap.exists() ? summarySnap.data() : {};
    const currentMonthly = monthlySnap.exists() ? monthlySnap.data() : {};
    const hasContributor = Boolean(contributorRef && contributorSnap?.exists());
    const contributorData = hasContributor && contributorSnap ? contributorSnap.data() : null;

    const pointEligibleKg = roundTwo(organicTotalKg + inorganicKg);
    const earnedPoints =
      hasContributor && pointEligibleKg > 0
        ? Math.round(pointEligibleKg * SITE_CONFIG.pointsPerKgWaste)
        : 0;
    finalEarnedPoints = earnedPoints;

    const logPayload: Record<string, unknown> = {
      date: input.date,
      monthKey,
      organicWasteKg: input.organicWasteKg,
      foodWasteKg: input.foodWasteKg,
      inorganicWasteKg: inorganicKg,
      residueToTpaKg: residueKg,
      maggotHarvestKg: input.maggotHarvestKg,
      compostProducedKg: input.compostProducedKg,
      kasgotProducedKg: input.kasgotProducedKg,
      pocProducedLiter: input.pocProducedLiter,
      recordedBy,
      createdAt: serverTimestamp(),
    };

    if (hasContributor && contributorId && contributorData) {
      contributorName = String(contributorData.name ?? '');
      contributorMemberCode = String(contributorData.memberCode ?? '');
      contributorPhone = String(contributorData.phoneNormalized ?? '');
      newPointsBalance = Number(contributorData.pointsBalance ?? 0) + earnedPoints;

      logPayload.contributorId = contributorId;
      logPayload.contributorName = contributorName;
      logPayload.earnedPoints = earnedPoints;
    }
    if (input.notes?.trim()) {
      logPayload.notes = input.notes.trim();
    }

    tx.set(newLogRef, logPayload);

    tx.set(summaryRef, {
      totalWasteProcessedKg: roundTwo(
        Number(currentSummary.totalWasteProcessedKg ?? 0) + organicTotalKg
      ),
      totalFoodWasteKg: roundTwo(
        Number(currentSummary.totalFoodWasteKg ?? 0) + input.foodWasteKg
      ),
      totalOrganicWasteKg: roundTwo(
        Number(currentSummary.totalOrganicWasteKg ?? 0) + input.organicWasteKg
      ),
      totalInorganicWasteKg: roundTwo(
        Number(currentSummary.totalInorganicWasteKg ?? 0) + inorganicKg
      ),
      totalResidueToTpaKg: roundTwo(
        Number(currentSummary.totalResidueToTpaKg ?? 0) + residueKg
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
      wasteKg: roundTwo(Number(currentMonthly.wasteKg ?? 0) + organicTotalKg),
      foodWasteKg: roundTwo(Number(currentMonthly.foodWasteKg ?? 0) + input.foodWasteKg),
      organicWasteKg: roundTwo(
        Number(currentMonthly.organicWasteKg ?? 0) + input.organicWasteKg
      ),
      inorganicKg: roundTwo(Number(currentMonthly.inorganicKg ?? 0) + inorganicKg),
      residueKg: roundTwo(Number(currentMonthly.residueKg ?? 0) + residueKg),
      maggotKg: roundTwo(Number(currentMonthly.maggotKg ?? 0) + input.maggotHarvestKg),
      compostKg: roundTwo(Number(currentMonthly.compostKg ?? 0) + input.compostProducedKg),
      kasgotKg: roundTwo(Number(currentMonthly.kasgotKg ?? 0) + input.kasgotProducedKg),
      pocLiter: roundTwo(Number(currentMonthly.pocLiter ?? 0) + input.pocProducedLiter),
      co2SavedKg: roundTwo(Number(currentMonthly.co2SavedKg ?? 0) + co2SavedKg),
      logsCount: Number(currentMonthly.logsCount ?? 0) + 1,
      updatedAt: serverTimestamp(),
    });

    if (contributorRef && hasContributor && contributorData && pointEligibleKg > 0) {
      tx.update(contributorRef, {
        totalDepositedKg: roundTwo(
          Number(contributorData.totalDepositedKg ?? 0) + pointEligibleKg
        ),
        pointsBalance: Number(contributorData.pointsBalance ?? 0) + earnedPoints,
        lastDepositAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  });

  return {
    logId: newLogRef.id,
    date: input.date,
    totalWasteKg: roundTwo(organicTotalKg + inorganicKg),
    earnedPoints: finalEarnedPoints,
    contributorName,
    contributorMemberCode,
    contributorPhone,
    newPointsBalance,
  };
}

/**
 * Menghapus/membatalkan log harian secara ATOMIK (anti salah ketik) dan
 * mengembalikan angka agregat di impact_summary, impact_monthly, serta poin penyetor.
 */
export async function deleteDailyLogAtomic(logId: string): Promise<void> {
  const logRef = doc(db, DAILY_LOGS_COL, logId);
  const summaryRef = doc(db, 'impact_summary', 'current');

  await runTransaction(db, async (tx) => {
    const logSnap = await tx.get(logRef);
    if (!logSnap.exists()) {
      throw new Error('Catatan log tidak ditemukan atau sudah dihapus.');
    }
    const log = logSnap.data();
    const monthKey = String(log.monthKey ?? '');
    const monthlyRef = monthKey ? doc(db, 'impact_monthly', monthKey) : null;
    const contributorId =
      typeof log.contributorId === 'string' && log.contributorId ? log.contributorId : null;
    const contributorRef = contributorId ? doc(db, 'contributors', contributorId) : null;

    const summarySnap = await tx.get(summaryRef);
    const monthlySnap = monthlyRef ? await tx.get(monthlyRef) : null;
    const contributorSnap = contributorRef ? await tx.get(contributorRef) : null;

    const organicKg = Number(log.organicWasteKg ?? 0);
    const foodKg = Number(log.foodWasteKg ?? 0);
    const inorganicKg = Number(log.inorganicWasteKg ?? 0);
    const residueKg = Number(log.residueToTpaKg ?? 0);
    const maggotKg = Number(log.maggotHarvestKg ?? 0);
    const compostKg = Number(log.compostProducedKg ?? 0);
    const kasgotKg = Number(log.kasgotProducedKg ?? 0);
    const pocL = Number(log.pocProducedLiter ?? 0);
    const earnedPoints = Number(log.earnedPoints ?? 0);

    const organicTotalKg = roundTwo(organicKg + foodKg);
    const compostAndKasgotKg = roundTwo(compostKg + kasgotKg);
    const co2SavedKg = roundTwo(organicTotalKg * SITE_CONFIG.co2FactorPerKgOrganic);

    tx.delete(logRef);

    if (summarySnap.exists()) {
      const s = summarySnap.data();
      tx.set(summaryRef, {
        totalWasteProcessedKg: nonNeg(Number(s.totalWasteProcessedKg ?? 0) - organicTotalKg),
        totalFoodWasteKg: nonNeg(Number(s.totalFoodWasteKg ?? 0) - foodKg),
        totalOrganicWasteKg: nonNeg(Number(s.totalOrganicWasteKg ?? 0) - organicKg),
        totalInorganicWasteKg: nonNeg(Number(s.totalInorganicWasteKg ?? 0) - inorganicKg),
        totalResidueToTpaKg: nonNeg(Number(s.totalResidueToTpaKg ?? 0) - residueKg),
        totalMaggotHarvestKg: nonNeg(Number(s.totalMaggotHarvestKg ?? 0) - maggotKg),
        totalCompostAndKasgotKg: nonNeg(
          Number(s.totalCompostAndKasgotKg ?? 0) - compostAndKasgotKg
        ),
        totalCompostKg: nonNeg(Number(s.totalCompostKg ?? 0) - compostKg),
        totalKasgotKg: nonNeg(Number(s.totalKasgotKg ?? 0) - kasgotKg),
        totalPocLiter: nonNeg(Number(s.totalPocLiter ?? 0) - pocL),
        activeContributorsCount: Number(s.activeContributorsCount ?? 0),
        estimatedCo2SavedKg: nonNeg(Number(s.estimatedCo2SavedKg ?? 0) - co2SavedKg),
        totalLogsCount: Math.max(0, Number(s.totalLogsCount ?? 0) - 1),
        lastUpdatedAt: serverTimestamp(),
      });
    }

    if (monthlyRef && monthlySnap?.exists()) {
      const m = monthlySnap.data();
      tx.set(monthlyRef, {
        monthKey,
        label: String(m.label ?? formatMonthLabel(monthKey)),
        wasteKg: nonNeg(Number(m.wasteKg ?? 0) - organicTotalKg),
        foodWasteKg: nonNeg(Number(m.foodWasteKg ?? 0) - foodKg),
        organicWasteKg: nonNeg(Number(m.organicWasteKg ?? 0) - organicKg),
        inorganicKg: nonNeg(Number(m.inorganicKg ?? 0) - inorganicKg),
        residueKg: nonNeg(Number(m.residueKg ?? 0) - residueKg),
        maggotKg: nonNeg(Number(m.maggotKg ?? 0) - maggotKg),
        compostKg: nonNeg(Number(m.compostKg ?? 0) - compostKg),
        kasgotKg: nonNeg(Number(m.kasgotKg ?? 0) - kasgotKg),
        pocLiter: nonNeg(Number(m.pocLiter ?? 0) - pocL),
        co2SavedKg: nonNeg(Number(m.co2SavedKg ?? 0) - co2SavedKg),
        logsCount: Math.max(0, Number(m.logsCount ?? 0) - 1),
        updatedAt: serverTimestamp(),
      });
    }

    if (contributorRef && contributorSnap?.exists()) {
      const c = contributorSnap.data();
      const depositedBack = roundTwo(organicTotalKg + inorganicKg);
      tx.update(contributorRef, {
        totalDepositedKg: nonNeg(Number(c.totalDepositedKg ?? 0) - depositedBack),
        pointsBalance: Math.max(0, Number(c.pointsBalance ?? 0) - earnedPoints),
        updatedAt: serverTimestamp(),
      });
    }
  });
}

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function nonNeg(value: number): number {
  return Math.max(0, roundTwo(value));
}
