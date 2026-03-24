import { useUsuarios }    from "../hooks/useUsuarios";
import { Icons }           from "../components/shared/Icons";
import { Alert }           from "../components/shared/Alert";
import { ConfirmModal }    from "../components/shared/ConfirmModal";

export function UsuariosPage({ token }) {
  const {
    usuarios, loading, alert, confirm, setConfirm,
    showForm, setShowForm, form, setField,
    handleCrear, handleEliminar,
  } = useUsuarios(token);

  return (
    <div className="inv-fade">
      {confirm && (
        <ConfirmModal
          title="Eliminar usuario"
          message={`¿Eliminar a "${confirm.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={() => handleEliminar(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="inv-ph">
        <h2>Gestión de Usuarios</h2>
        <p>Crea y administra los accesos al sistema</p>
      </div>

      <div className="inv-card" style={{ marginBottom: 18, borderLeft: "3px solid var(--success)" }}>
        <div style={{ padding: "13px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "1.3rem" }}>🔒</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.84rem", marginBottom: 1 }}>Registro público desactivado</div>
            <div style={{ fontSize: "0.74rem", color: "var(--ink3)" }}>Solo el administrador puede crear nuevas cuentas.</div>
          </div>
          <span className="inv-badge inv-badge-green" style={{ marginLeft: "auto" }}>Seguro</span>
        </div>
      </div>

      <Alert msg={alert.msg} type={alert.type} />

      <div className="inv-stats inv-stats-3" style={{ marginBottom: 18 }}>
        {[
          { lbl: "Total usuarios",   val: usuarios.length,                             color: "var(--dark)" },
          { lbl: "Administradores",  val: usuarios.filter((u) => u.id_rol === 1).length, color: "var(--primary)" },
          { lbl: "Vendedores",       val: usuarios.filter((u) => u.id_rol === 2).length, color: "var(--success)" },
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
          <div className="inv-card-title"><Icons.Robot /> Usuarios del sistema</div>
          <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={() => setShowForm(!showForm)}>
            <Icons.Plus /> Crear usuario
          </button>
        </div>

        {showForm && (
          <>
            <div style={{ padding: "12px 18px 0" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink3)" }}>Nuevo usuario</span>
            </div>
            <form onSubmit={handleCrear}>
              <div className="inv-form-grid">
                <div className="inv-fg"><label className="inv-label">Nombre completo</label><input className="inv-input" value={form.nombre} onChange={setField("nombre")} required placeholder="Juan Pérez" /></div>
                <div className="inv-fg"><label className="inv-label">Correo electrónico</label><input className="inv-input" type="email" value={form.email} onChange={setField("email")} required placeholder="juan@empresa.com" /></div>
                <div className="inv-fg"><label className="inv-label">Contraseña</label><input className="inv-input" type="password" value={form.password} onChange={setField("password")} required placeholder="Mínimo 6 caracteres" /></div>
                <div className="inv-fg">
                  <label className="inv-label">Rol</label>
                  <select className="inv-select" value={form.id_rol} onChange={setField("id_rol")}>
                    <option value="2">Vendedor — acceso básico</option>
                    <option value="1">Administrador — acceso total</option>
                  </select>
                </div>
                <div className="inv-col2" style={{ display: "flex", gap: 8 }}>
                  <button className="inv-btn inv-btn-green" type="submit"><Icons.Check /> Crear usuario</button>
                  <button className="inv-btn inv-btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
                </div>
              </div>
            </form>
            <div className="inv-divider" />
          </>
        )}

        <div className="inv-table-wrap">
          {loading ? (
            <div className="inv-loading"><span className="inv-spin" /> Cargando...</div>
          ) : usuarios.length === 0 ? (
            <div className="inv-empty"><div className="inv-empty-ico">👤</div><p>No hay usuarios</p></div>
          ) : (
            <table className="inv-table">
              <thead><tr><th>#</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr></thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id_usuario}>
                    <td data-label="#" className="inv-mono" style={{ fontSize: "0.72rem", color: "var(--ink4)" }}>{u.id_usuario}</td>
                    <td data-label="Nombre" style={{ fontWeight: 600 }}>{u.nombre}</td>
                    <td data-label="Correo" style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>{u.email}</td>
                    <td data-label="Rol"><span className={`inv-badge ${u.id_rol === 1 ? "inv-badge-blue" : "inv-badge-green"}`}>{u.rol}</span></td>
                    <td data-label="Acciones">
                      <button className="inv-btn-ico" onClick={() => setConfirm({ id: u.id_usuario, nombre: u.nombre })} title="Eliminar">
                        <Icons.Trash />
                      </button>
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
