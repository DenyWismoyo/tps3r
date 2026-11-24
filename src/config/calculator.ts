export type CropType = 'sayuran_daun' | 'cabai_buah' | 'tanaman_hias' | 'padi_palawija';
export type LivestockType = 'lele' | 'nila' | 'ayam_kampung' | 'bebek';
export type LandUnitMode = 'm2' | 'polybag';

export interface CropFormula {
  id: CropType;
  label: string;
  compostKgPerM2: number;
  kasgotKgPerM2: number;
  pocLiterPerM2: number;
  compostKgPerPolybag: number;
  kasgotKgPerPolybag: number;
  pocLiterPerPolybag: number;
  frequencyNote: string;
}

export interface LivestockFormula {
  id: LivestockType;
  label: string;
  freshMaggotGramPerHeadPerDay: number;
  dryMaggotGramPerHeadPerDay: number;
  substitutionRatioNote: string;
}

export const CALCULATOR_PRICES = {
  compostPerKg: 1500,
  kasgotPerKg: 3500,
  pocPerLiter: 18000,
  freshMaggotPerKg: 9000,
  dryMaggotPerKg: 65000,
} as const;

export const CROP_FORMULAS: readonly CropFormula[] = [
  {
    id: 'sayuran_daun',
    label: 'Sayuran Daun (Kangkung, Bayam, Sawi, Selada)',
    compostKgPerM2: 1.5,
    kasgotKgPerM2: 0.6,
    pocLiterPerM2: 0.05,
    compostKgPerPolybag: 0.35,
    kasgotKgPerPolybag: 0.15,
    pocLiterPerPolybag: 0.015,
    frequencyNote: 'Berikan kompos/kasgot sebagai pupuk dasar sebelum tanam, kocor POC 1x seminggu.',
  },
  {
    id: 'cabai_buah',
    label: 'Sayuran Buah (Cabai, Tomat, Terong, Melon)',
    compostKgPerM2: 2.2,
    kasgotKgPerM2: 0.9,
    pocLiterPerM2: 0.08,
    compostKgPerPolybag: 0.5,
    kasgotKgPerPolybag: 0.25,
    pocLiterPerPolybag: 0.025,
    frequencyNote: 'Ulangi tabur kasgot setiap 2–3 minggu saat fase berbunga dan berbuah.',
  },
  {
    id: 'tanaman_hias',
    label: 'Tanaman Hias & Tabulampot',
    compostKgPerM2: 1.8,
    kasgotKgPerM2: 0.8,
    pocLiterPerM2: 0.06,
    compostKgPerPolybag: 0.4,
    kasgotKgPerPolybag: 0.2,
    pocLiterPerPolybag: 0.02,
    frequencyNote: 'Campurkan kasgot 1:4 dengan tanah/sekam untuk media gembur bebas patogen.',
  },
  {
    id: 'padi_palawija',
    label: 'Padi, Jagung & Palawija',
    compostKgPerM2: 0.4,
    kasgotKgPerM2: 0.2,
    pocLiterPerM2: 0.02,
    compostKgPerPolybag: 0.3,
    kasgotKgPerPolybag: 0.15,
    pocLiterPerPolybag: 0.01,
    frequencyNote: 'Aplikasikan saat pengolahan lahan untuk meningkatkan mikroba tanah & hemat pupuk kimia.',
  },
] as const;

