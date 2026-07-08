import { getStats } from "../lib/tasks";

export function Dashboard({ project }) {
  return (
    <section className="dashboard-band">
      <div className="stats">
        {getStats(project).map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
