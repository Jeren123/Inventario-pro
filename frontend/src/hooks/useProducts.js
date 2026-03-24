import { useState, useEffect, useCallback, useMemo } from "react";
import { productService } from "../services/productService";

/**
 * Centraliza todo el estado y lógica de productos.
 * Los componentes sólo reciben datos y callbacks —  sin lógica inline.
 */
export function useProducts(token) {
  const [products, setProducts]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [alert,    setAlert]      = useState({ msg: "", type: "ok" });
  const [search,   setSearch]     = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [confirm,  setConfirm]    = useState(null);

  const emptyForm = { nombre: "", descripcion: "", precio_compra: "", precio_venta: "", stock_actual: "", stock_minimo: "", activo: true };
  const [form, setForm] = useState(emptyForm);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await productService.getAll(token));
    } catch (e) {
      setAlert({ msg: e.message, type: "err" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () => products.filter((p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase())
    ),
    [products, search]
  );

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = useCallback(async (e) => {
    e.preventDefault();
    try {
      await productService.create({
        ...form,
        precio_compra: parseFloat(form.precio_compra),
        precio_venta:  parseFloat(form.precio_venta),
        stock_actual:  parseInt(form.stock_actual),
        stock_minimo:  parseInt(form.stock_minimo),
      }, token);
      setAlert({ msg: "Producto creado correctamente", type: "ok" });
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      setAlert({ msg: e.message, type: "err" });
    }
  }, [form, token, load]);

  // ── Update ────────────────────────────────────────────────────────────────
  const handleUpdate = useCallback(async (updatedForm) => {
    try {
      await productService.update(editItem.id_producto, {
        ...updatedForm,
        precio_compra: parseFloat(updatedForm.precio_compra),
        precio_venta:  parseFloat(updatedForm.precio_venta),
        stock_actual:  parseInt(updatedForm.stock_actual),
        stock_minimo:  parseInt(updatedForm.stock_minimo),
      }, token);
      setEditItem(null);
      setAlert({ msg: "Producto actualizado", type: "ok" });
      load();
    } catch (e) {
      setAlert({ msg: e.message, type: "err" });
    }
  }, [editItem, token, load]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id) => {
    try {
      await productService.remove(id, token);
      setAlert({ msg: "Producto desactivado correctamente", type: "ok" });
      setConfirm(null);
      load();
    } catch (e) {
      setAlert({ msg: e.message, type: "err" });
      setConfirm(null);
    }
  }, [token, load]);

  const setField = useCallback(
    (k) => (e) =>
      setForm((f) => ({
        ...f,
        [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
      })),
    []
  );

  return {
    products, filtered, loading, alert, search, setSearch,
    showForm, setShowForm, editItem, setEditItem, confirm, setConfirm,
    form, setForm, setField, emptyForm,
    handleCreate, handleUpdate, handleDelete, reload: load,
  };
}
