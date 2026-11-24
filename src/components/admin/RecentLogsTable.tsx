import type { DailyLog } from '@/types/database';
import { formatDateId, formatNumber } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';

export interface RecentLogsTableProps {
  logs: readonly DailyLog[];
}

export function RecentLogsTable({ logs }: RecentLogsTableProps) {
  return (
    <div className="stack stack--sm">
      <h3>Riwayat Timbangan &amp; Panen Terbaru</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Sampah Masuk</th>
              <th>Maggot</th>
              <th>Kompos &amp; Kasgot</th>
              <th>POC</th>
              <th>Penyetor / Catatan</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  Belum ada catatan harian tersimpan. Gunakan form Quick Log di atas.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="font-semibold">{formatDateId(log.date)}</td>
                  <td>
                    {formatNumber(log.organicWasteKg + log.foodWasteKg, 1)} kg
                    <div className="text-xs text-muted">
                      Organik {log.organicWasteKg} • Sisa mkn {log.foodWasteKg}
                    </div>
                  </td>
                  <td>{formatNumber(log.maggotHarvestKg, 1)} kg</td>
                  <td>
                    {formatNumber(log.compostProducedKg + log.kasgotProducedKg, 1)} kg
                  </td>
                  <td>{formatNumber(log.pocProducedLiter, 1)} L</td>
                  <td>
                    {log.contributorName ? (
                      <div className="stack stack--xs">
                        <Badge tone="organic">
                          {log.contributorName} (+{log.earnedPoints ?? 0} poin)
                        </Badge>
                      </div>
                    ) : null}
                    {log.notes ? (
                      <span className="text-xs text-muted">{log.notes}</span>
                    ) : !log.contributorName ? (
                      <span className="text-xs text-muted">Log operasional umum</span>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
