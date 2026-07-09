import { addDaysIso } from "./date";
import { colors } from "./storage";
import { supabase } from "./supabaseClient";

export function describeKanbanError(error) {
  if (!error) return "No se pudo completar la operacion.";
  if (error.code === "42P01") {
    return "La base de datos todavia no tiene las tablas Kanban. Ejecuta la migracion SQL en Supabase y vuelve a intentar.";
  }
  if (error.code === "42501") {
    return "Supabase bloqueo la operacion por permisos. Revisa que la migracion tenga RLS y GRANT para el rol authenticated.";
  }
  if (error.message?.includes("JWT")) {
    return "La sesion de Supabase no esta vigente. Cierra sesion y vuelve a entrar.";
  }
  return error.message || "No se pudo completar la operacion.";
}

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase no esta configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.");
  }
}

function mapProject(row, columns, tasks) {
  return {
    id: row.id,
    name: row.name,
    about: row.about || "",
    color: row.color,
    columns: columns
      .filter((column) => column.project_id === row.id)
      .map((column) => ({
        id: column.id,
        name: column.name,
        position: column.position
      })),
    tasks: tasks
      .filter((task) => task.project_id === row.id)
      .map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        columnId: task.column_id,
        dueDate: task.due_date || "",
        priority: task.priority,
        owner: task.owner || "",
        position: task.position,
        createdAt: task.created_at
      }))
  };
}

export async function getKanbanState() {
  requireSupabase();

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, name, about, color, created_at")
    .order("created_at", { ascending: true });
  if (projectsError) throw projectsError;

  if (!projects.length) {
    const project = await createInitialProject("Proyecto personal", 0);
    return { activeProjectId: project.id, projects: [project] };
  }

  const projectIds = projects.map((project) => project.id);
  const [{ data: columns, error: columnsError }, { data: tasks, error: tasksError }] = await Promise.all([
    supabase
      .from("kanban_columns")
      .select("id, project_id, name, position, created_at")
      .in("project_id", projectIds)
      .order("position", { ascending: true }),
    supabase
      .from("tasks")
      .select("id, project_id, column_id, title, description, due_date, priority, owner, position, created_at")
      .in("project_id", projectIds)
      .order("created_at", { ascending: true })
  ]);

  if (columnsError) throw columnsError;
  if (tasksError) throw tasksError;

  const mappedProjects = projects.map((project) => mapProject(project, columns || [], tasks || []));
  return {
    activeProjectId: mappedProjects[0].id,
    projects: mappedProjects
  };
}

export async function createInitialProject(name, index = 0) {
  requireSupabase();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: userData.user.id,
      name,
      about: "Usa este espacio para definir el objetivo, contexto y criterios de cierre del proyecto.",
      color: colors[index % colors.length]
    })
    .select("id, name, about, color, created_at")
    .single();
  if (projectError) throw projectError;

  const defaultColumns = ["Ideas", "En marcha", "Esperando", "Hecho"].map((columnName, position) => ({
    project_id: project.id,
    name: columnName,
    position
  }));

  const { data: columns, error: columnsError } = await supabase
    .from("kanban_columns")
    .insert(defaultColumns)
    .select("id, project_id, name, position, created_at")
    .order("position", { ascending: true });
  if (columnsError) throw columnsError;

  const defaultTasks = [
    {
      project_id: project.id,
      column_id: columns[0].id,
      title: "Definir el resultado esperado",
      description: "Escribe que se ve como terminado y que queda fuera.",
      due_date: addDaysIso(2),
      priority: "high",
      owner: "Planificacion",
      position: 0
    },
    {
      project_id: project.id,
      column_id: columns[1].id,
      title: "Separar el proyecto en pasos pequenos",
      description: "Convierte el objetivo en acciones que puedas mover por etapas.",
      due_date: addDaysIso(5),
      priority: "medium",
      owner: "Personal",
      position: 1
    }
  ];

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .insert(defaultTasks)
    .select("id, project_id, column_id, title, description, due_date, priority, owner, position, created_at");
  if (tasksError) throw tasksError;

  return mapProject(project, columns, tasks);
}

export async function createProject(name, index) {
  return createInitialProject(name, index);
}

export async function updateProjectAbout(projectId, about) {
  requireSupabase();
  const { error } = await supabase.from("projects").update({ about }).eq("id", projectId);
  if (error) throw error;
}

export async function deleteProject(projectId) {
  requireSupabase();
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw error;
}

export async function createColumn(projectId, name, position) {
  requireSupabase();
  const { error } = await supabase.from("kanban_columns").insert({ project_id: projectId, name, position });
  if (error) throw error;
}

export async function updateColumn(columnId, name) {
  requireSupabase();
  const { error } = await supabase.from("kanban_columns").update({ name }).eq("id", columnId);
  if (error) throw error;
}

export async function deleteColumn(columnId, fallbackColumnId) {
  requireSupabase();
  const { error: taskError } = await supabase.from("tasks").update({ column_id: fallbackColumnId }).eq("column_id", columnId);
  if (taskError) throw taskError;
  const { error } = await supabase.from("kanban_columns").delete().eq("id", columnId);
  if (error) throw error;
}

export async function createTask(projectId, task, position) {
  requireSupabase();
  const { error } = await supabase.from("tasks").insert({
    project_id: projectId,
    column_id: task.columnId,
    title: task.title,
    description: task.description,
    due_date: task.dueDate || null,
    priority: task.priority,
    owner: task.owner,
    position
  });
  if (error) throw error;
}

export async function updateTask(taskId, task) {
  requireSupabase();
  const { error } = await supabase.from("tasks").update({
    column_id: task.columnId,
    title: task.title,
    description: task.description,
    due_date: task.dueDate || null,
    priority: task.priority,
    owner: task.owner
  }).eq("id", taskId);
  if (error) throw error;
}

export async function deleteTask(taskId) {
  requireSupabase();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}

export async function moveTask(taskId, columnId) {
  requireSupabase();
  const { error } = await supabase.from("tasks").update({ column_id: columnId }).eq("id", taskId);
  if (error) throw error;
}
