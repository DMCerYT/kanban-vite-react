import { addDaysIso } from "./date";

export const storageKey = "kanban-personal-react-v1";
export const colors = ["#2f7d68", "#b06432", "#356f9f", "#6c5a8e", "#7a6534", "#a43d47"];

export function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

export function makeEmptyProject(name = "Proyecto personal", index = 0) {
  const columns = ["Ideas", "En marcha", "Esperando", "Hecho"].map((item) => ({
    id: uid("column"),
    name: item
  }));

  return {
    id: uid("project"),
    name,
    about: "",
    color: colors[index % colors.length],
    columns,
    tasks: []
  };
}

export function defaultState() {
  const project = makeEmptyProject("Proyecto personal", 0);
  project.about = "Usa este espacio para definir el objetivo, contexto y criterios de cierre del proyecto.";
  project.tasks = [
    {
      id: uid("task"),
      title: "Definir el resultado esperado",
      description: "Escribe que se ve como terminado y que queda fuera.",
      columnId: project.columns[0].id,
      dueDate: addDaysIso(2),
      priority: "high",
      owner: "Planificacion",
      createdAt: Date.now()
    },
    {
      id: uid("task"),
      title: "Separar el proyecto en pasos pequenos",
      description: "Convierte el objetivo en acciones que puedas mover por etapas.",
      columnId: project.columns[1].id,
      dueDate: addDaysIso(5),
      priority: "medium",
      owner: "Personal",
      createdAt: Date.now()
    }
  ];

  return {
    activeProjectId: project.id,
    projects: [project]
  };
}

export function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (stored && Array.isArray(stored.projects) && stored.projects.length) {
      return {
        ...stored,
        projects: stored.projects.map((project) => ({
          about: "",
          ...project
        }))
      };
    }
  } catch (error) {
    return defaultState();
  }
  return defaultState();
}

export function saveState(state) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}
