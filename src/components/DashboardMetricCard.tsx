import type { LucideIcon } from 'lucide-react';

interface DashboardMetricCardProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: 'red' | 'beige' | 'green' | 'yellow'| 'black' ;
  progress?: number;
}

export function DashboardMetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone = 'beige',
  progress,
}: DashboardMetricCardProps) {
  const boundedProgress = progress === undefined ? undefined : Math.min(100, Math.max(0, progress));
  const barColor = boundedProgress !== undefined && boundedProgress >= 75 ? '#181818' : '#E05A67';

  return (
    <article className="doodle-card dashboard-metric-card">
      <div className="dashboard-metric-heading">
        <span className="dashboard-metric-label">{label}</span>
        <span className={`dashboard-metric-icon dashboard-metric-icon--${tone}`} aria-hidden="true">
          <Icon size={23} strokeWidth={2.5} />
        </span>
      </div>
      <p className="dashboard-metric-value" aria-label={`${label}: ${value}`}>{value}</p>
      <p className="dashboard-metric-description">{description}</p>
      {boundedProgress !== undefined && (
        <div
          className="dashboard-metric-progress"
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={boundedProgress}
        >
          <span style={{ width: `${boundedProgress}%`, backgroundColor: barColor }} />
        </div>
      )}
    </article>
  );
}
