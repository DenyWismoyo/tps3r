import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ImpactSummary, MonthlyImpact, SiteSettingsOverride } from '@/types/database';
import { formatMonthLabel } from '@/utils/format';

const IMPACT_SUMMARY_DOC = doc(db, 'impact_summary', 'current');
const IMPACT_MONTHLY_COL = collection(db, 'impact_monthly');
const SITE_SETTINGS_DOC = doc(db, 'site_settings', 'profile');

export const EMPTY_IMPACT_SUMMARY: ImpactSummary = {
  totalWasteProcessedKg: 0,
  totalFoodWasteKg: 0,
  totalOrganicWasteKg: 0,
  totalMaggotHarvestKg: 0,
  totalCompostAndKasgotKg: 0,
  totalCompostKg: 0,
  totalKasgotKg: 0,
  totalPocLiter: 0,
  activeContributorsCount: 0,
  estimatedCo2SavedKg: 0,
  totalLogsCount: 0,
  lastUpdatedAt: new Date().toISOString(),
};

function toIsoString(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  return new Date().toISOString();
}

function mapImpactSummary(data: DocumentData): ImpactSummary {
  return {
    totalWasteProcessedKg: Number(data.totalWasteProcessedKg ?? 0),
    totalFoodWasteKg: Number(data.totalFoodWasteKg ?? 0),
    totalOrganicWasteKg:
      typeof data.totalOrganicWasteKg === 'number' ? data.totalOrganicWasteKg : undefined,
    totalMaggotHarvestKg: Number(data.totalMaggotHarvestKg ?? 0),
    totalCompostAndKasgotKg: Number(data.totalCompostAndKasgotKg ?? 0),
    totalCompostKg: typeof data.totalCompostKg === 'number' ? data.totalCompostKg : undefined,
    totalKasgotKg: typeof data.totalKasgotKg === 'number' ? data.totalKasgotKg : undefined,
    totalPocLiter: Number(data.totalPocLiter ?? 0),
    activeContributorsCount: Number(data.activeContributorsCount ?? 0),
    estimatedCo2SavedKg: Number(data.estimatedCo2SavedKg ?? 0),
    totalLogsCount: typeof data.totalLogsCount === 'number' ? data.totalLogsCount : undefined,
    lastUpdatedAt: toIsoString(data.lastUpdatedAt),
  };
}

function mapMonthlyImpact(id: string, data: DocumentData): MonthlyImpact {
  const monthKey = String(data.monthKey ?? id);
  return {
    monthKey,
    label: String(data.label ?? formatMonthLabel(monthKey)),
    wasteKg: Number(data.wasteKg ?? 0),
    maggotKg: Number(data.maggotKg ?? 0),
    compostKg: Number(data.compostKg ?? 0),
    kasgotKg: Number(data.kasgotKg ?? 0),
    foodWasteKg: typeof data.foodWasteKg === 'number' ? data.foodWasteKg : undefined,
    organicWasteKg: typeof data.organicWasteKg === 'number' ? data.organicWasteKg : undefined,
    pocLiter: typeof data.pocLiter === 'number' ? data.pocLiter : undefined,
    co2SavedKg: typeof data.co2SavedKg === 'number' ? data.co2SavedKg : undefined,
    logsCount: typeof data.logsCount === 'number' ? data.logsCount : undefined,
    updatedAt: data.updatedAt ? toIsoString(data.updatedAt) : undefined,
  };
}

export async function getImpactSummary(): Promise<ImpactSummary> {
  try {
    const snap = await getDoc(IMPACT_SUMMARY_DOC);
    if (!snap.exists()) return EMPTY_IMPACT_SUMMARY;
    return mapImpactSummary(snap.data());
  } catch {
    return EMPTY_IMPACT_SUMMARY;
  }
}

export async function getMonthlyImpacts(limitMonths = 12): Promise<MonthlyImpact[]> {
  try {
    const snap = await getDocs(IMPACT_MONTHLY_COL);
    return snap.docs
      .map((d) => mapMonthlyImpact(d.id, d.data()))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .slice(-limitMonths);
  } catch {
    return [];
  }
}

export async function getSiteSettingsOverride(): Promise<SiteSettingsOverride | null> {
  try {
    const snap = await getDoc(SITE_SETTINGS_DOC);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      organizationName:
        typeof data.organizationName === 'string' ? data.organizationName : undefined,
      tagline: typeof data.tagline === 'string' ? data.tagline : undefined,
      whatsappNumber: typeof data.whatsappNumber === 'string' ? data.whatsappNumber : undefined,
      phone: typeof data.phone === 'string' ? data.phone : undefined,
      address: typeof data.address === 'string' ? data.address : undefined,
      operatingHours: typeof data.operatingHours === 'string' ? data.operatingHours : undefined,
      announcementText:
        typeof data.announcementText === 'string' ? data.announcementText : undefined,
      announcementActive:
        typeof data.announcementActive === 'boolean' ? data.announcementActive : undefined,
      mapEmbedUrl: typeof data.mapEmbedUrl === 'string' ? data.mapEmbedUrl : undefined,
      chairmanName: typeof data.chairmanName === 'string' ? data.chairmanName : undefined,
      legalityNumber: typeof data.legalityNumber === 'string' ? data.legalityNumber : undefined,
      updatedAt: data.updatedAt ? toIsoString(data.updatedAt) : undefined,
      updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : undefined,
    };
  } catch {
    return null;
  }
}

export async function updateSiteSettingsOverride(
  settings: Omit<SiteSettingsOverride, 'updatedAt' | 'updatedBy'>,
  updatedBy: string
): Promise<void> {
  const cleanPayload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
    updatedBy,
  };

  for (const [key, val] of Object.entries(settings)) {
    if (val !== undefined) {
      cleanPayload[key] = val;
    }
  }

  await setDoc(SITE_SETTINGS_DOC, cleanPayload, { merge: true });
}
