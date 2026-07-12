import { Link } from "react-router-dom";

interface DashboardStatCardProps {
  label: string;
  value: number;
  linkLabel: string;
  to: string;
}

function DashboardStatCard({
  label,
  value,
  linkLabel,
  to,
}: DashboardStatCardProps) {
  return (
    <article className="dashboard-stat-card">
      <span>{label}</span>

      <strong>{value}</strong>

      <Link to={to}>
        {linkLabel}
      </Link>
    </article>
  );
}

export default DashboardStatCard;