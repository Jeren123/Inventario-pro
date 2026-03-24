import { useProveedores } from "../hooks/useProveedores";
import { Icons }          from "../components/shared/Icons";
import { Alert }          from "../components/shared/Alert";
import { ConfirmModal }   from "../components/shared/ConfirmModal";

export function ProveedoresPage({ token }) {
  const {
    proveedores, loading, alert, confirm, setConfirm,
    showForm, form, setField, editId,
    openCreate, openEdit, handleGuardar, handleEliminar,
  } = useProveedores(token);

  return (
    <div className="inv-fade">
      {confirm && (
        <ConfirmModal
          title="Desactivar proveedor"
          message={`¿Desactivar a "${confirm.nombre}"? El historial se conservará.`}
          onConfirm={() => handleEliminar(confirm.id)}
          onCancel={() => setConfirm(null)}
          confirmLabel="Desactivar"
        />
      )}

      <div className="inv-ph"><h2>Proveedores</h2><p>Gestiona tu red de proveedores</p></div>
      <Alert msg={alert.msg} type={alert.type} />

      <div className="inv-stats inv-stats-2" style={{ marginBottom: 18 }}>
        {[
          { lbl: "Total proveedores", val: proveedores.length,                         color: "var(--dark)" },
          { lbl: "Activos",           val: proveedores.filter((p) => p.activo).length, color: "var(--success)" },
        ].map((s) => (
          <div key={s.lbl} className="inv-stat">
            <div className="inv-stat-accent" style={{ background: s.color }} />
            <div className="inv-stat-lbl">{s.lbl}</div>
            <div className="inv-stat-val">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="inv-card">
        <div className="inv-card-head">
          <div className="inv-card-title"><Icons.Truck /> Proveedores</div>
          <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={openCreate}><Icons.Plus /> Nuevo proveedor</button>
        </div>

        {showForm && (
          <>
            <div style={{ padding: "12px 18px 0" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink3)" }}>{editId ? "Editar proveedor" : "Nuevo proveedor"}</span>
            </div>
            <form onSubmit={handleGuardar}>
              <div className="inv-form-grid">
                <div className="inv-fg"><label className="inv-label">Nombre *</label><input className="inv-input" value={form.nombre} onChange={setField("nombre")} required placeholder="Empresa o persona" /></div>
                <div className="inv-fg"><label className="inv-label">Contacto</label><input className="inv-input" value={form.contacto} onChange={setField("contacto")} placeholder="Nombre del contacto" /></div>
                <div className="inv-fg"><label className="inv-label">Teléfono</label><input className="inv-input" value={form.telefono} onChange={setField("telefono")} placeholder="+57 300 000 0000" /></div>
                <div className="inv-fg"><label className="inv-label">Email</label><input className="inv-input" type="email" value={form.email} onChange={setField("email")} placeholder="proveedor@empresa.com" /></div>
                <div className="inv-fg inv-col2"><label className="inv-label">Dirección</label><input className="inv-input" value={form.direccion} onChange={setField("direccion")} placeholder="Calle, ciudad" /></div>
                <div className="inv-col2" style={{ display: "flex", gap: 8 }}>
                  <button className="inv-btn inv-btn-green" type="submit"><Icons.Check /> {editId ? "Guardar cambios" : "Crear proveedor"}</button>
                  <button className="inv-btn inv-btn-ghost" type="button" onClick={() => openCreate()}>Cancelar</button>
                </div>
              </div>
            </form>
            <div className="inv-divider" />
          </>
        )}

        <div className="inv-table-wrap">
          {loading ? (
            <div className="inv-loading"><span className="inv-spin" /> Cargando...</div>
          ) : proveedores.length === 0 ? (
            <div className="inv-empty"><div className="inv-empty-ico">🚚</div><p>No hay proveedores registrados</p></div>
          ) : (
            <table className="inv-table">
              <thead><tr><th>Nombre</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {proveedores.map((p) => (
                  <tr key={p.id_proveedor}>
                    <td data-label="Nombre" style={{ fontWeight: 600 }}>{p.nombre}</td>
                    <td data-label="Contacto" style={{ color: "var(--ink3)" }}>{p.contacto || "—"}</td>
                    <td data-label="Teléfono" className="inv-mono" style={{ fontSize: "0.78rem" }}>{p.telefono || "—"}</td>
                    <td data-label="Email" style={{ fontSize: "0.78rem", color: "var(--info)" }}>{p.email || "—"}</td>
                    <td data-label="Estado"><span className={`inv-badge ${p.activo ? "inv-badge-green" : "inv-badge-gray"}`}>{p.activo ? "Activo" : "Inactivo"}</span></td>
                    <td data-label="Acciones">
                      <div style={{ display: "flex", gap: 5 }}>
                        <button className="inv-btn-ico inv-btn-ico-edit" onClick={() => openEdit(p)}><Icons.Edit /></button>
                        <button className="inv-btn-ico" onClick={() => setConfirm({ id: p.id_proveedor, nombre: p.nombre })}><Icons.Trash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
