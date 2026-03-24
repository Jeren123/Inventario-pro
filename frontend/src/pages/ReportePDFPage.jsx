import { useState, useEffect } from "react";
import { reportesService } from "../services/reportesService";
import { Icons }           from "../components/shared/Icons";
import { Alert }           from "../components/shared/Alert";

export function ReportePDFPage({ token }) {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error,     setError]     = useState("");

  useEffect(() => {
    reportesService.getPdfData(token)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const generarPDF = () => {
    if (!data) return;
    setGenerando(true);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reporte</title><style>
      body{font-family:Arial,sans-serif;color:#1a1916;margin:0}
      .h{background:#1e293b;color:#f8fafc;padding:32px 40px}
      .h h1{margin:0 0 4px;font-size:24px}.h p{margin:0;opacity:.6;font-size:12px}
      .c{padding:32px 40px}
      .sg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
      .s{background:#f1f5f9;border-radius:8px;padding:16px;text-align:center;border:1px solid #e2e8f0}
      .sv{font-size:24px;font-weight:700;color:#059669}.sl{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.1em;margin-top:4px}
      h2{font-size:13px;font-weight:700;margin:24px 0 10px;text-transform:uppercase;letter-spacing:.08em;color:#334155}
      table{width:100%;border-collapse:collapse;font-size:11px}
      th{background:#f1f5f9;padding:7px 10px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#64748b;border-bottom:1px solid #e2e8f0}
      td{padding:8px 10px;border-bottom:1px solid #f1f5f9}
      .ok{background:#ecfdf5;color:#047857;padding:2px 7px;border-radius:3px;font-size:9px;font-weight:700}
      .wa{background:#fef2f2;color:#b91c1c;padding:2px 7px;border-radius:3px;font-size:9px;font-weight:700}
      .ft{margin-top:36px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;text-align:center}
    </style></head><body>
    <div class="h"><h1>Inventario Profesional — Reporte General</h1><p>Período: ${data.periodo} | Generado: ${data.fecha_generacion}</p></div>
    <div class="c">
      <div class="sg">
        <div class="s"><div class="sv">${data.resumen.total_productos}</div><div class="sl">Productos</div></div>
        <div class="s"><div class="sv">$${data.resumen.valor_inventario.toLocaleString("es", { maximumFractionDigits: 0 })}</div><div class="sl">Valor inventario</div></div>
        <div class="s"><div class="sv">${data.resumen.total_ventas_mes}</div><div class="sl">Ventas del mes</div></div>
        <div class="s"><div class="sv">$${data.resumen.ingreso_mes.toLocaleString("es", { maximumFractionDigits: 0 })}</div><div class="sl">Ingreso del mes</div></div>
      </div>
      <h2>Top productos vendidos</h2>
      <table><thead><tr><th>#</th><th>Producto</th><th>Unidades</th><th>Ingreso</th></tr></thead><tbody>
        ${data.top_productos.map((p, i) => `<tr><td>${i + 1}</td><td><strong>${p.nombre}</strong></td><td>${p.total_vendido}</td><td>$${p.ingreso.toFixed(2)}</td></tr>`).join("")}
      </tbody></table>
      <h2>Estado del inventario</h2>
      <table><thead><tr><th>Producto</th><th>Stock</th><th>Mín.</th><th>P. Venta</th><th>Valor</th><th>Estado</th></tr></thead><tbody>
        ${data.productos.map((p) => `<tr><td><strong>${p.nombre}</strong></td><td>${p.stock_actual}</td><td>${p.stock_minimo}</td><td>$${p.precio_venta.toFixed(2)}</td><td>$${p.valor_stock.toFixed(2)}</td><td><span class="${p.stock_actual <= p.stock_minimo ? "wa" : "ok"}">${p.estado}</span></td></tr>`).join("")}
      </tbody></table>
      <div class="ft">Inventario Profesional | ${data.fecha_generacion}</div>
    </div></body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); setGenerando(false); }, 800);
  };

  if (loading) return <div className="inv-loading"><span className="inv-spin" /> Preparando reporte...</div>;
  if (error)   return <Alert msg={error} type="err" />;
  if (!data)   return null;

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Reporte PDF</h2><p>Genera un reporte completo del inventario</p></div>

      <div className="inv-grid-2">
        <div className="inv-card">
          <div className="inv-card-head"><div className="inv-card-title"><Icons.Pdf /> Generar reporte</div></div>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 16 }}>
              <div style={{ width: 64, height: 64, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>📄</div>
              <p style={{ color: "var(--ink3)", fontSize: "0.82rem", textAlign: "center", lineHeight: 1.6, maxWidth: 320 }}>
                Genera un PDF con el resumen del inventario, top productos y estado de stock del período actual.
              </p>
              <div className="inv-stats-3" style={{ width: "100%", marginBottom: 0 }}>
                {[{ lbl: "Productos", val: data.resumen.total_productos }, { lbl: "Ventas", val: data.resumen.total_ventas_mes }, { lbl: "Stock bajo", val: data.resumen.productos_stock_bajo }].map((s) => (
                  <div key={s.lbl} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "1.5rem", fontWeight: 700 }}>{s.val}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
              <button className="inv-btn inv-btn-primary" onClick={generarPDF} disabled={generando} style={{ padding: "10px 28px" }}>
                {generando ? <><span className="inv-spin" style={{ borderTopColor: "#fff" }} /> Generando...</> : <><Icons.Pdf /> Generar y descargar</>}
              </button>
              <p style={{ fontSize: "0.7rem", color: "var(--ink4)" }}>Se abrirá el diálogo de impresión para guardar como PDF</p>
            </div>
          </div>
        </div>

        <div className="inv-card">
          <div className="inv-card-head"><div className="inv-card-title"><Icons.Star /> Top productos</div></div>
          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead><tr><th>#</th><th>Producto</th><th>Vendido</th><th>Ingreso</th></tr></thead>
              <tbody>
                {data.top_productos.map((p, i) => (
                  <tr key={i}>
                    <td data-label="#" className="inv-mono" style={{ color: "var(--ink4)", fontSize: "0.72rem" }}>{i + 1}</td>
                    <td data-label="Producto" style={{ fontWeight: 600 }}>{p.nombre}</td>
                    <td data-label="Vendido" className="inv-mono">{p.total_vendido}</td>
                    <td data-label="Ingreso" className="inv-mono" style={{ color: "var(--success)", fontWeight: 600 }}>${p.ingreso.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
