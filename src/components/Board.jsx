import { formatDate, dueClass } from "../lib/date";
import { matchesFilters, priorityLabel } from "../lib/tasks";
import { Icon } from "./Icons";

export function Board({
  project,
  query,
  dateFilter,
  draggedTaskId,
  setDraggedTaskId,
  onMoveTask,
  onEditTask,
  onAddTask,
  onEditColumn
}) {
  return (
    <section className="board-scroller">
      <div className="board">
        {project.columns.map((column) => {
          const tasks = project.tasks.filter((task) => task.columnId === column.id && matchesFilters(task, query, dateFilter));

          return (
            <section
              className="column"
              key={column.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => draggedTaskId && onMoveTask(draggedTaskId, column.id)}
            >
              <div className="column-header">
                <div className="column-title">
                  <span>{column.name}</span>
                  <span className="pill">{tasks.length}</span>
                </div>
                <button className="icon-button" type="button" title="Editar etapa" aria-label="Editar etapa" onClick={() => onEditColumn(column.id)}>
                  <Icon name="edit" />
                </button>
                <button className="icon-button" type="button" title="Agregar paso" aria-label="Agregar paso" onClick={() => onAddTask(column.id)}>
                  <Icon name="plus" />
                </button>
              </div>
              <div className="cards">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => onEditTask(task.id)}
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onDragEnd={() => setDraggedTaskId(null)}
                  />
                ))}
                {!tasks.length && <div className="empty">Sin pasos</div>}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function TaskCard({ task, onEdit, onDragStart, onDragEnd }) {
  return (
    <article className={`task-card priority-${task.priority || "medium"}`} draggable onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="task-top">
        <h3 className="task-title">{task.title}</h3>
        <button className="icon-button" type="button" title="Editar paso" aria-label="Editar paso" onClick={onEdit}>
          <Icon name="edit" />
        </button>
      </div>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="meta-row">
        <span className={`tag ${dueClass(task.dueDate)}`}>
          <Icon name="calendar" />
          {formatDate(task.dueDate)}
        </span>
        <span className="tag">{priorityLabel(task.priority)}</span>
        {task.owner && <span className="tag">{task.owner}</span>}
      </div>
    </article>
  );
}
