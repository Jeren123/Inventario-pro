export function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = "Eliminar", confirmClass = "inv-btn-danger" }) {
  return (
    <div className="inv-modal-bg" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="inv-confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="inv-confirm-actions">
          <button className="inv-btn inv-btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className={`inv-btn ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
