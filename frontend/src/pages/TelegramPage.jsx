import { useTelegram } from "../hooks/useTelegram";
import { Icons }       from "../components/shared/Icons";

export function TelegramPage({ token }) {
  const {
    loadingTest, loadingStock, loadingResumen, loadingMsg,
    mensaje, setMensaje, estado, logs, setLogs,
    handleTest, handleAlertaStock, handleResumenHoy, handleMensaje,
  } = useTelegram(token);

  const actions = [
    { label: "Probar conexión",   desc: "Envía un mensaje de prueba para verificar que el bot responde", icon: "🔌", fn: handleTest,        loading: loadingTest,    style: "inv-btn-primary" },
    { label: "Alertas de stock",  desc: "Revisa todos los productos y notifica los que están bajo el mínimo", icon: "⚠️", fn: handleAlertaStock, loading: loadingStock,   style: "inv-btn-amber" },
    { label: "Resumen del día",   desc: "Envía un reporte completo de ventas e inventario de hoy", icon: "📊", fn: handleResumenHoy,   loading: loadingResumen, style: "inv-btn-ghost" },
  ];

  const comandos = [
    { cmd: "/stock",                   desc: "Ver stock de todos los productos" },
    { cmd: "/ventas",                  desc: "Resumen de ventas del día" },
    { cmd: "/entrada 3 50 Reposición", desc: "Registrar entrada de stock" },
    { cmd: "/salida 3 10 Ajuste",      desc: "Registrar salida de stock" },
    { cmd: "/buscar camisa",           desc: "Buscar producto por nombre" },
    { cmd: "/ayuda",                   desc: "Ver todos los comandos" },
  ];

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Telegram Bot</h2><p>Controla y monitorea tu inventario desde Telegram</p></div>

      <div className="inv-card" style={{ marginBottom: 18, borderLeft: `3px solid ${estado === "ok" ? "var(--success)" : estado === "err" ? "var(--danger)" : "var(--border2)"}` }}>
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: "1.5rem" }}>✈️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 2 }}>Bot de Telegram activo</div>
            <div style={{ fontSize: "0.76rem", color: "var(--ink3)" }}>Recibe alertas automáticas con cada venta y cuando el stock baje del mínimo</div>
          </div>
          {estado && <span className={`inv-badge ${estado === "ok" ? "inv-badge-green" : "inv-badge-red"}`}>{estado === "ok" ? "✓ Conectado" : "✗ Error"}</span>}
        </div>
      </div>

      <div className="inv-grid-2">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {actions.map((a, i) => (
            <div key={i} className="inv-card">
              <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "1.3rem" }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.84rem", marginBottom: 2 }}>{a.label}</div>
                  <div style={{ fontSize: "0.74rem", color: "var(--ink3)" }}>{a.desc}</div>
                </div>
                <button className={`inv-btn ${a.style} inv-btn-sm`} onClick={a.fn} disabled={a.loading} style={{ flexShrink: 0 }}>
                  {a.loading ? <span className="inv-spin" /> : <Icons.Send />}
                  {a.loading ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          ))}

          <div className="inv-card">
            <div className="inv-card-head"><div className="inv-card-title">📢 Mensaje personalizado</div></div>
            <form onSubmit={handleMensaje}>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                <textarea className="inv-input" style={{ resize: "vertical", minHeight: 80 }} placeholder="Escribe tu mensaje..." value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
                <button className="inv-btn inv-btn-primary inv-btn-sm" type="submit" disabled={loadingMsg || !mensaje.trim()} style={{ alignSelf: "flex-start" }}>
                  {loadingMsg ? <span className="inv-spin" /> : <><Icons.Send /> Enviar a Telegram</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="inv-card">
            <div className="inv-card-head">
              <div className="inv-card-title"><Icons.List /> Actividad reciente</div>
              {logs.length > 0 && <button className="inv-btn inv-btn-ghost inv-btn-sm" onClick={() => setLogs([])}>Limpiar</button>}
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7, minHeight: 160 }}>
              {logs.length === 0 ? (
                <div className="inv-empty" style={{ padding: "20px 0" }}><div className="inv-empty-ico">📭</div><p>Usa los botones para enviar mensajes</p></div>
              ) : logs.map((l, i) => (
                <div key={i} className={`inv-log-item ${l.tipo === "ok" ? "inv-log-ok" : "inv-log-err"}`}>
                  <span>{l.texto}</span>
                  <span style={{ fontSize: "0.66rem", opacity: 0.7, flexShrink: 0 }}>{l.hora}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="inv-card">
            <div className="inv-card-head"><div className="inv-card-title">📟 Comandos disponibles</div></div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {comandos.map((c, i) => (
                <div key={i}>
                  <code style={{ fontSize: "0.72rem", background: "var(--success-bg)", color: "var(--success)", padding: "2px 7px", borderRadius: 4, fontFamily: "var(--mono)" }}>{c.cmd}</code>
                  <div style={{ fontSize: "0.72rem", color: "var(--ink3)", marginTop: 2 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
