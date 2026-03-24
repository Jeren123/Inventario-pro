import { useSales }  from "../hooks/useSales";
import { Icons }      from "../components/shared/Icons";
import { Alert }      from "../components/shared/Alert";

export function VentasPage({ token, userId }) {
  const { productos, items, alert, loading, total, addItem, removeItem, setQuantity, handleVenta } = useSales(token, userId);

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Nueva Venta</h2><p>Registra una venta y actualiza el inventario automáticamente</p></div>

      <div className="inv-grid-main-aside">
        <div className="inv-card">
          <div className="inv-card-head">
            <div className="inv-card-title"><Icons.Cart /> Seleccionar productos</div>
            <span style={{ fontSize: "0.72rem", color: "var(--ink4)", fontWeight: 500 }}>{items.length} ítem{items.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <div className="inv-fg">
              <label className="inv-label">Agregar producto</label>
              <select className="inv-select" onChange={(e) => { addItem(e.target.value); e.target.value = ""; }} defaultValue="">
                <option value="" disabled>Selecciona un producto...</option>
                {productos.filter((p) => p.activo).map((p) => (
                  <option key={p.id_producto} value={p.id_producto}>
                    {p.nombre} — ${parseFloat(p.precio_venta).toFixed(2)} (stock: {p.stock_actual})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {items.length === 0 ? (
            <div className="inv-empty"><div className="inv-empty-ico">🛒</div><p>Selecciona productos para agregar</p></div>
          ) : (
            <div className="inv-items">
              {items.map((i) => (
                <div key={i.id_producto} className="inv-item">
                  <div className="inv-item-name">{i.nombre}</div>
                  <div className="inv-item-price">${parseFloat(i.precio_venta).toFixed(2)} c/u</div>
                  <input className="inv-input" type="number" min="1" value={i.cantidad} onChange={(e) => setQuantity(i.id_producto, e.target.value)} style={{ width: 64 }} />
                  <span className="inv-mono" style={{ fontSize: "0.8rem", color: "var(--success)", fontWeight: 600, minWidth: 70, textAlign: "right" }}>${(parseFloat(i.precio_venta) * i.cantidad).toFixed(2)}</span>
                  <button className="inv-btn-ico" onClick={() => removeItem(i.id_producto)}><Icons.Trash /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="inv-aside-sticky">
          <Alert msg={alert.msg} type={alert.type} />
          <div className="inv-card">
            <div className="inv-card-head"><div className="inv-card-title"><Icons.Star /> Resumen</div></div>
            <div style={{ padding: 16 }}>
              {items.length === 0 ? (
                <p style={{ color: "var(--ink4)", fontSize: "0.8rem", textAlign: "center", padding: "12px 0" }}>Sin productos</p>
              ) : (
                <>
                  {items.map((i) => (
                    <div key={i.id_producto} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.8rem" }}>
                      <span style={{ color: "var(--ink3)" }}>{i.nombre} ×{i.cantidad}</span>
                      <span className="inv-mono" style={{ fontWeight: 600 }}>${(parseFloat(i.precio_venta) * i.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
                </>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink4)" }}>Total</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "2rem", fontWeight: 700, color: "var(--success)", letterSpacing: "-0.02em" }}>${total.toFixed(2)}</span>
              </div>
              <button className="inv-btn inv-btn-green" onClick={handleVenta} disabled={loading || !items.length} style={{ width: "100%", padding: "11px" }}>
                {loading ? <span className="inv-spin" /> : <><Icons.Check /> Confirmar venta</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
