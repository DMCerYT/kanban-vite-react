import { Icon } from "./Icons";

export function ColumnModal({
  open,
  columnDraft,
  canDelete,
  onChange,
  onClose,
  onSubmit,
  onDelete
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true" aria-labelledby="columnModalTitle" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={onSubmit}>
        <div className="modal-header">
          <h3 id="columnModalTitle">Etapa</h3>
          <button className="icon-button" type="button" aria-label="Cerrar" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label htmlFor="columnName">Nombre</label>
            <input className="input" id="columnName" required maxLength="36" value={columnDraft.name} onChange={(event) => onChange("name", event.target.value)} />
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
