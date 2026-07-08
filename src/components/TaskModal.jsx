import { Icon } from "./Icons";

export function TaskModal({
  open,
  taskDraft,
  columns,
  canDelete,
  onChange,
  onClose,
  onSubmit,
  onDelete
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true" aria-labelledby="taskModalTitle" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={onSubmit}>
        <div className="modal-header">
          <h3 id="taskModalTitle">Paso</h3>
          <button className="icon-button" type="button" aria-label="Cerrar" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <div className="modal-body">
          <div className="field full">
            <label htmlFor="taskTitle">Nombre</label>
            <input className="input" id="taskTitle" required maxLength="90" value={taskDraft.title} onChange={(event) => onChange("title", event.target.value)} />
          </div>
          <div className="field full">
            <label htmlFor="taskDescription">Notas</label>
            <textarea className="textarea" id="taskDescription" maxLength="500" value={taskDraft.description} onChange={(event) => onChange("description", event.target.value)} />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="taskColumn">Etapa</label>
              <select className="select" id="taskColumn" value={taskDraft.columnId} onChange={(event) => onChange("columnId", event.target.value)}>
                {columns.map((column) => <option key={column.id} value={column.id}>{column.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="taskDueDate">Fecha</label>
              <input className="input" id="taskDueDate" type="date" value={taskDraft.dueDate} onChange={(event) => onChange("dueDate", event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="taskPriority">Prioridad</label>
              <select className="select" id="taskPriority" value={taskDraft.priority} onChange={(event) => onChange("priority", event.target.value)}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="taskOwner">Area</label>
              <input className="input" id="taskOwner" maxLength="40" placeholder="Personal, trabajo, salud" value={taskDraft.owner} onChange={(event) => onChange("owner", event.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn secondary" type="button" onClick={onClose}>Cancelar</button>
          {canDelete && <button className="btn danger" type="button" onClick={onDelete}>Eliminar</button>}
          <button className="btn" type="submit">Guardar</button>
        </div>
      </form>
    </div>
  );
}
