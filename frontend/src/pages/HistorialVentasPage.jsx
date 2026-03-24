import { useHistorialVentas } from "../hooks/useHistorialVentas";
import { Icons }               from "../components/shared/Icons";
import { Alert }               from "../components/shared/Alert";
import { formatDate }          from "../utils/formatters";

export function HistorialVentasPage({ token }) {
  const {
    data, loading, error,
    fechaInicio, setFechaInicio, fechaFin, setFechaFin,
    expandido, toggleExpandido, handleSearch, handleClear,
  } = useHistorialVentas(token);

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Historial de Ventas</h2><p>Consulta y filtra el registro completo de ventas</p></div>

      <div className="inv-card" style={{ marginBottom: 18 }}>
        <div className="inv-card-head"><div className="inv-card-title"><Icons.Clock /> Filtros</div></div>
        <div style={{ padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="inv-fg"><label className="inv-label">Fecha inicio</label><input className="inv-input" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} /></div>
          <div className="inv-fg"><label className="inv-label">Fecha fin</label><input className="inv-input" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} /></div>
          <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={handleSearch} disabled={loading}>{loading ? <span className="inv-spin" /> : <><Icons.Search /> Buscar</>}</button>
          <button className="inv-btn inv-btn-ghost inv-btn-sm" onClick={handleClear}>Limpiar</button>
        </div>
      </div>

      {error && <Alert msg={error} type="err" />}

      {data && (
        <div className="inv-stats inv-stats-3" style={{ marginBottom: 18 }}>
          {[
            { lbl: "Total ventas",    val: data.total_registros,                                                                                color: "var(--dark)" },
            { lbl: "Ingresos",        val: `$${data.total_periodo.toLocaleString("es", { maximumFractionDigits: 2 })}`,                         color: "var(--success)" },
            { lbl: "Ticket promedio", val: `$${data.total_registros > 0 ? (data.total_periodo / data.total_registros).toFixed(2) : "0.00"}`,    color: "var(--primary)" },
          ].map((s) => (
            <div key={s.lbl} className="inv-stat">
              <div className="inv-stat-accent" style={{ background: s.color }} />
              <div className="inv-stat-lbl">{s.lbl}</div>
              <div className="inv-stat-val" style={{ fontSize: "1.8rem" }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      <div className="inv-card">
        <div className="inv-card-head">
          <div className="inv-card-title"><Icons.Cart /> Registro de ventas</div>
          {data && <span style={{ fontSize: "0.72rem", color: "var(--ink4)" }}>{data.total_registros} ventas</span>}
        </div>
        <div className="inv-table-wrap">
          {loading ? (
            <div className="inv-loading"><span className="inv-spin" /> Cargando...</div>
          ) : !data || data.ventas.length === 0 ? (
            <div className="inv-empty"><div className="inv-empty-ico">🧾</div><p>Sin ventas en el período</p></div>
          ) : (
            <table className="inv-table">
              <thead><tr><th>#</th><th>Fecha</th><th>Productos</th><th>Total</th><th></th></tr></thead>
              <tbody>
                {data.ventas.map((v) => (
                  <>
                    <tr key={v.id_venta} style={{ cursor: "pointer" }} onClick={() => toggleExpandido(v.id_venta)}>
                      <td data-label="#" className="inv-mono" style={{ color: "var(--ink4)", fontSize: "0.72rem" }}>#{v.id_venta}</td>
                      <td data-label="Fecha" style={{ fontSize: "0.8rem" }}>{formatDate(v.fecha)}</td>
                      <td data-label="Productos" style={{ color: "var(--ink3)", fontSize: "0.78rem" }}>{v.items.length} producto{v.items.length !== 1 ? "s" : ""}</td>
                      <td data-label="Total" className="inv-mono" style={{ fontWeight: 700, color: "var(--success)" }}>${v.total.toFixed(2)}</td>
                      <td style={{ color: "var(--ink4)", fontSize: "0.72rem" }}>{expandido === v.id_venta ? "▲" : "▼"}</td>
                    </tr>
                    {expandido === v.id_venta && (
                      <tr key={`e-${v.id_venta}`}>
                        <td colSpan={5} style={{ padding: 0 }}>
                          <div style={{ background: "var(--bg3)", padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                              <thead><tr style={{ color: "var(--ink4)" }}><th style={{ textAlign: "left", padding: "3px 8px" }}>Producto</th><th style={{ textAlign: "right", padding: "3px 8px" }}>Cant.</th><th style={{ textAlign: "right", padding: "3px 8px" }}>P. Unit.</th><th style={{ textAlign: "right", padding: "3px 8px" }}>Subtotal</th></tr></thead>
                              <tbody>
                                {v.items.map((it, j) => (
                                  <tr key={j}>
                                    <td style={{ padding: "4px 8px" }}>{it.nombre}</td>
                                    <td className="inv-mono" style={{ padding: "4px 8px", textAlign: "right" }}>{it.cantidad}</td>
                                    <td className="inv-mono" style={{ padding: "4px 8px", textAlign: "right", color: "var(--ink3)" }}>${it.precio_unitario.toFixed(2)}</td>
                                    <td className="inv-mono" style={{ padding: "4px 8px", textAlign: "right", color: "var(--success)", fontWeight: 600 }}>${it.subtotal.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
