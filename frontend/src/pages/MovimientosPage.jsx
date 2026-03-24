import { useMovimientos } from "../hooks/useMovimientos";
import { Icons }          from "../components/shared/Icons";
import { Alert }          from "../components/shared/Alert";

export function MovimientosPage({ token, isAdmin }) {
  const { productos, movimientos, loadingMov, alert, form, setField, handleSubmit } = useMovimientos(token, isAdmin);

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Movimientos</h2><p>Registra entradas y salidas de inventario</p></div>
      <Alert msg={alert.msg} type={alert.type} />

      {isAdmin && (
        <div className="inv-stats inv-stats-3" style={{ marginBottom: 20 }}>
          {[
            { lbl: "Total",    val: movimientos.length,                                           color: "var(--dark)" },
            { lbl: "Entradas", val: movimientos.filter((m) => m.tipo === "ENTRADA").length,       color: "var(--success)" },
            { lbl: "Salidas",  val: movimientos.filter((m) => m.tipo === "SALIDA").length,        color: "var(--danger)" },
          ].map((s) => (
            <div key={s.lbl} className="inv-stat">
              <div className="inv-stat-accent" style={{ background: s.color }} />
              <div className="inv-stat-lbl">{s.lbl}</div>
              <div className="inv-stat-val">{s.val}</div>
            </div>
          ))}
        </div>
      )}

      <div className={isAdmin ? "inv-grid-form-table" : "inv-grid-1"}>
        <div className="inv-card" style={{ alignSelf: "start" }}>
          <div className="inv-card-head">
            <div className="inv-card-title">{form.tipo === "entrada" ? <Icons.Up /> : <Icons.Down />} Registrar movimiento</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              {isAdmin && (
                <div className="inv-fg">
                  <label className="inv-label">Tipo</label>
                  <div className="inv-grid-2" style={{ gap: 8 }}>
                    {["entrada", "salida"].map((t) => (
                      <button key={t} type="button" onClick={() => setField("tipo")({ target: { value: t } })}
                        className={`inv-btn ${form.tipo === t ? "inv-btn-primary" : "inv-btn-ghost"}`} style={{ justifyContent: "center" }}>
                        {t === "entrada" ? <Icons.Up /> : <Icons.Down />}
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="inv-fg">
                <label className="inv-label">Producto</label>
                <select className="inv-select" value={form.id_producto} onChange={setField("id_producto")} required>
                  <option value="">Seleccionar...</option>
                  {productos.map((p) => <option key={p.id_producto} value={p.id_producto}>{p.nombre} (stock: {p.stock_actual})</option>)}
                </select>
              </div>
              <div className="inv-fg"><label className="inv-label">Cantidad</label><input className="inv-input" type="number" min="1" value={form.cantidad} onChange={setField("cantidad")} required placeholder="0" /></div>
              <div className="inv-fg"><label className="inv-label">Motivo</label><input className="inv-input" value={form.motivo} onChange={setField("motivo")} required placeholder="Ej: Compra a proveedor" /></div>
              <button className="inv-btn inv-btn-green" type="submit" style={{ justifyContent: "center" }}><Icons.Check /> Registrar</button>
            </div>
          </form>
        </div>

        {isAdmin && (
          <div className="inv-card">
            <div className="inv-card-head">
              <div className="inv-card-title"><Icons.List /> Historial</div>
              <span style={{ fontSize: "0.72rem", color: "var(--ink4)" }}>{movimientos.length} registros</span>
            </div>
            <div className="inv-table-wrap">
              {loadingMov ? <div className="inv-loading"><span className="inv-spin" /> Cargando...</div> :
                movimientos.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">📋</div><p>Sin movimientos</p></div> : (
                  <table className="inv-table">
                    <thead><tr><th>#</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Motivo</th></tr></thead>
                    <tbody>
                      {movimientos.map((m) => (
                        <tr key={m.id_movimiento}>
                          <td data-label="#" className="inv-mono" style={{ fontSize: "0.72rem", color: "var(--ink4)" }}>{m.id_movimiento}</td>
                          <td data-label="Producto" style={{ color: "var(--ink3)" }}>Prod. #{m.id_producto}</td>
                          <td data-label="Tipo"><span className={`inv-badge ${m.tipo === "ENTRADA" ? "inv-badge-green" : "inv-badge-red"}`}>{m.tipo}</span></td>
                          <td data-label="Cantidad" className="inv-mono" style={{ fontWeight: 600 }}>{m.cantidad}</td>
                          <td data-label="Motivo" style={{ color: "var(--ink3)", fontSize: "0.78rem" }}>{m.motivo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
