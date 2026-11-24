'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Download, Plus, Trash2, Wallet } from 'lucide-react';
import {
  CASH_CATEGORY_LABELS,
  type CashCategory,
  type CashTransaction,
  type CashTransactionType,
} from '@/types/database';
import { cashTransactionSchema } from '@/validations/schemas';
import {
  createCashTransaction,
  deleteCashTransaction,
  getCashTransactionsAdmin,
} from '@/services/cash.service';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { formatDateId, formatRupiah, getMonthKey, getTodayDateKey } from '@/utils/format';
import { exportCashTransactionsCsv } from '@/utils/exportCsv';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { InputField, SelectField } from '@/components/ui/InputField';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { Tabs } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';

const INCOME_CATEGORIES: readonly CashCategory[] = [
  'penjualan_maggot',
  'penjualan_pupuk',
  'penjualan_kebun',
  'eduwisata',
  'iuran_donasi',
  'lainnya',
];

const EXPENSE_CATEGORIES: readonly CashCategory[] = [
  'bbm_jemput',
  'kemasan_karung',
  'pakan_em4',
  'honor_petugas',
  'perawatan_alat',
  'lainnya',
];

export function CashLedgerManager() {
  const { user } = useAuth();
  const { products, refresh: refreshProducts } = useProducts('admin');
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [txType, setTxType] = useState<CashTransactionType>('pemasukan');
  const [date, setDate] = useState(getTodayDateKey());
  const [category, setCategory] = useState<CashCategory>('penjualan_maggot');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [productId, setProductId] = useState('');
  const [qtySold, setQtySold] = useState('1');

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getCashTransactionsAdmin(100);
      setTransactions(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const handleTypeChange = (nextType: CashTransactionType) => {
    setTxType(nextType);
    setCategory(nextType === 'pemasukan' ? 'penjualan_maggot' : 'bbm_jemput');
    if (nextType === 'pengeluaran') {
      setProductId('');
    }
  };

  const handleSelectProduct = (nextProdId: string) => {
    setProductId(nextProdId);
    const found = products.find((p) => p.id === nextProdId);
    if (found) {
      const qty = Math.max(1, Number(qtySold) || 1);
      setAmount(String(found.price * qty));
      setDescription(`Penjualan ${qty} ${found.unit} ${found.name}`);
    }
  };

  const handleQtyChange = (nextQtyStr: string) => {
    setQtySold(nextQtyStr);
    const found = products.find((p) => p.id === productId);
    if (found) {
      const qty = Math.max(1, Number(nextQtyStr) || 1);
      setAmount(String(found.price * qty));
      setDescription(`Penjualan ${qty} ${found.unit} ${found.name}`);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = cashTransactionSchema.safeParse({
      date,
      type: txType,
      category,
      amount,
      description,
      productId: txType === 'pemasukan' && productId ? productId : undefined,
      qtySold: txType === 'pemasukan' && productId ? qtySold : undefined,
    });

    if (!parsed.success) {
      showToast(parsed.error.issues[0]?.message ?? 'Periksa data transaksi kas.', 'error');
      return;
    }

    setSaving(true);
    try {
      await createCashTransaction(parsed.data, user?.email || user?.uid || 'admin');
      showToast(
        parsed.data.productId
          ? 'Pemasukan tercatat & stok produk otomatis dikurangi!'
          : 'Transaksi buku kas berhasil dicatat.',
        'success'
      );
      setAmount('');
      setDescription('');
      setProductId('');
      setQtySold('1');
      await Promise.all([loadTransactions(), refreshProducts()]);
    } catch {
      showToast('Gagal menyimpan transaksi kas.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCashTransaction(id);
      showToast('Transaksi kas dihapus.', 'info');
      await loadTransactions();
    } catch {
      showToast('Gagal menghapus transaksi.', 'error');
    }
  };

  const currentMonth = getMonthKey(getTodayDateKey());
  const stats = useMemo(() => {
    const monthTx = transactions.filter((t) => t.monthKey === currentMonth);
    const income = monthTx
      .filter((t) => t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTx
      .filter((t) => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [transactions, currentMonth]);

  const categoryList = txType === 'pemasukan' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="stack stack--lg">
      <div className="cluster cluster--between">
        <div>
          <h2>Buku Kas Operasional TPS 3R</h2>
          <p className="text-sm text-muted">
            Catat penjualan produk (otomatis potong stok) dan biaya operasional harian untuk
            laporan rapat RW / KSM.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={transactions.length === 0}
          onClick={() => exportCashTransactionsCsv(transactions)}
        >
          <Download size={16} />
          <span>Export CSV Kas</span>
        </Button>
      </div>

      <div className="grid-3">
        <StatCard
          label="Pemasukan Bulan Ini"
          value={formatRupiah(stats.income)}
          icon={<ArrowUpCircle size={20} />}
          tone="green"
        />
        <StatCard
          label="Pengeluaran Bulan Ini"
          value={formatRupiah(stats.expense)}
          icon={<ArrowDownCircle size={20} />}
          tone="amber"
        />
        <StatCard
          label="Saldo Kas Bersih"
          value={formatRupiah(stats.net)}
          icon={<Wallet size={20} />}
          tone="soil"
        />
      </div>

      <Card elevated>
        <CardBody>
          <form onSubmit={handleSubmit} className="stack stack--sm">
            <Tabs
              ariaLabel="Jenis transaksi kas"
              activeKey={txType}
              onChange={handleTypeChange}
              items={[
                { key: 'pemasukan', label: 'Catat Pemasukan / Penjualan', icon: <ArrowUpCircle size={16} /> },
                { key: 'pengeluaran', label: 'Catat Pengeluaran Operasional', icon: <ArrowDownCircle size={16} /> },
              ]}
            />

            <div className="grid-3">
              <InputField
                id="cash-date"
                label="Tanggal"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <SelectField
                id="cash-category"
                label="Kategori"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as CashCategory)}
                options={categoryList.map((cat) => ({
                  value: cat,
                  label: CASH_CATEGORY_LABELS[cat],
                }))}
              />
              <InputField
                id="cash-amount"
                label="Nominal (Rp)"
                type="number"
                inputMode="numeric"
                min={1}
                required
                placeholder="Contoh: 90000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {txType === 'pemasukan' ? (
              <div className="grid-2">
                <SelectField
                  id="cash-product"
                  label="Produk Terjual (Opsional — Otomatis Potong Stok)"
                  value={productId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  placeholder="— Tidak potong stok / Pemasukan umum —"
                  options={products.map((p) => ({
                    value: p.id,
                    label: `${p.name} (Stok: ${p.stockQty} ${p.unit})`,
                  }))}
                />
                {productId ? (
                  <InputField
                    id="cash-qty"
                    label="Jumlah Terjual"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={qtySold}
                    onChange={(e) => handleQtyChange(e.target.value)}
                  />
                ) : null}
              </div>
            ) : null}

            <InputField
              id="cash-desc"
              label="Keterangan Transaksi"
              required
              placeholder={
                txType === 'pemasukan'
                  ? 'Contoh: Pembelian 10 kg maggot segar oleh Pak Slamet (Lele)'
                  : 'Contoh: Beli BBM motor roda 3 & 50 lembar karung kompos'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Button type="submit" variant="primary" size="lg" block disabled={saving}>
              <Plus size={18} />
              <span>{saving ? 'Menyimpan...' : 'Simpan ke Buku Kas'}</span>
            </Button>
          </form>
        </CardBody>
      </Card>

      {loading ? (
        <Skeleton variant="card" />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<Wallet size={26} />}
          title="Belum ada transaksi buku kas"
          description="Catat penjualan atau biaya operasional pertama Anda di atas."
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis &amp; Kategori</th>
                <th>Keterangan</th>
                <th>Nominal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="font-semibold">{formatDateId(tx.date)}</td>
                  <td>
                    <Badge tone={tx.type === 'pemasukan' ? 'available' : 'preorder'}>
                      {tx.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                    </Badge>
                    <div className="text-xs text-muted">
                      {CASH_CATEGORY_LABELS[tx.category] ?? tx.category}
                    </div>
                  </td>
                  <td>
                    <div>{tx.description}</div>
                    {tx.productName ? (
                      <div className="text-xs text-muted">
                        Potong stok: {tx.productName} ({tx.qtySold} unit)
                      </div>
                    ) : null}
                  </td>
                  <td
                    className={
                      tx.type === 'pemasukan' ? 'font-bold text-success' : 'font-bold text-danger'
                    }
                  >
                    {tx.type === 'pemasukan' ? '+' : '-'} {formatRupiah(tx.amount)}
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      iconOnly
                      aria-label="Hapus transaksi kas"
                      onClick={() => void handleDelete(tx.id)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
