'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ImpactSummary, MonthlyImpact } from '@/types/database';
import {
  EMPTY_IMPACT_SUMMARY,
  getImpactSummary,
  getMonthlyImpacts,
} from '@/services/impact.service';

export function useImpactSummary(limitMonths = 12) {
  const [summary, setSummary] = useState<ImpactSummary>(EMPTY_IMPACT_SUMMARY);
  const [monthly, setMonthly] = useState<MonthlyImpact[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [sumData, monthlyData] = await Promise.all([
        getImpactSummary(),
        getMonthlyImpacts(limitMonths),
      ]);
      setSummary(sumData);
      setMonthly(monthlyData);
    } finally {
      setLoading(false);
    }
  }, [limitMonths]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { summary, monthly, loading, refresh };
}
