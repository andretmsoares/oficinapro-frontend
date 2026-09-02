import type { LucideIcon } from "lucide-react";

import "./statCard.style.css";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <div>
          <span className="stat-title">
            {title}
          </span>

          <strong className="stat-value">
            {value}
          </strong>
        </div>

        <div className="stat-icon">
          <Icon size={21} />
        </div>
      </div>

      {description && (
        <span className="stat-description">
          {description}
        </span>
      )}
    </div>
  );
}