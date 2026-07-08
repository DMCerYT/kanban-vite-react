import { addDaysIso, todayIso } from "./date";

export function priorityLabel(value) {
  return { low: "Baja", medium: "Media", high: "Alta" }[value] || "Media";
}

export function matchesFilters(task, query, filter) {
  const normalizedQuery = query.trim().toLowerCase();
  const text = `${task.title} ${task.description} ${task.owner}`.toLowerCase();

  if (normalizedQuery && !text.includes(normalizedQuery)) return false;
  if (filter === "overdue") return task.dueDate && task.dueDate < todayIso();
  if (filter === "today") return task.dueDate === todayIso();
  if (filter === "week") return task.dueDate && task.dueDate >= todayIso() && task.dueDate <= addDaysIso(7);
  if (filter === "none") return !task.dueDate;
  return true;
}

export function getStats(project) {
  const total = project.tasks.length;
  const doneColumn = project.columns.find((column) => column.name.toLowerCase().includes("hecho"));
  const done = doneColumn ? project.tasks.filter((task) => task.columnId === doneColumn.id).length : 0;
  const overdue = project.tasks.filter((task) => task.dueDate && task.dueDate < todayIso()).length;
  const week = project.tasks.filter((task) => task.dueDate && task.dueDate >= todayIso() && task.dueDate <= addDaysIso(7)).length;

  return [
    ["Pasos", total],
    ["Completados", done],
    ["Vencidos", overdue],
    ["7 dias", week]
  ];
}
