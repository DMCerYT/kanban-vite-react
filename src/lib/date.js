export function todayIso() {
  const now = new Date();
  const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return local.toISOString().slice(0, 10);
}

export function addDaysIso(days) {
  const date = new Date(`${todayIso()}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("es", { day: "numeric", month: "short" });
}

export function dueClass(value) {
  if (!value) return "";
  if (value < todayIso()) return "overdue";
  if (value === todayIso()) return "today";
  return "";
}
