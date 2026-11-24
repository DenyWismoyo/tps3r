import { Bug, HandCoins, Sprout, UtensilsCrossed } from 'lucide-react';

const CIRCULAR_STEPS = [
  {
    num: '01',
    icon: <UtensilsCrossed size={22} />,
    title: 'Pemilahan & Setor Organik',
    desc: 'Warga, warung, restoran, dan pasar menyetor sisa makanan serta sampah daun terpilah untuk ditimbang dan dicatat poinnya.',
  },
  {
    num: '02',
    icon: <Bug size={22} />,
    title: 'Biokonversi Maggot BSF & Kompos',
    desc: 'Sisa makanan diurai cepat tanpa bau oleh larva Black Soldier Fly, sedangkan serasah kebun difermentasi menjadi kompos matang.',
  },
  {
    num: '03',
    icon: <Sprout size={22} />,
    title: 'Nutrisi Kebun & Pakan Ternak',
    desc: 'Maggot menjadi pakan berprotein tinggi untuk lele & unggas; kasgot, kompos, dan POC menyuburkan lahan Kelompok Tani.',
  },
  {
    num: '04',
    icon: <HandCoins size={22} />,
    title: 'Nilai Ekonomi & Nol Sampah TPA',
    desc: 'Hasil panen kembali ke warga melalui katalog & tukar poin, menekan emisi metana TPA serta membuka pendapatan mandiri desa.',
  },
] as const;

export function CircularFlowDiagram() {
  return (
    <div className="circular-flow">
      {CIRCULAR_STEPS.map((step) => (
        <article key={step.num} className="circular-flow__step">
          <div className="cluster cluster--between">
            <span className="circular-flow__num">{step.num}</span>
            <span className="stat-card__icon" aria-hidden="true">
              {step.icon}
            </span>
          </div>
          <h3>{step.title}</h3>
          <p className="text-sm text-muted">{step.desc}</p>
        </article>
      ))}
    </div>
  );
}
