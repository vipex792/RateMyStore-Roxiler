function StatsCard({ icon, label, value, delay = 0 }) {
  return (
    <div
      className="stats-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="stats-card-icon">{icon}</div>
      <div className="stats-card-value">{value}</div>
      <div className="stats-card-label">{label}</div>
    </div>
  );
}

export default StatsCard;
