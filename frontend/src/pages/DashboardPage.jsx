import { useState, useEffect } from "react";
import { reportesService } from "../services/reportesService";
import { Icons }           from "../components/shared/Icons";
import { Alert }           from "../components/shared/Alert";

export function DashboardPage({ token }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    reportesService.getDashboard(token)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="inv-loading"><span className="inv-spin" /> Cargando dashboard...</div>;
  if (error)   return <Alert msg={error} type="err" />;
  if (!data)   return null;

  const { resumen, ventas_por_dia, top_productos, stock_bajo_lista, distribucion_stock } = data;
  const maxVenta = Math.max(...ventas_por_dia.map((d) => d.total), 1);
  const maxTop   = Math.max(...top_productos.map((d) => d.total_vendido), 1);
  const maxStock = Math.max(...distribucion_stock.map((d) => d.stock), 1);

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Dashboard</h2><p>Resumen general del negocio</p></div>

      <div className="inv-stats">
        {[
          { lbl: "Ventas este mes",   val: resumen.ventas_mes_cantidad,   sub: `$${resumen.ventas_mes_total.toLocaleString("es", { maximumFractionDigits: 0 })} en ingresos`,     color: "var(--dark)" },
          { lbl: "Esta semana",       val: resumen.ventas_semana_cantidad, sub: `$${resumen.ventas_semana_total.toLocaleString("es", { maximumFractionDigits: 0 })} en ingresos`,  color: "var(--primary)" },
          { lbl: "Valor inventario",  val: `$${resumen.valor_inventario.toLocaleString("es", { maximumFractionDigits: 0 })}`, sub: `${resumen.productos_activos} productos activos`, color: "var(--success)" },
          { lbl: "Alertas stock",     val: resumen.stock_bajo,             sub: "Productos a reabastecer",                                                                         color: "var(--danger)" },
        ].map((s, i) => (
          <div key={s.lbl} className={`inv-stat inv-fade-${i}`}>
            <div className="inv-stat-accent" style={{ background: s.color }} />
            <div className="inv-stat-lbl">{s.lbl}</div>
            <div className="inv-stat-val">{s.val}</div>
            <div className="inv-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="inv-grid-2" style={{ marginBottom: 18 }}>
        <div className="inv-card">
          <div className="inv-card-head"><div className="inv-card-title"><Icons.Chart /> Ventas últimos 14 días</div></div>
          <div style={{ padding: "16px 18px" }}>
            {ventas_por_dia.length === 0 ? (
              <div className="inv-empty"><div className="inv-empty-ico">📊</div><p>Sin datos</p></div>
            ) : (
              <div className="inv-bar-chart">
                {ventas_por_dia.map((d, i) => (
                  <div key={i} className="inv-bar-wrap" title={`${d.dia}: $${d.total.toFixed(2)}`}>
                    <div style={{ fontSize: "0.58rem", color: "var(--ink3)", fontFamily: "var(--mono)" }}>{d.total > 999 ? (d.total / 1000).toFixed(1) + "k" : d.total.toFixed(0)}</div>
                    <div className="inv-bar" style={{ height: `${Math.max(4, (d.total / maxVenta) * 100)}%` }} />
                    <div style={{ fontSize: "0.55rem", color: "var(--ink4)", transform: "rotate(-40deg)", whiteSpace: "nowrap" }}>{d.dia.slice(5)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="inv-card">
          <div className="inv-card-head"><div className="inv-card-title"><Icons.Star /> Top productos vendidos</div></div>
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
            {top_productos.length === 0 ? (
              <div className="inv-empty"><div className="inv-empty-ico">🏆</div><p>Sin datos</p></div>
            ) : top_productos.map((p, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{p.nombre}</span>
                  <span className="inv-mono" style={{ fontSize: "0.74rem", color: "var(--success)", fontWeight: 600 }}>{p.total_vendido} uds</span>
                </div>
                <div className="inv-progress">
                  <div className="inv-progress-fill" style={{ width: `${(p.total_vendido / maxTop) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="inv-grid-2">
        <div className="inv-card">
          <div className="inv-card-head"><div className="inv-card-title"><Icons.Box /> Distribución de stock</div></div>
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {distribucion_stock.map((p, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.78rem" }}>{p.nombre}</span>
                  <span className="inv-mono" style={{ fontSize: "0.74rem", color: "var(--ink2)", fontWeight: 600 }}>{p.stock}</span>
                </div>
                <div className="inv-progress">
                  <div className="inv-progress-fill" style={{ width: `${(p.stock / maxStock) * 100}%`, background: "var(--success)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="inv-card">
          <div className="inv-card-head">
            <div className="inv-card-title"><Icons.Warn /> Alertas de stock</div>
            <span className="inv-badge inv-badge-red">{stock_bajo_lista.length}</span>
          </div>
          <div className="inv-table-wrap">
            {stock_bajo_lista.length === 0 ? (
              <div className="inv-empty"><div className="inv-empty-ico">✅</div><p>Todo en orden</p></div>
            ) : (
              <table className="inv-table">
                <thead><tr><th>Producto</th><th>Stock</th><th>Mín.</th></tr></thead>
                <tbody>
                  {stock_bajo_lista.map((p, i) => (
                    <tr key={i}>
                      <td data-label="Producto" style={{ fontWeight: 600, fontSize: "0.8rem" }}>{p.nombre}</td>
                      <td data-label="Stock"><span className="inv-badge inv-badge-red">{p.stock_actual}</span></td>
                      <td data-label="Mín." className="inv-mono inv-muted">{p.stock_minimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
