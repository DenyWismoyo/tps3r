'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PUBLIC_FAQS, type FaqItem } from '@/config/education';

type FaqTopicFilter = 'all' | FaqItem['topic'];

const TOPIC_OPTIONS: readonly { key: FaqTopicFilter; label: string }[] = [
  { key: 'all', label: 'Semua Topik' },
  { key: 'pembelian', label: 'Pemesanan Produk' },
  { key: 'kemitraan', label: 'Setor & Poin' },
  { key: 'budidaya', label: 'Maggot & Kompos' },
  { key: 'eduwisata', label: 'Eduwisata' },
];

export function FaqAccordion() {
  const [topic, setTopic] = useState<FaqTopicFilter>('all');

  const filtered =
    topic === 'all' ? PUBLIC_FAQS : PUBLIC_FAQS.filter((item) => item.topic === topic);

  return (
    <div className="stack">
      <div className="product-filter__chips" role="group" aria-label="Filter topik pertanyaan">
        {TOPIC_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={['chip', topic === opt.key ? 'chip--active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setTopic(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="faq-list">
        {filtered.map((item) => (
          <details key={item.question} className="faq-item">
            <summary>
              <span>{item.question}</span>
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <div className="faq-item__answer">{item.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