export const LIVESTOCK_FORMULAS: readonly LivestockFormula[] = [
  {
    id: 'lele',
    label: 'Ikan Lele (Pembesaran)',
    freshMaggotGramPerHeadPerDay: 2.5,
    dryMaggotGramPerHeadPerDay: 0.8,
    substitutionRatioNote: 'Dapat mensubstitusi 30%–50% pakan pelet pabrikan untuk mempercepat bobot panen.',
  },
  {
    id: 'nila',
    label: 'Ikan Nila / Gurame',
    freshMaggotGramPerHeadPerDay: 2.0,
    dryMaggotGramPerHeadPerDay: 0.65,
    substitutionRatioNote: 'Berikan pada pagi dan sore hari sebagai suplemen protein tinggi (40%+).',
  },
  {
    id: 'ayam_kampung',
    label: 'Ayam Kampung / Petelur',
    freshMaggotGramPerHeadPerDay: 18,
    dryMaggotGramPerHeadPerDay: 6,
    substitutionRatioNote: 'Ideal sebagai 20%–30% porsi ransum harian untuk meningkatkan imunitas & kualitas telur.',
  },
  {
    id: 'bebek',
    label: 'Bebek / Entok',
    freshMaggotGramPerHeadPerDay: 25,
    dryMaggotGramPerHeadPerDay: 8.5,
    substitutionRatioNote: 'Campurkan dengan dedak/bekatul untuk menurunkan biaya pakan harian secara signifikan.',
  },
] as const;

export interface FertilizerCalculationResult {
  compostKg: number;
  kasgotKg: number;
  pocLiter: number;
  estimatedCostRp: number;
  frequencyNote: string;
}

export interface MaggotCalculationResult {
  freshKgPerDay: number;
  freshKgPerWeek: number;
  dryKgPerDay: number;
  dryKgPerWeek: number;
  estimatedFreshWeeklyCostRp: number;
  estimatedDryWeeklyCostRp: number;
  substitutionRatioNote: string;
}

export function calculateFertilizerNeeds(
  cropId: CropType,
  unitMode: LandUnitMode,
  quantity: number
): FertilizerCalculationResult {
  const formula = CROP_FORMULAS.find((item) => item.id === cropId) ?? CROP_FORMULAS[0]!;
  const safeQty = Math.max(0, quantity);

  const rawCompost =
    unitMode === 'm2'
      ? safeQty * formula.compostKgPerM2
      : safeQty * formula.compostKgPerPolybag;
  const rawKasgot =
    unitMode === 'm2'
      ? safeQty * formula.kasgotKgPerM2
      : safeQty * formula.kasgotKgPerPolybag;
  const rawPoc =
    unitMode === 'm2'
      ? safeQty * formula.pocLiterPerM2
      : safeQty * formula.pocLiterPerPolybag;

  const compostKg = Math.ceil(rawCompost * 10) / 10;
  const kasgotKg = Math.ceil(rawKasgot * 10) / 10;
  const pocLiter = Math.max(safeQty > 0 ? 0.5 : 0, Math.ceil(rawPoc * 10) / 10);

  const estimatedCostRp = Math.round(
    compostKg * CALCULATOR_PRICES.compostPerKg +
      kasgotKg * CALCULATOR_PRICES.kasgotPerKg +
      pocLiter * CALCULATOR_PRICES.pocPerLiter
  );

  return {
    compostKg,
    kasgotKg,
    pocLiter,
    estimatedCostRp,
    frequencyNote: formula.frequencyNote,
  };
}

export function calculateMaggotNeeds(
  livestockId: LivestockType,
  headCount: number
): MaggotCalculationResult {
  const formula =
    LIVESTOCK_FORMULAS.find((item) => item.id === livestockId) ?? LIVESTOCK_FORMULAS[0]!;
  const safeCount = Math.max(0, headCount);

  const freshKgPerDay = Math.round(((safeCount * formula.freshMaggotGramPerHeadPerDay) / 1000) * 100) / 100;
  const freshKgPerWeek = Math.round(freshKgPerDay * 7 * 100) / 100;
  const dryKgPerDay = Math.round(((safeCount * formula.dryMaggotGramPerHeadPerDay) / 1000) * 100) / 100;
  const dryKgPerWeek = Math.round(dryKgPerDay * 7 * 100) / 100;

  return {
    freshKgPerDay,
    freshKgPerWeek,
    dryKgPerDay,
    dryKgPerWeek,
    estimatedFreshWeeklyCostRp: Math.round(freshKgPerWeek * CALCULATOR_PRICES.freshMaggotPerKg),
    estimatedDryWeeklyCostRp: Math.round(dryKgPerWeek * CALCULATOR_PRICES.dryMaggotPerKg),
    substitutionRatioNote: formula.substitutionRatioNote,
  };
}
