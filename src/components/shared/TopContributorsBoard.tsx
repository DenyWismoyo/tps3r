import { Trophy } from 'lucide-react';
import { CONTRIBUTOR_TYPE_LABELS } from '@/types/database';
import type { PublicTopContributor } from '@/services/contributors.service';
import { formatNumber } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';

export interface TopContributorsBoardProps {
  contributors: readonly PublicTopContributor[];
}

export function TopContributorsBoard({ contributors }: TopContributorsBoardProps) {
  if (contributors.length === 0) return null;

  return (
    <Card elevated>
      <CardBody className="stack stack--sm">
        <div className="cluster cluster--between">
          <div>
            <span className="badge badge--organic">
              <Trophy size={13} /> Papan Apresiasi Mitra
            </span>
            <h3>5 Penyetor Sampah Organik Teraktif</h3>
            <p className="text-xs text-muted">
              Apresiasi warga, warung, dan pasar sekitar Kadipiro–Banjarsari yang paling konsisten
              memilah sampah dari sumbernya.
            </p>
          </div>
        </div>

        <div className="stack stack--xs">
          {contributors.map((item, idx) => (
            <div key={item.id} className="leaderboard-row">
              <div className="cluster">
                <span
                  className={['leaderboard-rank', idx === 0 ? 'leaderboard-rank--top' : '']
                    .filter(Boolean)
                    .join(' ')}
                >
                  #{idx + 1}
                </span>
                <div>
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-muted">
                    {item.memberCode} • {CONTRIBUTOR_TYPE_LABELS[item.type]}
                  </div>
                </div>
              </div>
              <Badge tone="available">{formatNumber(item.totalDepositedKg, 0)} kg</Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
