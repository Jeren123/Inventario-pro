import { useIA }   from "../hooks/useIA";
import { Icons }   from "../components/shared/Icons";

export function AsistenteIAPage({ token }) {
  const { messages, input, setInput, loading, endRef, sendMessage, sugerencias, productos } = useIA(token);

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Asistente IA</h2><p>Consulta y analiza tu inventario con inteligencia artificial</p></div>

      <div className="inv-grid-main-panel">
        <div className="inv-card inv-chat-wrap">
          <div className="inv-card-head">
            <div className="inv-card-title"><Icons.Robot /> Asistente</div>
            <span style={{ fontSize: "0.68rem", color: "var(--success)", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block", boxShadow: "0 0 0 2px var(--success-bg)" }} />
              En línea
            </span>
          </div>

          <div className="inv-chat-msgs">
            {messages.map((m, i) => (
              <div key={i} className={`inv-chat-msg ${m.role === "user" ? "user" : ""}`}>
                <div className={`inv-chat-av ${m.role === "assistant" ? "ai" : "user"}`}>{m.role === "assistant" ? "✦" : "👤"}</div>
                <div className={`inv-chat-bubble ${m.role === "assistant" ? "ai" : "user"}`}>
                  {m.content.split("\n").map((l, j) => <span key={j}>{l}{j < m.content.split("\n").length - 1 && <br />}</span>)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="inv-chat-msg">
                <div className="inv-chat-av ai">✦</div>
                <div className="inv-chat-bubble ai"><div className="inv-typing"><span /><span /><span /></div></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && (
            <div className="inv-sugg-bar">
              {sugerencias.map((s, i) => <button key={i} className="inv-sugg" onClick={() => sendMessage(s)}>{s}</button>)}
            </div>
          )}

          <div className="inv-chat-input-area">
            <textarea
              className="inv-chat-input"
              placeholder="Escribe tu pregunta... (Enter para enviar)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              rows={1}
            />
            <button className="inv-chat-send" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              {loading ? <span className="inv-spin" style={{ width: 14, height: 14, borderTopColor: "#fff" }} /> : <Icons.Send />}
            </button>
          </div>
        </div>

        <div className="inv-card" style={{ alignSelf: "start" }}>
          <div className="inv-card-head"><div className="inv-card-title" style={{ fontSize: "0.7rem" }}>Resumen rápido</div></div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { lbl: "Productos", val: productos.length, color: "var(--ink)" },
              { lbl: "Stock bajo", val: productos.filter((p) => p.stock_actual <= p.stock_minimo).length, color: "var(--danger)" },
              { lbl: "Valor total", val: `$${productos.reduce((s, p) => s + parseFloat(p.precio_venta) * p.stock_actual, 0).toLocaleString("es", { maximumFractionDigits: 0 })}`, color: "var(--success)" },
            ].map(({ lbl, val, color }) => (
              <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--ink4)" }}>{lbl}</span>
                <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color, fontSize: "0.88rem" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
