import { useEffect, useMemo, useRef, useState } from "react";
import { AuthPanel } from "./components/AuthPanel";
import { Board } from "./components/Board";
import { ColumnModal } from "./components/ColumnModal";
import { Dashboard } from "./components/Dashboard";
import { ProjectAbout } from "./components/ProjectAbout";
import { ProjectSidebar } from "./components/ProjectSidebar";
import { TaskModal } from "./components/TaskModal";
import { TopBar } from "./components/TopBar";
import {
  createColumn,
  createProject,
  createTask,
  describeKanbanError,
  deleteColumn,
  deleteProject,
  deleteTask,
  getKanbanState,
  moveTask,
  updateColumn,
  updateProjectAbout,
  updateTask
} from "./lib/kanbanApi";
import { hasSupabaseConfig, supabase } from "./lib/supabaseClient";
import "./styles.css";

const emptyTaskDraft = {
  id: "",
  title: "",
  description: "",
  columnId: "",
  dueDate: "",
  priority: "medium",
  owner: ""
};

const emptyColumnDraft = {
  id: "",
  name: ""
};

const emptyState = {
  activeProjectId: "",
  projects: []
};

export default function App() {
  const [session, setSession] = useState(null);
  const [state, setState] = useState(emptyState);
  const [projectName, setProjectName] = useState("");
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [taskDraft, setTaskDraft] = useState(emptyTaskDraft);
  const [columnDraft, setColumnDraft] = useState(emptyColumnDraft);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingAbout, setSavingAbout] = useState(false);
  const hasLoadedRef = useRef(false);
  const aboutSaveRef = useRef(null);

  const activeProject = useMemo(() => {
    return state.projects.find((project) => project.id === state.activeProjectId) || state.projects[0] || null;
  }, [state]);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setState(emptyState);
      hasLoadedRef.current = false;
      return;
    }

    refreshKanban();
  }, [session]);

  useEffect(() => {
    if (!activeProject || !hasLoadedRef.current) return;
    window.clearTimeout(aboutSaveRef.current);
    setSavingAbout(true);
    aboutSaveRef.current = window.setTimeout(async () => {
      try {
        await updateProjectAbout(activeProject.id, activeProject.about || "");
      } catch (error) {
        setError(describeKanbanError(error));
      } finally {
        setSavingAbout(false);
      }
    }, 650);

    return () => window.clearTimeout(aboutSaveRef.current);
  }, [activeProject?.id, activeProject?.about]);

  async function refreshKanban(preferredProjectId = "") {
    setLoading(true);
    setError("");
    try {
      const nextState = await getKanbanState();
      const activeProjectId = preferredProjectId && nextState.projects.some((project) => project.id === preferredProjectId)
        ? preferredProjectId
        : nextState.activeProjectId;
      setState({ ...nextState, activeProjectId });
      hasLoadedRef.current = true;
    } catch (error) {
      setError(describeKanbanError(error));
    } finally {
      setLoading(false);
    }
  }

  function updateActiveProjectLocal(updater) {
    setState((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== current.activeProjectId) return project;
        return updater(project);
      })
    }));
  }

  async function runMutation(action, preferredProjectId = state.activeProjectId) {
    setError("");
    try {
      await action();
      await refreshKanban(preferredProjectId);
    } catch (error) {
      setError(describeKanbanError(error));
    }
  }

  async function handleCreateProject(event) {
    event.preventDefault();
    const name = projectName.trim();
    if (!name) return;

    setError("");
    try {
      const project = await createProject(name, state.projects.length);
      setProjectName("");
      setQuery("");
      setDateFilter("all");
      await refreshKanban(project.id);
    } catch (error) {
      setError(describeKanbanError(error));
    }
  }

  function handleDeleteProject() {
    if (!activeProject) return;
    const confirmed = window.confirm(`Eliminar "${activeProject.name}" tambien borrara sus etapas y pasos. Esta accion no se puede deshacer.`);
    if (!confirmed) return;

    runMutation(() => deleteProject(activeProject.id), "");
  }

  function handleProjectAboutChange(about) {
    updateActiveProjectLocal((project) => ({ ...project, about }));
  }

  function openTaskModal(taskId = "", columnId = "") {
    if (!activeProject) return;
    const task = activeProject.tasks.find((item) => item.id === taskId);
    setTaskDraft(
      task
        ? { ...emptyTaskDraft, ...task }
        : {
            ...emptyTaskDraft,
            columnId: columnId || activeProject.columns[0]?.id || ""
          }
    );
    setTaskModalOpen(true);
  }

  function handleTaskDraftChange(field, value) {
    setTaskDraft((draft) => ({ ...draft, [field]: value }));
  }

  async function handleTaskSubmit(event) {
    event.preventDefault();
    if (!activeProject) return;
    const title = taskDraft.title.trim();
    if (!title) return;

    const payload = {
      title,
      description: taskDraft.description.trim(),
      columnId: taskDraft.columnId,
      dueDate: taskDraft.dueDate,
      priority: taskDraft.priority,
      owner: taskDraft.owner.trim()
    };

    await runMutation(() => (
      taskDraft.id
        ? updateTask(taskDraft.id, payload)
        : createTask(activeProject.id, payload, activeProject.tasks.length)
    ));
    setTaskModalOpen(false);
  }

  async function handleDeleteTask() {
    await runMutation(() => deleteTask(taskDraft.id));
    setTaskModalOpen(false);
  }

  function openColumnModal(columnId = "") {
    if (!activeProject) return;
    const column = activeProject.columns.find((item) => item.id === columnId);
    setColumnDraft(column ? { ...column } : emptyColumnDraft);
    setColumnModalOpen(true);
  }

  function handleColumnDraftChange(field, value) {
    setColumnDraft((draft) => ({ ...draft, [field]: value }));
  }

  async function handleColumnSubmit(event) {
    event.preventDefault();
    if (!activeProject) return;
    const name = columnDraft.name.trim();
    if (!name) return;

    await runMutation(() => (
      columnDraft.id
        ? updateColumn(columnDraft.id, name)
        : createColumn(activeProject.id, name, activeProject.columns.length)
    ));
    setColumnModalOpen(false);
  }

  async function handleDeleteColumn() {
    if (!activeProject || activeProject.columns.length <= 1) return;

    const fallback = activeProject.columns.find((column) => column.id !== columnDraft.id);
    await runMutation(() => deleteColumn(columnDraft.id, fallback.id));
    setColumnModalOpen(false);
  }

  async function handleMoveTask(taskId, columnId) {
    setDraggedTaskId(null);
    await runMutation(() => moveTask(taskId, columnId));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setState(emptyState);
  }

  if (!hasSupabaseConfig || (!loading && !session)) {
    return <AuthPanel />;
  }

  if (loading && !activeProject) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p className="auth-copy">Cargando tu tablero...</p>
        </section>
      </main>
    );
  }

  if (!activeProject) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">K</div>
            <div>
              <h1>Kanban Personal</h1>
              <span>Base de datos pendiente</span>
            </div>
          </div>
          <p className="auth-copy">{error || "No se pudo cargar tu tablero."}</p>
          <button className="btn" type="button" onClick={() => refreshKanban()}>Reintentar</button>
          <button className="link-button" type="button" onClick={handleLogout}>Cerrar sesion</button>
        </section>
      </main>
    );
  }

  return (
    <div className="app">
      <ProjectSidebar
        projects={state.projects}
        activeProjectId={state.activeProjectId}
        projectName={projectName}
        setProjectName={setProjectName}
        userEmail={session?.user?.email}
        onLogout={handleLogout}
        onCreateProject={handleCreateProject}
        onSelectProject={(projectId) => {
          setState((current) => ({ ...current, activeProjectId: projectId }));
          setQuery("");
          setDateFilter("all");
        }}
      />

      <main className="main">
        <TopBar
          project={activeProject}
          query={query}
          setQuery={setQuery}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onAddColumn={() => openColumnModal()}
          onDeleteProject={handleDeleteProject}
          onAddTask={() => openTaskModal()}
        />

        <section className="project-shell">
          {error && <div className="status-banner error">{error}</div>}
          {savingAbout && <div className="status-banner">Guardando notas...</div>}
          <ProjectAbout value={activeProject.about || ""} onChange={handleProjectAboutChange} />
          <Dashboard project={activeProject} />
          <Board
            project={activeProject}
            query={query}
            dateFilter={dateFilter}
            draggedTaskId={draggedTaskId}
            setDraggedTaskId={setDraggedTaskId}
            onMoveTask={handleMoveTask}
            onEditTask={(taskId) => openTaskModal(taskId)}
            onAddTask={(columnId) => openTaskModal("", columnId)}
            onEditColumn={(columnId) => openColumnModal(columnId)}
          />
        </section>
      </main>

      <TaskModal
        open={taskModalOpen}
        taskDraft={taskDraft}
        columns={activeProject.columns}
        canDelete={Boolean(taskDraft.id)}
        onChange={handleTaskDraftChange}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        onDelete={handleDeleteTask}
      />

      <ColumnModal
        open={columnModalOpen}
        columnDraft={columnDraft}
        canDelete={Boolean(columnDraft.id) && activeProject.columns.length > 1}
        onChange={handleColumnDraftChange}
        onClose={() => setColumnModalOpen(false)}
        onSubmit={handleColumnSubmit}
        onDelete={handleDeleteColumn}
      />
    </div>
  );
}
