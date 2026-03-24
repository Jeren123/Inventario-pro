import { useState } from "react";
import { Icons } from "../shared/Icons";
import { Alert } from "../shared/Alert";

/**
 * Modal para editar un producto existente.
 * Recibe `onSaved(updatedForm)` — la lógica de API vive en useProducts.
 */
export function EditProductModal({ producto, onClose, onSaved }) {
  const [form,    setForm]    = useState({ ...producto });
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  const setField = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await onSaved(form);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="inv-modal-bg"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="inv-modal">
        <div className="inv-card-head">
          <div className="inv-card-title"><Icons.Edit /> Editar producto</div>
          <button className="inv-btn-ico" onClick={onClose} aria-label="Cerrar">
            <Icons.X />
          </button>
        </div>

        {err && (
          <div style={{ padding: "14px 18px 0" }}>
            <Alert msg={err} type="err" />
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="inv-form-grid">
            <div className="inv-fg">
              <label className="inv-label">Nombre</label>
              <input className="inv-input" value={form.nombre} onChange={setField("nombre")} required />
            </div>
            <div className="inv-fg">
              <label className="inv-label">Descripción</label>
              <input className="inv-input" value={form.descripcion || ""} onChange={setField("descripcion")} />
            </div>
            <div className="inv-fg">
              <label className="inv-label">Precio compra</label>
              <input className="inv-input" type="number" step="0.01" min="0" value={form.precio_compra} onChange={setField("precio_compra")} required />
            </div>
            <div className="inv-fg">
              <label className="inv-label">Precio venta</label>
              <input className="inv-input" type="number" step="0.01" min="0" value={form.precio_venta} onChange={setField("precio_venta")} required />
            </div>
            <div className="inv-fg">
              <label className="inv-label">Stock actual</label>
              <input className="inv-input" type="number" min="0" value={form.stock_actual} onChange={setField("stock_actual")} required />
            </div>
            <div className="inv-fg">
              <label className="inv-label">Stock mínimo</label>
              <input className="inv-input" type="number" min="0" value={form.stock_minimo} onChange={setField("stock_minimo")} required />
            </div>
            <div className="inv-fg" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                id="activo-edit"
                checked={form.activo}
                onChange={setField("activo")}
                style={{ width: 16, height: 16, accentColor: "var(--primary)" }}
              />
              <label className="inv-label" htmlFor="activo-edit" style={{ textTransform: "none", letterSpacing: 0, cursor: "pointer" }}>
                Producto activo
              </label>
            </div>
            <div className="inv-col2" style={{ display: "flex", gap: 8 }}>
              <button className="inv-btn inv-btn-green" type="submit" disabled={loading}>
                {loading ? <span className="inv-spin" /> : <><Icons.Check /> Guardar cambios</>}
              </button>
              <button className="inv-btn inv-btn-ghost" type="button" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
