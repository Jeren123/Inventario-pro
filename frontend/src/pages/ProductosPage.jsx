import { useProducts }      from "../hooks/useProducts";
import { Icons }             from "../components/shared/Icons";
import { Alert }             from "../components/shared/Alert";
import { ConfirmModal }      from "../components/shared/ConfirmModal";
import { EditProductModal }  from "../components/inventory/EditProductModal";

export function ProductosPage({ token, isAdmin }) {
  const {
    products, filtered, loading, alert, search, setSearch,
    showForm, setShowForm, editItem, setEditItem, confirm, setConfirm,
    form, setField, emptyForm, setForm,
    handleCreate, handleUpdate, handleDelete,
  } = useProducts(token);

  const stats = [
    { lbl: "Total productos",  val: products.length,                              sub: `${products.filter((p) => p.activo).length} activos`, color: "var(--dark)" },
    { lbl: "Stock bajo",       val: products.filter((p) => p.stock_actual <= p.stock_minimo).length, sub: "Requieren reabastecimiento", color: "var(--danger)" },
    { lbl: "Valor inventario", val: `$${products.reduce((s, p) => s + parseFloat(p.precio_venta) * p.stock_actual, 0).toLocaleString("es", { maximumFractionDigits: 0 })}`, sub: "Precio venta total", color: "var(--success)" },
    { lbl: "Activos",          val: products.filter((p) => p.activo).length,       sub: `de ${products.length} total`, color: "var(--primary)" },
  ];

  return (
    <>
      {confirm && (
        <ConfirmModal
          title="Desactivar producto"
          message={`¿Desactivar "${confirm.nombre}"? El historial se conservará.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
          confirmLabel="Desactivar"
        />
      )}

      <div className="inv-fade">
        <div className="inv-ph"><h2>Productos</h2><p>Gestiona el catálogo de tu inventario</p></div>

        <div className="inv-stats">
          {stats.map((s, i) => (
            <div key={s.lbl} className={`inv-stat inv-fade-${i}`}>
              <div className="inv-stat-accent" style={{ background: s.color }} />
              <div className="inv-stat-lbl">{s.lbl}</div>
              <div className="inv-stat-val">{s.val}</div>
              <div className="inv-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <Alert msg={alert.msg} type={alert.type} />

        <div className="inv-card">
          <div className="inv-card-head">
            <div className="inv-card-title"><Icons.Box /> Catálogo</div>
            <div className="inv-card-head-actions">
              <div className="inv-search-wrap">
                <span className="inv-search-ico"><Icons.Search /></span>
                <input className="inv-input inv-search" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {isAdmin && (
                <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={() => setShowForm(!showForm)}>
                  <Icons.Plus /> Nuevo
                </button>
              )}
            </div>
          </div>

          {showForm && isAdmin && (
            <>
              <div style={{ padding: "14px 18px 0" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink3)" }}>Nuevo producto</span>
              </div>
              <form onSubmit={handleCreate}>
                <div className="inv-form-grid">
                  <div className="inv-fg"><label className="inv-label">Nombre</label><input className="inv-input" value={form.nombre} onChange={setField("nombre")} required placeholder="Nombre del producto" /></div>
                  <div className="inv-fg"><label className="inv-label">Descripción</label><input className="inv-input" value={form.descripcion} onChange={setField("descripcion")} placeholder="Opcional" /></div>
                  <div className="inv-fg"><label className="inv-label">Precio compra</label><input className="inv-input" type="number" step="0.01" min="0" value={form.precio_compra} onChange={setField("precio_compra")} required placeholder="0.00" /></div>
                  <div className="inv-fg"><label className="inv-label">Precio venta</label><input className="inv-input" type="number" step="0.01" min="0" value={form.precio_venta} onChange={setField("precio_venta")} required placeholder="0.00" /></div>
                  <div className="inv-fg"><label className="inv-label">Stock inicial</label><input className="inv-input" type="number" min="0" value={form.stock_actual} onChange={setField("stock_actual")} required placeholder="0" /></div>
                  <div className="inv-fg"><label className="inv-label">Stock mínimo</label><input className="inv-input" type="number" min="0" value={form.stock_minimo} onChange={setField("stock_minimo")} required placeholder="5" /></div>
                  <div className="inv-col2" style={{ display: "flex", gap: 8 }}>
                    <button className="inv-btn inv-btn-green" type="submit"><Icons.Check /> Guardar</button>
                    <button className="inv-btn inv-btn-ghost" type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}>Cancelar</button>
                  </div>
                </div>
              </form>
              <div className="inv-divider" />
            </>
          )}

          <div className="inv-table-wrap">
            {loading ? (
              <div className="inv-loading"><span className="inv-spin" /> Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="inv-empty"><div className="inv-empty-ico">📦</div><p>{search ? "Sin resultados" : "No hay productos"}</p></div>
            ) : (
              <table className="inv-table">
                <thead>
                  <tr><th>#</th><th>Producto</th><th>P. Compra</th><th>P. Venta</th><th>Stock</th><th>Mín.</th><th>Estado</th>{isAdmin && <th>Acciones</th>}</tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id_producto}>
                      <td data-label="#" className="inv-mono" style={{ fontSize: "0.72rem", color: "var(--ink4)" }}>{p.id_producto}</td>
                      <td data-label="Producto">
                        <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                        {p.descripcion && <div style={{ fontSize: "0.72rem", color: "var(--ink4)", marginTop: 1 }}>{p.descripcion}</div>}
                      </td>
                      <td data-label="P.Compra" className="inv-mono" style={{ color: "var(--ink3)" }}>${parseFloat(p.precio_compra).toFixed(2)}</td>
                      <td data-label="P.Venta"  className="inv-mono" style={{ color: "var(--success)", fontWeight: 600 }}>${parseFloat(p.precio_venta).toFixed(2)}</td>
                      <td data-label="Stock">
                        {p.stock_actual <= p.stock_minimo
                          ? <span className="inv-badge inv-badge-red">⚠ {p.stock_actual}</span>
                          : <span className="inv-mono" style={{ fontWeight: 600 }}>{p.stock_actual}</span>
                        }
                      </td>
                      <td data-label="Mín." className="inv-mono inv-muted">{p.stock_minimo}</td>
                      <td data-label="Estado"><span className={`inv-badge ${p.activo ? "inv-badge-green" : "inv-badge-gray"}`}>{p.activo ? "Activo" : "Inactivo"}</span></td>
                      {isAdmin && (
                        <td data-label="Acciones">
                          <div style={{ display: "flex", gap: 5 }}>
                            <button className="inv-btn-ico inv-btn-ico-edit" onClick={() => setEditItem(p)}><Icons.Edit /></button>
                            <button className="inv-btn-ico" onClick={() => setConfirm({ id: p.id_producto, nombre: p.nombre })}><Icons.Trash /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {editItem && (
        <EditProductModal
          producto={editItem}
          token={token}
          onClose={() => setEditItem(null)}
          onSaved={handleUpdate}
        />
      )}
    </>
  );
}
