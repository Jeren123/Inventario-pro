import { useState, useEffect } from "react";
import { reportesService } from "../services/reportesService";
import { Icons }           from "../components/shared/Icons";
import { Alert }           from "../components/shared/Alert";

const URGENCIA_MAP = {
  critica: { badge: "inv-badge-red",   label: "Crítico" },
  alta:    { badge: "inv-badge-amber", label: "Alta"    },
  media:   { badge: "inv-badge-blue",  label: "Media"   },
  ok:      { badge: "inv-badge-green", label: "OK"      },
};

export function PrediccionPage({ token }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    reportesService.getPrediccion(token)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="inv-loading"><span className="inv-spin" /> Analizando datos...</div>;
  if (error)   return <Alert msg={error} type="err" />;
  if (!data)   return null;

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Predicción de Demanda</h2><p>Análisis inteligente para los próximos 30 días</p></div>

      <div className="inv-stats inv-stats-3" style={{ marginBottom: 20 }}>
        {[
          { lbl: "Productos críticos", val: data.resumen.criticos,                                                              sub: "Menos de 7 días de stock",  color: "var(--danger)" },
          { lbl: "Alta prioridad",     val: data.resumen.alta_prioridad,                                                        sub: "Menos de 15 días",          color: "var(--warning-dark)" },
          { lbl: "Inversión urgente",  val: `$${data.resumen.costo_urgente.toLocaleString("es", { maximumFractionDigits: 0 })}`, sub: "Reposición inmediata",      color: "var(--success)" },
        ].map((s) => (
          <div key={s.lbl} className="inv-stat">
            <div className="inv-stat-accent" style={{ background: s.color }} />
            <div className="inv-stat-lbl">{s.lbl}</div>
            <div className="inv-stat-val">{s.val}</div>
            <div className="inv-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="inv-card">
        <div className="inv-card-head"><div className="inv-card-title"><Icons.Brain /> Predicciones por producto</div></div>
        <div className="inv-table-wrap">
          {data.predicciones.length === 0 ? (
            <div className="inv-empty"><div className="inv-empty-ico">📈</div><p>Insuficientes datos de ventas</p></div>
          ) : (
            <table className="inv-table">
              <thead>
                <tr><th>Producto</th><th>Stock</th><th>Vendido/30d</th><th>Días restantes</th><th>Tendencia</th><th>Comprar</th><th>Costo</th><th>Urgencia</th></tr>
              </thead>
              <tbody>
                {data.predicciones.map((p, i) => {
                  const cfg = URGENCIA_MAP[p.urgencia] ?? URGENCIA_MAP.ok;
                  return (
                    <tr key={i}>
                      <td data-label="Producto" style={{ fontWeight: 600, fontSize: "0.82rem" }}>{p.nombre}</td>
                      <td data-label="Stock" className="inv-mono">{p.stock_actual}</td>
                      <td data-label="Vendido/30d" className="inv-mono">{p.vendido_30d}</td>
                      <td data-label="Días" className="inv-mono" style={{ fontWeight: 700, color: p.urgencia === "critica" ? "var(--danger)" : p.urgencia === "alta" ? "var(--warning)" : "var(--ink)" }}>
                        {p.dias_stock_restante >= 999 ? "∞" : `${p.dias_stock_restante}d`}
                      </td>
                      <td data-label="Tendencia" className="inv-mono" style={{ color: p.tendencia_pct >= 0 ? "var(--success)" : "var(--danger)" }}>
                        {p.tendencia_pct >= 0 ? "↑" : "↓"} {Math.abs(p.tendencia_pct)}%
                      </td>
                      <td data-label="Comprar" className="inv-mono" style={{ fontWeight: 700, color: p.cantidad_recomendada > 0 ? "var(--warning)" : "var(--ink4)" }}>
                        {p.cantidad_recomendada > 0 ? `+${p.cantidad_recomendada}` : "—"}
                      </td>
                      <td data-label="Costo" className="inv-mono" style={{ color: "var(--success)" }}>${p.costo_reposicion.toFixed(2)}</td>
                      <td data-label="Urgencia"><span className={`inv-badge ${cfg.badge}`}>{cfg.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
