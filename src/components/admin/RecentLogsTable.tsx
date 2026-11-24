'use client';

import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import type { DailyLog } from '@/types/database';
import { deleteDailyLogAtomic } from '@/services/logs.service';
import { formatDateId, formatNumber } from '@/utils/format';
import { exportDailyLogsCsv } from '@/utils/exportCsv';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export interface RecentLogsTableProps {
  logs: readonly DailyLog[];
  onDeleted?: () => void;
}

export function RecentLogsTable({ logs, onDeleted }: RecentLogsTableProps) {
  const { showToast } = useToast();
  const [targetDelete, setTargetDelete] = useState<DailyLog | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!targetDelete) return;
    setDeleting(true);
    try {
      await deleteDailyLogAtomic(targetDelete.id);
      showToast(
        'Log dibatalkan & angka ringkasan dampak/poin telah dikembalikan secara atomik.',
        'success'
      );
      setTargetDelete(null);
      onDeleted?.();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Gagal membatalkan log harian.',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="stack stack--sm">
      <div className="cluster cluster--between">
        <h3>Riwayat Timbangan &amp; Panen Terbaru</h3>
        <Button
          variant="outline"
          size="sm"
          disabled={logs.length === 0}
          onClick={() => exportDailyLogsCsv(logs)}
        >
          <Download size={15} />
          <span>Export CSV (Excel)</span>
        </Button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Organik Masuk</th>
              <th>Anorganik / Residu</th>
              <th>Panen &amp; Produk</th>
              <th>Penyetor / Catatan</th>
              <th>Koreksi</th>
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
                      Kebun {log.organicWasteKg} • Sisa mkn {log.foodWasteKg}
                    </div>
                  </td>
                  <td>
                    <div className="text-xs">
                      Anorg: <strong>{formatNumber(log.inorganicWasteKg ?? 0, 1)} kg</strong>
                    </div>
                    <div className="text-xs text-muted">
                      Residu TPA: {formatNumber(log.residueToTpaKg ?? 0, 1)} kg
                    </div>
                  </td>
                  <td>
                    <div className="text-xs">
                      Maggot {formatNumber(log.maggotHarvestKg, 1)} kg • POC{' '}
                      {formatNumber(log.pocProducedLiter, 1)} L
                    </div>
                    <div className="text-xs text-muted">
                      Kompos/Kasgot {formatNumber(log.compostProducedKg + log.kasgotProducedKg, 1)}{' '}
                      kg
                    </div>
                  </td>
                  <td>
                    {log.contributorName ? (
                      <Badge tone="organic">
                        {log.contributorName} (+{log.earnedPoints ?? 0} poin)
                      </Badge>
                    ) : null}
                    {log.notes ? (
                      <div className="text-xs text-muted">{log.notes}</div>
                    ) : !log.contributorName ? (
                      <span className="text-xs text-muted">Log operasional umum</span>
                    ) : null}
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      iconOnly
                      aria-label={`Batalkan log tanggal ${log.date}`}
                      onClick={() => setTargetDelete(log)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(targetDelete)}
        title="Batalkan / Hapus Catatan Log?"
        onClose={() => setTargetDelete(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setTargetDelete(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              disabled={deleting}
              onClick={() => void handleConfirmDelete()}
            >
              {deleting ? 'Mengembalikan Data...' : 'Ya, Batalkan Log'}
            </Button>
          </>
        }
      >
        <p className="text-sm">
          Menghapus log tanggal <strong>{targetDelete?.date}</strong> akan otomatis{' '}
          <strong>mengembalikan angka ringkasan dampak, rekap bulanan, dan poin penyetor</strong>{' '}
          secara atomik (anti salah ketik).
        </p>
      </Modal>
    </div>
  );
}
