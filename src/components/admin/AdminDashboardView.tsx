'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Contributor, DailyLog } from '@/types/database';
import { getAllContributorsAdmin } from '@/services/contributors.service';
import { getRecentDailyLogs } from '@/services/logs.service';
import { useImpactSummary } from '@/hooks/useImpactSummary';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ImpactMetricsGrid } from '@/components/shared/ImpactMetricsGrid';
import { ImpactTrendChart } from '@/components/shared/ImpactTrendChart';
import { QuickLogForm } from './QuickLogForm';
import { RecentLogsTable } from './RecentLogsTable';

export function AdminDashboardView() {
  const { summary, monthly, loading: impactLoading, refresh: refreshImpact } =
    useImpactSummary(6);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const loadOperationalData = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const [recentLogs, contributorList] = await Promise.all([
        getRecentDailyLogs(15),
        getAllContributorsAdmin(),
      ]);
      setLogs(recentLogs);
      setContributors(contributorList);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    void loadOperationalData();
  }, [loadOperationalData]);

  const handleSaved = () => {
    void Promise.all([refreshImpact(), loadOperationalData()]);
  };

  return (
    <div className="stack stack--lg">
      <div>
        <h2>Dashboard Lapangan &amp; Quick Log</h2>
        <p className="text-sm text-muted">
          Catat timbangan sampah masuk &amp; hasil panen harian dalam hitungan detik.
        </p>
      </div>

      {impactLoading ? (
        <div className="grid-4">
          <Skeleton variant="stat" />
          <Skeleton variant="stat" />
          <Skeleton variant="stat" />
          <Skeleton variant="stat" />
        </div>
      ) : (
        <ImpactMetricsGrid summary={summary} compact />
      )}

      <QuickLogForm contributors={contributors} onSaved={handleSaved} />

      <Card>
        <CardBody>
          <ImpactTrendChart monthlyData={monthly} metric="waste" height={210} />
        </CardBody>
      </Card>

      {loadingLogs ? <Skeleton variant="card" /> : <RecentLogsTable logs={logs} />}
    </div>
  );
}
