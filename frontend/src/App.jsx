import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "./utils/api";
import { injectStyles } from "./utils/styles";
import { Icons } from "./components/Icons";
import { Alert } from "./components/Alert";
import { ConfirmModal } from "./components/ConfirmModal";

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleLogin = async e => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const d = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password }) });
      onLogin(d.access_token);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  const features = [
    { icon: <Icons.Chart />, text: "Dashboard con métricas en tiempo real" },
    { icon: <Icons.Brain />, text: "Predicción de demanda con inteligencia artificial" },
    { icon: <Icons.Send />, text: "Alertas automáticas por Telegram" },
  ];

  return (
    <div className="inv-login">
      <div className="inv-login-left">
        <div className="inv-login-hero">
          <h1>Inventario<br /><em>Profesional</em></h1>
          <p>Sistema de gestión inteligente para tu negocio</p>
          <div className="inv-login-feats">
            {features.map((f, i) => (
              <div key={i} className="inv-login-feat">
                <div className="inv-login-feat-ico">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="inv-login-right">
        <div className="inv-login-form-wrap">
          <h2>Bienvenido</h2>
          <p>Ingresa tus credenciales para acceder al sistema</p>
          <Alert msg={err} type="err" />
          <form className="inv-login-form" onSubmit={handleLogin}>
            <div className="inv-fg">
              <label className="inv-label">Correo electrónico</label>
              <input className="inv-input" type="email" value={form.email} onChange={set("email")} required placeholder="nombre@empresa.com" autoFocus />
            </div>
            <div className="inv-fg">
              <label className="inv-label">Contraseña</label>
              <input className="inv-input" type="password" value={form.password} onChange={set("password")} required placeholder="••••••••" />
            </div>
            <button className="inv-btn inv-btn-primary" type="submit" disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "11px", marginTop: 4 }}>
              {loading ? <span className="inv-spin" /> : "Ingresar →"}
            </button>
          </form>
          <p style={{ marginTop: 20, fontSize: "0.72rem", color: "var(--ink4)", textAlign: "center", lineHeight: 1.6 }}>
            ¿No tienes acceso? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── GESTIÓN DE USUARIOS ───────────────────────────────────────────────────────
function UsuariosTab({ token }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState({ msg: "", type: "ok" });
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ nombre: "", email: "", password: "", id_rol: "2" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const cargar = async () => {
    setLoading(true);
    try { setUsuarios(await apiFetch("/auth/usuarios", {}, token)); }
    catch (e) { setAlert({ msg: e.message, type: "err" }); }
    setLoading(false);
  };
  useEffect(() => { cargar(); }, []);

  const handleCrear = async e => {
    e.preventDefault(); setAlert({ msg: "", type: "ok" });
    try {
      await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ ...form, id_rol: parseInt(form.id_rol) }) }, token);
      setAlert({ msg: `Usuario "${form.nombre}" creado correctamente`, type: "ok" });
      setForm({ nombre: "", email: "", password: "", id_rol: "2" });
      setShowForm(false);
      cargar();
    } catch (e) { setAlert({ msg: e.message, type: "err" }); }
  };

  const handleEliminar = async id => {
    try {
      await apiFetch(`/auth/usuarios/${id}`, { method: "DELETE" }, token);
      setAlert({ msg: "Usuario eliminado", type: "ok" });
      setConfirm(null);
      cargar();
    } catch (e) { setAlert({ msg: e.message, type: "err" }); setConfirm(null); }
  };

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
      <div className="inv-ph"><h2>Gestión de Usuarios</h2><p>Crea y administra los accesos al sistema</p></div>

      <div className="inv-card" style={{ marginBottom: 18, borderLeft: "3px solid var(--green2)" }}>
        <div style={{ padding: "13px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "1.3rem" }}>🔒</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.84rem", marginBottom: 1 }}>Registro público desactivado</div>
            <div style={{ fontSize: "0.74rem", color: "var(--ink3)" }}>Solo el administrador puede crear nuevas cuentas.</div>
          </div>
          <span className="inv-badge inv-badge-green" style={{ marginLeft: "auto", flexShrink: 0 }}>Seguro</span>
        </div>
      </div>

      <Alert msg={alert.msg} type={alert.type} />

      <div className="inv-stats" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 18 }}>
        {[
          { lbl: "Total usuarios", val: usuarios.length, color: "#1a1916" },
          { lbl: "Administradores", val: usuarios.filter(u => u.id_rol === 1).length, color: "#1a3f6b" },
          { lbl: "Vendedores", val: usuarios.filter(u => u.id_rol === 2).length, color: "#1a6b4a" },
        ].map(s => (
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
                <div className="inv-fg"><label className="inv-label">Nombre completo</label><input className="inv-input" value={form.nombre} onChange={set("nombre")} required placeholder="Juan Pérez" /></div>
                <div className="inv-fg"><label className="inv-label">Correo electrónico</label><input className="inv-input" type="email" value={form.email} onChange={set("email")} required placeholder="juan@empresa.com" /></div>
                <div className="inv-fg"><label className="inv-label">Contraseña</label><input className="inv-input" type="password" value={form.password} onChange={set("password")} required placeholder="Mínimo 6 caracteres" /></div>
                <div className="inv-fg">
                  <label className="inv-label">Rol</label>
                  <select className="inv-select" value={form.id_rol} onChange={set("id_rol")}>
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
          {loading ? <div className="inv-loading"><span className="inv-spin" /> Cargando...</div> :
            usuarios.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">👤</div><p>No hay usuarios</p></div> : (
              <table className="inv-table">
                <thead><tr><th>#</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr></thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id_usuario}>
                      <td className="inv-mono" style={{ fontSize: "0.72rem", color: "var(--ink4)" }}>{u.id_usuario}</td>
                      <td style={{ fontWeight: 600 }}>{u.nombre}</td>
                      <td style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>{u.email}</td>
                      <td><span className={`inv-badge ${u.id_rol === 1 ? "inv-badge-blue" : "inv-badge-green"}`}>{u.rol}</span></td>
                      <td>
                        <button className="inv-btn-ico" onClick={() => setConfirm({ id: u.id_usuario, nombre: u.nombre })} title="Eliminar usuario">
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

// ── PRODUCTOS ─────────────────────────────────────────────────────────────────
function ProductosTab({ token, isAdmin }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ msg: "", type: "ok" });
  const [showForm, setShowForm] = useState(false);
  const [editProducto, setEditProducto] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio_compra: "", precio_venta: "", stock_actual: "", stock_minimo: "", activo: true });

  const load = useCallback(async () => {
    setLoading(true);
    try { setProductos(await apiFetch("/productos/", {}, token)); }
    catch (e) { setAlert({ msg: e.message, type: "err" }); }
    setLoading(false);
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleCreate = async e => {
    e.preventDefault();
    try {
      await apiFetch("/productos/", { method: "POST", body: JSON.stringify({ ...form, precio_compra: parseFloat(form.precio_compra), precio_venta: parseFloat(form.precio_venta), stock_actual: parseInt(form.stock_actual), stock_minimo: parseInt(form.stock_minimo) }) }, token);
      setAlert({ msg: "Producto creado correctamente", type: "ok" });
      setShowForm(false);
      setForm({ nombre: "", descripcion: "", precio_compra: "", precio_venta: "", stock_actual: "", stock_minimo: "", activo: true });
      load();
    } catch (e) { setAlert({ msg: e.message, type: "err" }); }
  };

  const handleDelete = async id => {
    try {
      await apiFetch(`/productos/${id}`, { method: "DELETE" }, token);
      setAlert({ msg: "Producto desactivado correctamente", type: "ok" });
      setConfirm(null);
      load();
    } catch (e) { setAlert({ msg: e.message, type: "err" }); setConfirm(null); }
  };

  const filtered = productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));
  const lowStock = productos.filter(p => p.stock_actual <= p.stock_minimo).length;
  const valorTotal = productos.reduce((s, p) => s + parseFloat(p.precio_venta) * p.stock_actual, 0);

  const stats = [
    { lbl: "Total productos", val: productos.length, sub: `${productos.filter(p => p.activo).length} activos`, color: "#1a1916" },
    { lbl: "Stock bajo", val: lowStock, sub: "Requieren reabastecimiento", color: "#c43a25" },
    { lbl: "Valor inventario", val: `$${valorTotal.toLocaleString("es", { maximumFractionDigits: 0 })}`, sub: "Precio venta total", color: "#1a6b4a" },
    { lbl: "Activos", val: productos.filter(p => p.activo).length, sub: `de ${productos.length} total`, color: "#2d6fad" },
  ];

  return (
    <>
      {confirm && (
        <ConfirmModal
          title="Desactivar producto"
          message={`¿Desactivar "${confirm.nombre}"? El producto quedará inactivo pero no se perderá el historial.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
          confirmLabel="Desactivar"
        />
      )}
      <div className="inv-fade">
        <div className="inv-ph"><h2>Productos</h2><p>Gestiona el catálogo de tu inventario</p></div>
        <div className="inv-stats">
          {stats.map((s, i) => (
            <div key={s.lbl} className={`inv-stat inv-fade inv-fade-${i}`}>
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
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div className="inv-search-wrap">
                <span className="inv-search-ico"><Icons.Search /></span>
                <input className="inv-input inv-search" style={{ width: 200 }} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {isAdmin && <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={() => setShowForm(!showForm)}><Icons.Plus /> Nuevo</button>}
            </div>
          </div>
          {showForm && isAdmin && (
            <>
              <div style={{ padding: "14px 18px 0" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink3)" }}>Nuevo producto</span>
              </div>
              <form onSubmit={handleCreate}>
                <div className="inv-form-grid">
                  <div className="inv-fg"><label className="inv-label">Nombre</label><input className="inv-input" value={form.nombre} onChange={set("nombre")} required placeholder="Nombre del producto" /></div>
                  <div className="inv-fg"><label className="inv-label">Descripción</label><input className="inv-input" value={form.descripcion} onChange={set("descripcion")} placeholder="Opcional" /></div>
                  <div className="inv-fg"><label className="inv-label">Precio compra</label><input className="inv-input" type="number" step="0.01" min="0" value={form.precio_compra} onChange={set("precio_compra")} required placeholder="0.00" /></div>
                  <div className="inv-fg"><label className="inv-label">Precio venta</label><input className="inv-input" type="number" step="0.01" min="0" value={form.precio_venta} onChange={set("precio_venta")} required placeholder="0.00" /></div>
                  <div className="inv-fg"><label className="inv-label">Stock inicial</label><input className="inv-input" type="number" min="0" value={form.stock_actual} onChange={set("stock_actual")} required placeholder="0" /></div>
                  <div className="inv-fg"><label className="inv-label">Stock mínimo</label><input className="inv-input" type="number" min="0" value={form.stock_minimo} onChange={set("stock_minimo")} required placeholder="5" /></div>
                  <div className="inv-col2" style={{ display: "flex", gap: 8 }}>
                    <button className="inv-btn inv-btn-green" type="submit"><Icons.Check /> Guardar</button>
                    <button className="inv-btn inv-btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
                  </div>
                </div>
              </form>
              <div className="inv-divider" />
            </>
          )}
          <div className="inv-table-wrap">
            {loading ? <div className="inv-loading"><span className="inv-spin" /> Cargando...</div> :
              filtered.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">📦</div><p>{search ? "Sin resultados" : "No hay productos"}</p></div> : (
                <table className="inv-table">
                  <thead>
                    <tr><th>#</th><th>Producto</th><th>P. Compra</th><th>P. Venta</th><th>Stock</th><th>Mín.</th><th>Estado</th>{isAdmin && <th>Acciones</th>}</tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id_producto}>
                        <td className="inv-mono" style={{ fontSize: "0.72rem", color: "var(--ink4)" }}>{p.id_producto}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.83rem" }}>{p.nombre}</div>
                          {p.descripcion && <div style={{ fontSize: "0.72rem", color: "var(--ink4)", marginTop: 1 }}>{p.descripcion}</div>}
                        </td>
                        <td className="inv-mono" style={{ color: "var(--ink3)" }}>${parseFloat(p.precio_compra).toFixed(2)}</td>
                        <td className="inv-mono" style={{ color: "var(--green)", fontWeight: 600 }}>${parseFloat(p.precio_venta).toFixed(2)}</td>
                        <td>{p.stock_actual <= p.stock_minimo
                          ? <span className="inv-badge inv-badge-red">⚠ {p.stock_actual}</span>
                          : <span className="inv-mono" style={{ fontWeight: 600 }}>{p.stock_actual}</span>}
                        </td>
                        <td className="inv-mono inv-muted">{p.stock_minimo}</td>
                        <td><span className={`inv-badge ${p.activo ? "inv-badge-green" : "inv-badge-gray"}`}>{p.activo ? "Activo" : "Inactivo"}</span></td>
                        {isAdmin && (
                          <td>
                            <div style={{ display: "flex", gap: 5 }}>
                              <button className="inv-btn-ico inv-btn-ico-edit" onClick={() => setEditProducto(p)} title="Editar"><Icons.Edit /></button>
                              <button className="inv-btn-ico" onClick={() => setConfirm({ id: p.id_producto, nombre: p.nombre })} title="Desactivar"><Icons.Trash /></button>
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
      {editProducto && (
        <EditarProductoModal
          producto={editProducto} token={token}
          onClose={() => setEditProducto(null)}
          onSaved={() => { setEditProducto(null); setAlert({ msg: "Producto actualizado", type: "ok" }); load(); }}
        />
      )}
    </>
  );
}

function EditarProductoModal({ producto, token, onClose, onSaved }) {
  const [form, setForm] = useState({ ...producto });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSave = async e => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      await apiFetch(`/productos/${producto.id_producto}`, { method: "PUT", body: JSON.stringify({ ...form, precio_compra: parseFloat(form.precio_compra), precio_venta: parseFloat(form.precio_venta), stock_actual: parseInt(form.stock_actual), stock_minimo: parseInt(form.stock_minimo) }) }, token);
      onSaved();
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div className="inv-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="inv-modal">
        <div className="inv-card-head">
          <div className="inv-card-title"><Icons.Edit /> Editar producto</div>
          <button className="inv-btn-ico" onClick={onClose}><Icons.X /></button>
        </div>
        {err && <div style={{ padding: "14px 18px 0" }}><Alert msg={err} type="err" /></div>}
        <form onSubmit={handleSave}>
          <div className="inv-form-grid">
            <div className="inv-fg"><label className="inv-label">Nombre</label><input className="inv-input" value={form.nombre} onChange={set("nombre")} required /></div>
            <div className="inv-fg"><label className="inv-label">Descripción</label><input className="inv-input" value={form.descripcion || ""} onChange={set("descripcion")} /></div>
            <div className="inv-fg"><label className="inv-label">Precio compra</label><input className="inv-input" type="number" step="0.01" min="0" value={form.precio_compra} onChange={set("precio_compra")} required /></div>
            <div className="inv-fg"><label className="inv-label">Precio venta</label><input className="inv-input" type="number" step="0.01" min="0" value={form.precio_venta} onChange={set("precio_venta")} required /></div>
            <div className="inv-fg"><label className="inv-label">Stock actual</label><input className="inv-input" type="number" min="0" value={form.stock_actual} onChange={set("stock_actual")} required /></div>
            <div className="inv-fg"><label className="inv-label">Stock mínimo</label><input className="inv-input" type="number" min="0" value={form.stock_minimo} onChange={set("stock_minimo")} required /></div>
            <div className="inv-fg" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={form.activo} onChange={set("activo")} id="activo-edit" style={{ width: 16, height: 16, accentColor: "var(--green)" }} />
              <label className="inv-label" htmlFor="activo-edit" style={{ textTransform: "none", letterSpacing: 0 }}>Producto activo</label>
            </div>
            <div className="inv-col2" style={{ display: "flex", gap: 8 }}>
              <button className="inv-btn inv-btn-green" type="submit" disabled={loading}>{loading ? <span className="inv-spin" /> : <><Icons.Check /> Guardar cambios</>}</button>
              <button className="inv-btn inv-btn-ghost" type="button" onClick={onClose}>Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── VENTAS ────────────────────────────────────────────────────────────────────
function VentasTab({ token, userId }) {
  const [productos, setProductos] = useState([]);
  const [items, setItems] = useState([]);
  const [alert, setAlert] = useState({ msg: "", type: "ok" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/productos/", {}, token)
      .then(setProductos)
      .catch(e => setAlert({ msg: e.message, type: "err" }));
  }, [token]);

  const addItem = id => {
    const p = productos.find(x => x.id_producto === parseInt(id));
    if (!p) return;
    setItems(prev => {
      const ex = prev.find(i => i.id_producto === p.id_producto);
      if (ex) return prev.map(i => i.id_producto === p.id_producto ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { id_producto: p.id_producto, nombre: p.nombre, precio_venta: p.precio_venta, cantidad: 1 }];
    });
  };
  const removeItem = id => setItems(p => p.filter(i => i.id_producto !== id));
  const setCant = (id, v) => setItems(p => p.map(i => i.id_producto === id ? { ...i, cantidad: Math.max(1, parseInt(v) || 1) } : i));
  const total = items.reduce((s, i) => s + parseFloat(i.precio_venta) * i.cantidad, 0);

  const handleVenta = async () => {
    if (!items.length) return setAlert({ msg: "Agrega al menos un producto", type: "err" });
    setLoading(true);
    try {
      const d = await apiFetch("/ventas/", { method: "POST", body: JSON.stringify({ id_usuario: userId, detalles: items.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad })) }) }, token);
      setAlert({ msg: `✓ Venta #${d.id_venta} registrada — Total: $${parseFloat(d.total).toFixed(2)}`, type: "ok" });
      setItems([]);
    } catch (e) { setAlert({ msg: e.message, type: "err" }); }
    setLoading(false);
  };

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Nueva Venta</h2><p>Registra una venta y actualiza el inventario automáticamente</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "18px", alignItems: "start" }}>
        <div className="inv-card">
          <div className="inv-card-head">
            <div className="inv-card-title"><Icons.Cart /> Seleccionar productos</div>
            <span style={{ fontSize: "0.72rem", color: "var(--ink4)", fontWeight: 500 }}>{items.length} ítem{items.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <div className="inv-fg">
              <label className="inv-label">Agregar producto</label>
              <select className="inv-select" onChange={e => { addItem(e.target.value); e.target.value = ""; }} defaultValue="">
                <option value="" disabled>Selecciona un producto...</option>
                {productos.filter(p => p.activo).map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre} — ${parseFloat(p.precio_venta).toFixed(2)} (stock: {p.stock_actual})</option>)}
              </select>
            </div>
          </div>
          {items.length === 0 ? (
            <div className="inv-empty"><div className="inv-empty-ico">🛒</div><p>Selecciona productos para agregar</p></div>
          ) : (
            <div className="inv-items">
              {items.map(i => (
                <div key={i.id_producto} className="inv-item">
                  <div className="inv-item-name">{i.nombre}</div>
                  <div className="inv-item-price">${parseFloat(i.precio_venta).toFixed(2)} c/u</div>
                  <input className="inv-input" type="number" min="1" value={i.cantidad} onChange={e => setCant(i.id_producto, e.target.value)} style={{ width: 64 }} />
                  <span className="inv-mono" style={{ fontSize: "0.8rem", color: "var(--green)", fontWeight: 600, minWidth: 70, textAlign: "right" }}>${(parseFloat(i.precio_venta) * i.cantidad).toFixed(2)}</span>
                  <button className="inv-btn-ico" onClick={() => removeItem(i.id_producto)}><Icons.Trash /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "sticky", top: 76 }}>
          <Alert msg={alert.msg} type={alert.type} />
          <div className="inv-card">
            <div className="inv-card-head"><div className="inv-card-title"><Icons.Star /> Resumen</div></div>
            <div style={{ padding: "16px" }}>
              {items.length === 0 ? <p style={{ color: "var(--ink4)", fontSize: "0.8rem", textAlign: "center", padding: "12px 0" }}>Sin productos</p> : (
                <>
                  {items.map(i => (
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
                <span style={{ fontFamily: "var(--serif)", fontSize: "2rem", fontWeight: 600, color: "var(--green)", letterSpacing: "-0.02em" }}>${total.toFixed(2)}</span>
              </div>
              <button className="inv-btn inv-btn-green" onClick={handleVenta} disabled={loading || !items.length} style={{ width: "100%", justifyContent: "center", padding: "11px" }}>
                {loading ? <span className="inv-spin" /> : <><Icons.Check /> Confirmar venta</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MOVIMIENTOS ───────────────────────────────────────────────────────────────
function MovimientosTab({ token, isAdmin }) {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMov, setLoadingMov] = useState(false);
  const [form, setForm] = useState({ id_producto: "", cantidad: "", motivo: "", tipo: "entrada" });
  const [alert, setAlert] = useState({ msg: "", type: "ok" });

  useEffect(() => {
    apiFetch("/productos/", {}, token).then(setProductos).catch(e => setAlert({ msg: e.message, type: "err" }));
    if (isAdmin) {
      setLoadingMov(true);
      apiFetch("/movimientos/", {}, token).then(m => { setMovimientos(m); setLoadingMov(false); }).catch(() => setLoadingMov(false));
    }
  }, [token, isAdmin]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const path = form.tipo === "entrada" ? "/movimientos/entrada" : "/movimientos/salida";
    try {
      await apiFetch(path, { method: "POST", body: JSON.stringify({ id_producto: parseInt(form.id_producto), cantidad: parseInt(form.cantidad), motivo: form.motivo }) }, token);
      setAlert({ msg: `Movimiento de ${form.tipo} registrado`, type: "ok" });
      setForm({ id_producto: "", cantidad: "", motivo: "", tipo: form.tipo });
      if (isAdmin) apiFetch("/movimientos/", {}, token).then(setMovimientos);
    } catch (e) { setAlert({ msg: e.message, type: "err" }); }
  };

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Movimientos</h2><p>Registra entradas y salidas de inventario</p></div>
      <Alert msg={alert.msg} type={alert.type} />
      {isAdmin && (
        <div className="inv-stats" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
          {[
            { lbl: "Total", val: movimientos.length, color: "#1a1916" },
            { lbl: "Entradas", val: movimientos.filter(m => m.tipo === "ENTRADA").length, color: "#1a6b4a" },
            { lbl: "Salidas", val: movimientos.filter(m => m.tipo === "SALIDA").length, color: "#c43a25" },
          ].map(s => (
            <div key={s.lbl} className="inv-stat">
              <div className="inv-stat-accent" style={{ background: s.color }} />
              <div className="inv-stat-lbl">{s.lbl}</div>
              <div className="inv-stat-val">{s.val}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "300px 1fr" : "1fr", gap: 18 }}>
        <div className="inv-card" style={{ alignSelf: "start" }}>
          <div className="inv-card-head"><div className="inv-card-title">{form.tipo === "entrada" ? <Icons.Up /> : <Icons.Down />} Registrar movimiento</div></div>
          <form onSubmit={handleSubmit}>
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              {isAdmin && (
                <div className="inv-fg">
                  <label className="inv-label">Tipo</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {["entrada", "salida"].map(t => (
                      <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tipo: t }))}
                        className={`inv-btn ${form.tipo === t ? "inv-btn-primary" : "inv-btn-ghost"}`}
                        style={{ justifyContent: "center" }}>
                        {t === "entrada" ? <Icons.Up /> : <Icons.Down />}
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="inv-fg"><label className="inv-label">Producto</label>
                <select className="inv-select" value={form.id_producto} onChange={set("id_producto")} required>
                  <option value="">Seleccionar...</option>
                  {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre} (stock: {p.stock_actual})</option>)}
                </select>
              </div>
              <div className="inv-fg"><label className="inv-label">Cantidad</label><input className="inv-input" type="number" min="1" value={form.cantidad} onChange={set("cantidad")} required placeholder="0" /></div>
              <div className="inv-fg"><label className="inv-label">Motivo</label><input className="inv-input" value={form.motivo} onChange={set("motivo")} required placeholder="Ej: Compra a proveedor" /></div>
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
                      {movimientos.map(m => (
                        <tr key={m.id_movimiento}>
                          <td className="inv-mono" style={{ fontSize: "0.72rem", color: "var(--ink4)" }}>{m.id_movimiento}</td>
                          <td style={{ color: "var(--ink3)" }}>Prod. #{m.id_producto}</td>
                          <td><span className={`inv-badge ${m.tipo === "ENTRADA" ? "inv-badge-green" : "inv-badge-red"}`}>{m.tipo}</span></td>
                          <td className="inv-mono" style={{ fontWeight: 600 }}>{m.cantidad}</td>
                          <td style={{ color: "var(--ink3)", fontSize: "0.78rem" }}>{m.motivo}</td>
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

// ── ASISTENTE IA ──────────────────────────────────────────────────────────────
function AsistenteIATab({ token }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "¡Hola! Soy tu asistente de inventario con IA.\n\nPuedo ayudarte a analizar tu inventario, sugerir estrategias, identificar productos con bajo stock y mucho más. ¿En qué te ayudo?"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const endRef = useRef(null);

  useEffect(() => { apiFetch("/productos/", {}, token).then(setProductos).catch(e => console.error(e)); }, [token]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sugerencias = ["¿Qué productos tienen stock bajo?", "¿Cuáles son los más rentables?", "Analiza el valor del inventario", "¿Qué debo reabastecer pronto?"];

  const buildContext = () => {
    if (!productos.length) return "No hay productos.";
    const resumen = productos.map(p => `- ${p.nombre}: stock=${p.stock_actual}, mínimo=${p.stock_minimo}, precio_venta=$${p.precio_venta}`).join("\n");
    const valorTotal = productos.reduce((s, p) => s + parseFloat(p.precio_venta) * p.stock_actual, 0);
    const stockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo);
    return `INVENTARIO (${productos.length} productos, valor: $${valorTotal.toFixed(2)}):\n${resumen}\nSTOCK BAJO: ${stockBajo.map(p => p.nombre).join(", ") || "ninguno"}`;
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const historial = newMessages.slice(1, -1).map(m => ({ role: m.role, content: m.content }));
      const response = await apiFetch("/ia/chat", { method: "POST", body: JSON.stringify({ messages: [...historial, { role: "user", content: msg }], contexto_inventario: buildContext() }) }, token);
      setMessages(prev => [...prev, { role: "assistant", content: response.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Error al conectar con la IA. Verifica la configuración del servidor." }]);
    }
    setLoading(false);
  };

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Asistente IA</h2><p>Consulta y analiza tu inventario con inteligencia artificial</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 18 }}>
        <div className="inv-card inv-chat-wrap">
          <div className="inv-card-head">
            <div className="inv-card-title"><Icons.Robot /> Asistente</div>
            <span style={{ fontSize: "0.68rem", color: "var(--green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green2)", display: "inline-block", boxShadow: "0 0 0 2px var(--green3)" }} />
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
            <textarea className="inv-chat-input" placeholder="Escribe tu pregunta... (Enter para enviar)" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} rows={1} />
            <button className="inv-chat-send" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              {loading ? <span className="inv-spin" style={{ width: 14, height: 14 }} /> : <Icons.Send />}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="inv-card">
            <div className="inv-card-head"><div className="inv-card-title" style={{ fontSize: "0.7rem" }}>Resumen rápido</div></div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { lbl: "Productos", val: productos.length, color: "var(--ink)" },
                { lbl: "Stock bajo", val: productos.filter(p => p.stock_actual <= p.stock_minimo).length, color: "var(--red2)" },
                { lbl: "Valor total", val: `$${productos.reduce((s, p) => s + parseFloat(p.precio_venta) * p.stock_actual, 0).toLocaleString("es", { maximumFractionDigits: 0 })}`, color: "var(--green)" },
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
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardTab({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/reportes/dashboard", {}, token)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="inv-loading"><span className="inv-spin" /> Cargando dashboard...</div>;
  if (error) return <Alert msg={error} type="err" />;
  if (!data) return null;

  const { resumen, ventas_por_dia, top_productos, stock_bajo_lista, distribucion_stock } = data;
  const maxVenta = Math.max(...ventas_por_dia.map(d => d.total), 1);
  const maxTop = Math.max(...top_productos.map(d => d.total_vendido), 1);
  const maxStock = Math.max(...distribucion_stock.map(d => d.stock), 1);

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Dashboard</h2><p>Resumen general del negocio</p></div>
      <div className="inv-stats">
        {[
          { lbl: "Ventas este mes", val: resumen.ventas_mes_cantidad, sub: `$${resumen.ventas_mes_total.toLocaleString("es", { maximumFractionDigits: 0 })} en ingresos`, color: "#1a1916" },
          { lbl: "Esta semana", val: resumen.ventas_semana_cantidad, sub: `$${resumen.ventas_semana_total.toLocaleString("es", { maximumFractionDigits: 0 })} en ingresos`, color: "#2d6fad" },
          { lbl: "Valor inventario", val: `$${resumen.valor_inventario.toLocaleString("es", { maximumFractionDigits: 0 })}`, sub: `${resumen.productos_activos} productos activos`, color: "#1a6b4a" },
          { lbl: "Alertas stock", val: resumen.stock_bajo, sub: "Productos a reabastecer", color: "#c43a25" },
        ].map((s, i) => (
          <div key={s.lbl} className={`inv-stat inv-fade inv-fade-${i}`}>
            <div className="inv-stat-accent" style={{ background: s.color }} />
            <div className="inv-stat-lbl">{s.lbl}</div>
            <div className="inv-stat-val">{s.val}</div>
            <div className="inv-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <div className="inv-card">
          <div className="inv-card-head"><div className="inv-card-title"><Icons.Chart /> Ventas últimos 14 días</div></div>
          <div style={{ padding: "16px 18px" }}>
            {ventas_por_dia.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">📊</div><p>Sin datos</p></div> : (
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
            {top_productos.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">🏆</div><p>Sin datos</p></div> :
              top_productos.map((p, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{p.nombre}</span>
                    <span className="inv-mono" style={{ fontSize: "0.74rem", color: "var(--green)", fontWeight: 600 }}>{p.total_vendido} uds</span>
                  </div>
                  <div className="inv-progress">
                    <div className="inv-progress-fill" style={{ width: `${(p.total_vendido / maxTop) * 100}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
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
                  <div className="inv-progress-fill" style={{ width: `${(p.stock / maxStock) * 100}%`, background: "var(--green2)" }} />
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
            {stock_bajo_lista.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">✅</div><p>Todo en orden</p></div> : (
              <table className="inv-table">
                <thead><tr><th>Producto</th><th>Stock</th><th>Mín.</th></tr></thead>
                <tbody>
                  {stock_bajo_lista.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, fontSize: "0.8rem" }}>{p.nombre}</td>
                      <td><span className="inv-badge inv-badge-red">{p.stock_actual}</span></td>
                      <td className="inv-mono inv-muted">{p.stock_minimo}</td>
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

// ── PREDICCIÓN ────────────────────────────────────────────────────────────────
function PrediccionTab({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/reportes/prediccion", {}, token)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="inv-loading"><span className="inv-spin" /> Analizando datos...</div>;
  if (error) return <Alert msg={error} type="err" />;
  if (!data) return null;

  const urg = {
    critica: { badge: "inv-badge-red", label: "Crítico" },
    alta:    { badge: "inv-badge-amber", label: "Alta" },
    media:   { badge: "inv-badge-blue", label: "Media" },
    ok:      { badge: "inv-badge-green", label: "OK" },
  };

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Predicción de Demanda</h2><p>Análisis inteligente para los próximos 30 días</p></div>
      <div className="inv-stats" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
        {[
          { lbl: "Productos críticos", val: data.resumen.criticos, sub: "Menos de 7 días de stock", color: "#c43a25" },
          { lbl: "Alta prioridad", val: data.resumen.alta_prioridad, sub: "Menos de 15 días", color: "#92520a" },
          { lbl: "Inversión urgente", val: `$${data.resumen.costo_urgente.toLocaleString("es", { maximumFractionDigits: 0 })}`, sub: "Reposición inmediata", color: "#1a6b4a" },
        ].map(s => (
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
          {data.predicciones.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">📈</div><p>Insuficientes datos de ventas</p></div> : (
            <table className="inv-table">
              <thead>
                <tr><th>Producto</th><th>Stock</th><th>Vendido/30d</th><th>Días restantes</th><th>Tendencia</th><th>Comprar</th><th>Costo</th><th>Urgencia</th></tr>
              </thead>
              <tbody>
                {data.predicciones.map((p, i) => {
                  const cfg = urg[p.urgencia];
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, fontSize: "0.82rem" }}>{p.nombre}</td>
                      <td className="inv-mono">{p.stock_actual}</td>
                      <td className="inv-mono">{p.vendido_30d}</td>
                      <td className="inv-mono" style={{ fontWeight: 700, color: p.urgencia === "critica" ? "var(--red2)" : p.urgencia === "alta" ? "var(--amber2)" : "var(--ink)" }}>
                        {p.dias_stock_restante >= 999 ? "∞" : `${p.dias_stock_restante}d`}
                      </td>
                      <td className="inv-mono" style={{ color: p.tendencia_pct >= 0 ? "var(--green2)" : "var(--red2)" }}>
                        {p.tendencia_pct >= 0 ? "↑" : "↓"} {Math.abs(p.tendencia_pct)}%
                      </td>
                      <td className="inv-mono" style={{ fontWeight: 700, color: p.cantidad_recomendada > 0 ? "var(--amber2)" : "var(--ink4)" }}>
                        {p.cantidad_recomendada > 0 ? `+${p.cantidad_recomendada}` : "—"}
                      </td>
                      <td className="inv-mono" style={{ color: "var(--green)" }}>${p.costo_reposicion.toFixed(2)}</td>
                      <td><span className={`inv-badge ${cfg.badge}`}>{cfg.label}</span></td>
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

// ── REPORTE PDF ───────────────────────────────────────────────────────────────
function ReportePDFTab({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/reportes/pdf-data", {}, token)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const generarPDF = () => {
    if (!data) return;
    setGenerando(true);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reporte</title><style>
      body{font-family:Arial,sans-serif;color:#1a1916;margin:0}
      .h{background:#1a1916;color:#f7f6f3;padding:32px 40px}
      .h h1{margin:0 0 4px;font-size:24px} .h p{margin:0;opacity:.6;font-size:12px}
      .c{padding:32px 40px}
      .sg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
      .s{background:#f7f6f3;border-radius:8px;padding:16px;text-align:center;border:1px solid #e4e2da}
      .sv{font-size:24px;font-weight:700;color:#1a6b4a} .sl{font-size:10px;color:#9e9b92;text-transform:uppercase;letter-spacing:.1em;margin-top:4px}
      h2{font-size:13px;font-weight:700;margin:24px 0 10px;text-transform:uppercase;letter-spacing:.08em;color:#3d3b35}
      table{width:100%;border-collapse:collapse;font-size:11px}
      th{background:#f0efe9;padding:7px 10px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#9e9b92;border-bottom:1px solid #e4e2da}
      td{padding:8px 10px;border-bottom:1px solid #f0efe9}
      .ok{background:#e8f5ef;color:#1a6b4a;padding:2px 7px;border-radius:3px;font-size:9px;font-weight:700}
      .wa{background:#fdecea;color:#8b2215;padding:2px 7px;border-radius:3px;font-size:9px;font-weight:700}
      .ft{margin-top:36px;padding-top:14px;border-top:1px solid #e4e2da;font-size:10px;color:#9e9b92;text-align:center}
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
        ${data.productos.map(p => `<tr><td><strong>${p.nombre}</strong></td><td>${p.stock_actual}</td><td>${p.stock_minimo}</td><td>$${p.precio_venta.toFixed(2)}</td><td>$${p.valor_stock.toFixed(2)}</td><td><span class="${p.stock_actual <= p.stock_minimo ? "wa" : "ok"}">${p.estado}</span></td></tr>`).join("")}
      </tbody></table>
      <div class="ft">Inventario Profesional | ${data.fecha_generacion}</div>
    </div></body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html); w.document.close(); w.focus();
    setTimeout(() => { w.print(); setGenerando(false); }, 800);
  };

  if (loading) return <div className="inv-loading"><span className="inv-spin" /> Preparando reporte...</div>;
  if (error) return <Alert msg={error} type="err" />;
  if (!data) return null;

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Reporte PDF</h2><p>Genera un reporte completo del inventario</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="inv-card">
          <div className="inv-card-head"><div className="inv-card-title"><Icons.Pdf /> Generar reporte</div></div>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 16 }}>
              <div style={{ width: 64, height: 64, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>📄</div>
              <p style={{ color: "var(--ink3)", fontSize: "0.82rem", textAlign: "center", lineHeight: 1.6, maxWidth: 320 }}>
                Genera un PDF con el resumen del inventario, top productos y estado de stock del período actual.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, width: "100%" }}>
                {[{ lbl: "Productos", val: data.resumen.total_productos }, { lbl: "Ventas", val: data.resumen.total_ventas_mes }, { lbl: "Stock bajo", val: data.resumen.productos_stock_bajo }].map(s => (
                  <div key={s.lbl} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 600 }}>{s.val}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
              <button className="inv-btn inv-btn-primary" onClick={generarPDF} disabled={generando} style={{ padding: "10px 28px" }}>
                {generando ? <><span className="inv-spin" /> Generando...</> : <><Icons.Pdf /> Generar y descargar</>}
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
                    <td className="inv-mono" style={{ color: "var(--ink4)", fontSize: "0.72rem" }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                    <td className="inv-mono">{p.total_vendido}</td>
                    <td className="inv-mono" style={{ color: "var(--green)", fontWeight: 600 }}>${p.ingreso.toFixed(2)}</td>
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

// ── HISTORIAL VENTAS ──────────────────────────────────────────────────────────
function HistorialVentasTab({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [expandido, setExpandido] = useState(null);

  const cargar = async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append("fecha_inicio", fechaInicio);
      if (fechaFin) params.append("fecha_fin", fechaFin);
      setData(await apiFetch(`/historial-ventas/?${params}`, {}, token));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };
  useEffect(() => { cargar(); }, []);

  const fmt = iso => { if (!iso) return "—"; const d = new Date(iso); return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); };

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Historial de Ventas</h2><p>Consulta y filtra el registro completo de ventas</p></div>
      <div className="inv-card" style={{ marginBottom: 18 }}>
        <div className="inv-card-head"><div className="inv-card-title"><Icons.Clock /> Filtros</div></div>
        <div style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="inv-fg"><label className="inv-label">Fecha inicio</label><input className="inv-input" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} /></div>
          <div className="inv-fg"><label className="inv-label">Fecha fin</label><input className="inv-input" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} /></div>
          <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={cargar} disabled={loading}>{loading ? <span className="inv-spin" /> : <><Icons.Search /> Buscar</>}</button>
          <button className="inv-btn inv-btn-ghost inv-btn-sm" onClick={() => { setFechaInicio(""); setFechaFin(""); setTimeout(cargar, 0); }}>Limpiar</button>
        </div>
      </div>
      {error && <Alert msg={error} type="err" />}
      {data && (
        <div className="inv-stats" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 18 }}>
          {[
            { lbl: "Total ventas", val: data.total_registros, color: "#1a1916" },
            { lbl: "Ingresos período", val: `$${data.total_periodo.toLocaleString("es", { maximumFractionDigits: 2 })}`, color: "#1a6b4a" },
            { lbl: "Ticket promedio", val: `$${data.total_registros > 0 ? (data.total_periodo / data.total_registros).toFixed(2) : "0.00"}`, color: "#2d6fad" },
          ].map(s => (
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
          {loading ? <div className="inv-loading"><span className="inv-spin" /> Cargando...</div> :
            !data || data.ventas.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">🧾</div><p>Sin ventas en el período</p></div> : (
              <table className="inv-table">
                <thead><tr><th>#</th><th>Fecha</th><th>Productos</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {data.ventas.map(v => (
                    <>
                      <tr key={v.id_venta} style={{ cursor: "pointer" }} onClick={() => setExpandido(expandido === v.id_venta ? null : v.id_venta)}>
                        <td className="inv-mono" style={{ color: "var(--ink4)", fontSize: "0.72rem" }}>#{v.id_venta}</td>
                        <td style={{ fontSize: "0.8rem" }}>{fmt(v.fecha)}</td>
                        <td style={{ color: "var(--ink3)", fontSize: "0.78rem" }}>{v.items.length} producto{v.items.length !== 1 ? "s" : ""}</td>
                        <td className="inv-mono" style={{ fontWeight: 700, color: "var(--green)" }}>${v.total.toFixed(2)}</td>
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
                                      <td className="inv-mono" style={{ padding: "4px 8px", textAlign: "right", color: "var(--green)", fontWeight: 600 }}>${it.subtotal.toFixed(2)}</td>
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

// ── PROVEEDORES ───────────────────────────────────────────────────────────────
function ProveedoresTab({ token }) {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [alert, setAlert] = useState({ msg: "", type: "ok" });
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ nombre: "", contacto: "", telefono: "", email: "", direccion: "", activo: true });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const cargar = async () => {
    setLoading(true);
    try { setProveedores(await apiFetch("/proveedores/", {}, token)); }
    catch (e) { setAlert({ msg: e.message, type: "err" }); }
    setLoading(false);
  };
  useEffect(() => { cargar(); }, []);

  const handleGuardar = async e => {
    e.preventDefault();
    try {
      if (editando) { await apiFetch(`/proveedores/${editando}`, { method: "PUT", body: JSON.stringify(form) }, token); setAlert({ msg: "Proveedor actualizado", type: "ok" }); }
      else { await apiFetch("/proveedores/", { method: "POST", body: JSON.stringify(form) }, token); setAlert({ msg: "Proveedor creado", type: "ok" }); }
      setShowForm(false); setEditando(null); setForm({ nombre: "", contacto: "", telefono: "", email: "", direccion: "", activo: true }); cargar();
    } catch (e) { setAlert({ msg: e.message, type: "err" }); }
  };

  const handleEditar = p => { setForm({ nombre: p.nombre, contacto: p.contacto || "", telefono: p.telefono || "", email: p.email || "", direccion: p.direccion || "", activo: p.activo }); setEditando(p.id_proveedor); setShowForm(true); };

  const handleEliminar = async id => {
    try {
      await apiFetch(`/proveedores/${id}`, { method: "DELETE" }, token);
      setAlert({ msg: "Proveedor desactivado", type: "ok" });
      setConfirm(null);
      cargar();
    } catch (e) { setAlert({ msg: e.message, type: "err" }); setConfirm(null); }
  };

  return (
    <div className="inv-fade">
      {confirm && (
        <ConfirmModal
          title="Desactivar proveedor"
          message={`¿Desactivar a "${confirm.nombre}"? El proveedor quedará inactivo pero no se perderá el historial.`}
          onConfirm={() => handleEliminar(confirm.id)}
          onCancel={() => setConfirm(null)}
          confirmLabel="Desactivar"
        />
      )}
      <div className="inv-ph"><h2>Proveedores</h2><p>Gestiona tu red de proveedores</p></div>
      <Alert msg={alert.msg} type={alert.type} />
      <div className="inv-stats" style={{ gridTemplateColumns: "repeat(2,1fr)", marginBottom: 18 }}>
        {[{ lbl: "Total proveedores", val: proveedores.length, color: "#1a1916" }, { lbl: "Activos", val: proveedores.filter(p => p.activo).length, color: "#1a6b4a" }].map(s => (
          <div key={s.lbl} className="inv-stat">
            <div className="inv-stat-accent" style={{ background: s.color }} />
            <div className="inv-stat-lbl">{s.lbl}</div>
            <div className="inv-stat-val">{s.val}</div>
          </div>
        ))}
      </div>
      <div className="inv-card">
        <div className="inv-card-head">
          <div className="inv-card-title"><Icons.Truck /> Proveedores</div>
          <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={() => { setShowForm(!showForm); setEditando(null); setForm({ nombre: "", contacto: "", telefono: "", email: "", direccion: "", activo: true }); }}>
            <Icons.Plus /> Nuevo proveedor
          </button>
        </div>
        {showForm && (
          <>
            <div style={{ padding: "12px 18px 0" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink3)" }}>{editando ? "Editar proveedor" : "Nuevo proveedor"}</span>
            </div>
            <form onSubmit={handleGuardar}>
              <div className="inv-form-grid">
                <div className="inv-fg"><label className="inv-label">Nombre *</label><input className="inv-input" value={form.nombre} onChange={set("nombre")} required placeholder="Empresa o persona" /></div>
                <div className="inv-fg"><label className="inv-label">Contacto</label><input className="inv-input" value={form.contacto} onChange={set("contacto")} placeholder="Nombre del contacto" /></div>
                <div className="inv-fg"><label className="inv-label">Teléfono</label><input className="inv-input" value={form.telefono} onChange={set("telefono")} placeholder="+57 300 000 0000" /></div>
                <div className="inv-fg"><label className="inv-label">Email</label><input className="inv-input" type="email" value={form.email} onChange={set("email")} placeholder="proveedor@empresa.com" /></div>
                <div className="inv-fg inv-col2"><label className="inv-label">Dirección</label><input className="inv-input" value={form.direccion} onChange={set("direccion")} placeholder="Calle, ciudad" /></div>
                <div className="inv-col2" style={{ display: "flex", gap: 8 }}>
                  <button className="inv-btn inv-btn-green" type="submit"><Icons.Check /> {editando ? "Guardar cambios" : "Crear proveedor"}</button>
                  <button className="inv-btn inv-btn-ghost" type="button" onClick={() => { setShowForm(false); setEditando(null); }}>Cancelar</button>
                </div>
              </div>
            </form>
            <div className="inv-divider" />
          </>
        )}
        <div className="inv-table-wrap">
          {loading ? <div className="inv-loading"><span className="inv-spin" /> Cargando...</div> :
            proveedores.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">🚚</div><p>No hay proveedores registrados</p></div> : (
              <table className="inv-table">
                <thead><tr><th>Nombre</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {proveedores.map(p => (
                    <tr key={p.id_proveedor}>
                      <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                      <td style={{ color: "var(--ink3)" }}>{p.contacto || "—"}</td>
                      <td className="inv-mono" style={{ fontSize: "0.78rem" }}>{p.telefono || "—"}</td>
                      <td style={{ fontSize: "0.78rem", color: "var(--blue2)" }}>{p.email || "—"}</td>
                      <td><span className={`inv-badge ${p.activo ? "inv-badge-green" : "inv-badge-gray"}`}>{p.activo ? "Activo" : "Inactivo"}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="inv-btn-ico inv-btn-ico-edit" onClick={() => handleEditar(p)}><Icons.Edit /></button>
                          <button className="inv-btn-ico" onClick={() => setConfirm({ id: p.id_proveedor, nombre: p.nombre })}><Icons.Trash /></button>
                        </div>
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

// ── TELEGRAM ──────────────────────────────────────────────────────────────────
function TelegramTab({ token }) {
  const [loadingTest, setLoadingTest] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [estado, setEstado] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (texto, tipo = "ok") => {
    const hora = new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [{ texto, tipo, hora }, ...prev].slice(0, 20));
  };

  const call = async (endpoint, setLoading, label) => {
    setLoading(true);
    try {
      const res = await apiFetch(endpoint, { method: "POST" }, token);
      if (res.ok) { addLog(`${label} — enviado correctamente`, "ok"); setEstado("ok"); }
      else { addLog(`${label} — error al enviar`, "err"); setEstado("err"); }
    } catch (e) { addLog(`${label} — ${e.message}`, "err"); setEstado("err"); }
    setLoading(false);
  };

  const handleMensaje = async e => {
    e.preventDefault(); if (!mensaje.trim()) return; setLoadingMsg(true);
    try {
      const res = await apiFetch("/telegram/mensaje", { method: "POST", body: JSON.stringify({ texto: mensaje }) }, token);
      if (res.ok) { addLog(`Mensaje enviado: "${mensaje.slice(0, 40)}${mensaje.length > 40 ? "..." : ""}"`, "ok"); setMensaje(""); }
      else addLog("Error al enviar mensaje", "err");
    } catch (e) { addLog(e.message, "err"); }
    setLoadingMsg(false);
  };

  const actions = [
    { label: "Probar conexión", desc: "Envía un mensaje de prueba para verificar que el bot responde", icon: "🔌", fn: () => call("/telegram/test", setLoadingTest, "Test de conexión"), loading: loadingTest, style: "inv-btn-primary" },
    { label: "Alertas de stock", desc: "Revisa todos los productos y notifica los que están bajo el mínimo", icon: "⚠️", fn: () => call("/telegram/alertas-stock", setLoadingStock, "Alertas de stock"), loading: loadingStock, style: "inv-btn-amber" },
    { label: "Resumen del día", desc: "Envía un reporte completo de ventas e inventario de hoy", icon: "📊", fn: () => call("/telegram/resumen-hoy", setLoadingResumen, "Resumen del día"), loading: loadingResumen, style: "inv-btn-ghost" },
  ];

  const comandos = [
    { cmd: "/stock", desc: "Ver stock de todos los productos" },
    { cmd: "/ventas", desc: "Resumen de ventas del día" },
    { cmd: "/entrada 3 50 Reposición", desc: "Registrar entrada de stock" },
    { cmd: "/salida 3 10 Ajuste", desc: "Registrar salida de stock" },
    { cmd: "/buscar camisa", desc: "Buscar producto por nombre" },
    { cmd: "/ayuda", desc: "Ver todos los comandos" },
  ];

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Telegram Bot</h2><p>Controla y monitorea tu inventario desde Telegram</p></div>
      <div className="inv-card" style={{ marginBottom: 18, borderLeft: `3px solid ${estado === "ok" ? "var(--green2)" : estado === "err" ? "var(--red2)" : "var(--border2)"}` }}>
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: "1.5rem" }}>✈️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 2 }}>Bot de Telegram activo</div>
            <div style={{ fontSize: "0.76rem", color: "var(--ink3)" }}>Recibe alertas automáticas con cada venta y cuando el stock baje del mínimo</div>
          </div>
          {estado && <span className={`inv-badge ${estado === "ok" ? "inv-badge-green" : "inv-badge-red"}`}>{estado === "ok" ? "✓ Conectado" : "✗ Error"}</span>}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
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
                <textarea className="inv-input" style={{ resize: "vertical", minHeight: 80 }} placeholder="Escribe tu mensaje..." value={mensaje} onChange={e => setMensaje(e.target.value)} />
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
                  <code style={{ fontSize: "0.72rem", background: "var(--green3)", color: "var(--green)", padding: "2px 7px", borderRadius: 4, fontFamily: "var(--mono)" }}>{c.cmd}</code>
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

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  injectStyles();
  const [token, setToken] = useState(() => localStorage.getItem("inv_token") || "");
  const [userData, setUserData] = useState(() => { try { return JSON.parse(localStorage.getItem("inv_user") || "null"); } catch { return null; } });
  const [tab, setTab] = useState("productos");

  const handleLogin = t => {
    setToken(t); localStorage.setItem("inv_token", t);
    try { const p = JSON.parse(atob(t.split(".")[1])); setUserData(p); localStorage.setItem("inv_user", JSON.stringify(p)); } catch {}
  };
  const handleLogout = () => { setToken(""); setUserData(null); localStorage.removeItem("inv_token"); localStorage.removeItem("inv_user"); };

  if (!token) return <LoginPage onLogin={handleLogin} />;

  const isAdmin = userData?.id_rol === 1;
  const userId = userData?.id_usuario;

  const tabs = [
    { id: "dashboard",   label: "Dashboard",      icon: <Icons.Chart />,  adminOnly: true },
    { id: "productos",   label: "Productos",       icon: <Icons.Box /> },
    { id: "ventas",      label: "Nueva Venta",     icon: <Icons.Cart /> },
    { id: "movimientos", label: "Movimientos",     icon: <Icons.List /> },
    { id: "ia",          label: "Asistente IA",    icon: <Icons.Brain /> },
    { id: "prediccion",  label: "Predicción IA",   icon: <Icons.Star />,  adminOnly: true },
    { id: "reporte",     label: "Reporte PDF",     icon: <Icons.Pdf />,   adminOnly: true },
    { id: "historial",   label: "Historial",       icon: <Icons.Clock />, adminOnly: true },
    { id: "proveedores", label: "Proveedores",     icon: <Icons.Truck />, adminOnly: true },
    { id: "telegram",    label: "Telegram Bot",    icon: <Icons.Send />,  adminOnly: true },
    { id: "usuarios",    label: "Usuarios",        icon: <Icons.Robot />, adminOnly: true },
  ].filter(t => !t.adminOnly || isAdmin);

  return (
    <div className="inv-app">
      <header className="inv-top">
        <div className="inv-logo">
          <div className="inv-logo-mark"><Icons.Box size={16} /></div>
          <span className="inv-logo-name">Inventario <em>Pro</em></span>
        </div>
        <div className="inv-top-right">
          <div className="inv-user-pill">
            <span className="inv-user-dot" />
            <span>{userData?.sub}</span>
          </div>
          <span className="inv-role-pill">{isAdmin ? "Admin" : "Vendedor"}</span>
          <button className="inv-logout" onClick={handleLogout} title="Cerrar sesión"><Icons.Logout /></button>
        </div>
      </header>

      <nav className="inv-nav">
        {tabs.map(t => (
          <button key={t.id} className={`inv-nav-btn ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      <main className="inv-main">
        {tab === "dashboard"   && <DashboardTab token={token} />}
        {tab === "productos"   && <ProductosTab token={token} isAdmin={isAdmin} />}
        {tab === "ventas"      && <VentasTab token={token} userId={userId} />}
        {tab === "movimientos" && <MovimientosTab token={token} isAdmin={isAdmin} />}
        {tab === "ia"          && <AsistenteIATab token={token} />}
        {tab === "prediccion"  && <PrediccionTab token={token} />}
        {tab === "reporte"     && <ReportePDFTab token={token} />}
        {tab === "historial"   && <HistorialVentasTab token={token} />}
        {tab === "proveedores" && <ProveedoresTab token={token} />}
        {tab === "telegram"    && <TelegramTab token={token} />}
        {tab === "usuarios"    && <UsuariosTab token={token} />}
      </main>
    </div>
  );
}
