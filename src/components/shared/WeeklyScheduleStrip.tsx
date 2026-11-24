import { CalendarClock } from 'lucide-react';
import { WEEKLY_OPERATIONAL_SCHEDULE } from '@/config/education';
import { Badge } from '@/components/ui/Badge';

export function WeeklyScheduleStrip() {
  return (
    <div className="schedule-strip">
      {WEEKLY_OPERATIONAL_SCHEDULE.map((item) => (
        <article key={item.activity} className="schedule-card">
          <div className="cluster cluster--between">
            <Badge tone="organic">{item.dayLabel}</Badge>
            <span className="text-xs font-semibold text-primary cluster">
              <CalendarClock size={14} aria-hidden="true" />
              {item.timeRange}
            </span>
          </div>
          <h3>{item.activity}</h3>
          <p className="text-xs text-muted">{item.note}</p>
        </article>
      ))}
    </div>
  );
}
