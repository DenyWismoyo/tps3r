import { Award } from 'lucide-react';
import { POINTS_REWARD_CATALOG } from '@/config/education';
import { SITE_CONFIG } from '@/config/site';
import { formatNumber } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import { WhatsAppButton } from './WhatsAppButton';

export function PointsRewardCatalog() {
  return (
    <div className="grid-3">
      {POINTS_REWARD_CATALOG.map((reward) => (
        <article key={reward.id} className="reward-card">
          <div className="cluster cluster--between">
            <Badge tone="organic">{reward.categoryBadge}</Badge>
            <Award size={18} className="text-accent" aria-hidden="true" />
          </div>
          <h3>{reward.title}</h3>
          <div className="reward-card__points">
            {formatNumber(reward.pointsCost, 0)} <span className="text-xs text-muted">poin</span>
          </div>
          <p className="text-xs font-semibold text-primary">{reward.unitLabel}</p>
          <p className="text-sm text-muted">{reward.note}</p>
          <WhatsAppButton
            message={`Halo ${SITE_CONFIG.shortName}, saya ingin menukar ${reward.pointsCost} poin tabungan sampah dengan *${reward.title}*. Mohon info ketersediaannya.`}
            label="Tukar via WA"
            variant="outline"
            size="sm"
            block
          />
        </article>
      ))}
    </div>
  );
}
