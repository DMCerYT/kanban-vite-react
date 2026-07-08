import { Icon } from "./Icons";

export function ProjectSidebar({
  projects,
  activeProjectId,
  projectName,
  setProjectName,
  userEmail,
  onCreateProject,
  onSelectProject,
  onLogout
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <Icon name="board" />
        </div>
        <div>
          <h1>Kanban Personal</h1>
          <span>Proyectos y pasos</span>
        </div>
      </div>

      <div>
        <div className="section-title">
          <span>Proyectos</span>
          <button className="icon-button" type="button" title="Nuevo proyecto" aria-label="Nuevo proyecto" onClick={() => document.getElementById("projectName")?.focus()}>
            <Icon name="plus" />
          </button>
        </div>
        <div className="project-list">
          {projects.map((project) => (
            <button
              className={`project-button${project.id === activeProjectId ? " active" : ""}`}
              type="button"
              key={project.id}
              onClick={() => onSelectProject(project.id)}
            >
              <span className="dot" style={{ background: project.color }} />
              <span className="project-name">{project.name}</span>
              <span className="pill">{project.tasks.length}</span>
            </button>
          ))}
        </div>
      </div>

      <form className="side-form" onSubmit={onCreateProject}>
        <label htmlFor="projectName">Nuevo proyecto</label>
        <input
          className="input"
          id="projectName"
          autoComplete="off"
          placeholder="Ej. Casa, salud, negocio"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
        />
        <button className="btn" type="submit">
          <Icon name="plus" />
          Crear
        </button>
        <div className="account-box">
          <span>{userEmail}</span>
          <button className="link-button" type="button" onClick={onLogout}>Salir</button>
        </div>
      </form>
    </aside>
  );
}
