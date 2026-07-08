import { Icon } from "./Icons";

export function TopBar({
  project,
  query,
  setQuery,
  dateFilter,
  setDateFilter,
  onAddColumn,
  onDeleteProject,
  onAddTask
}) {
  return (
    <header className="topbar">
      <div className="project-header">
        <span className="dot" style={{ background: project.color }} aria-hidden="true" />
        <h2>{project.name}</h2>
      </div>
      <div className="toolbar">
        <div className="search">
          <Icon name="search" />
          <label className="sr-only" htmlFor="searchInput">Buscar</label>
          <input className="input" id="searchInput" placeholder="Buscar paso" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <select className="select" value={dateFilter} aria-label="Filtro de fecha" onChange={(event) => setDateFilter(event.target.value)}>
          <option value="all">Todas las fechas</option>
          <option value="overdue">Vencidas</option>
          <option value="today">Para hoy</option>
          <option value="week">Esta semana</option>
          <option value="none">Sin fecha</option>
        </select>
        <button className="btn secondary" type="button" onClick={onAddColumn}>
          <Icon name="plus" />
          Etapa
        </button>
        <button className="btn secondary" type="button" onClick={onDeleteProject}>
          <Icon name="trash" />
          Proyecto
        </button>
        <button className="btn" type="button" onClick={onAddTask}>
          <Icon name="plus" />
          Paso
        </button>
      </div>
    </header>
  );
}
