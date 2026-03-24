import { useState, useEffect, useCallback } from "react";
import { proveedoresService } from "../services/proveedoresService";

const EMPTY_FORM = { nombre: "", contacto: "", telefono: "", email: "", direccion: "", activo: true };

export function useProveedores(token) {
  const [proveedores, setProveedores] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [alert,       setAlert]       = useState({ msg: "", type: "ok" });
  const [confirm,     setConfirm]     = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [editId,      setEditId]      = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProveedores(await proveedoresService.getAll(token));
    } catch (e) {
      setAlert({ msg: e.message, type: "err" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const setField = useCallback(
    (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value })),
    []
  );

  const openCreate = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  }, []);

  const openEdit = useCallback((p) => {
    setForm({ nombre: p.nombre, contacto: p.contacto || "", telefono: p.telefono || "", email: p.email || "", direccion: p.direccion || "", activo: p.activo });
    setEditId(p.id_proveedor);
    setShowForm(true);
  }, []);

  const handleGuardar = useCallback(async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await proveedoresService.update(editId, form, token);
        setAlert({ msg: "Proveedor actualizado", type: "ok" });
      } else {
        await proveedoresService.create(form, token);
        setAlert({ msg: "Proveedor creado", type: "ok" });
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      load();
    } catch (e) {
      setAlert({ msg: e.message, type: "err" });
    }
  }, [editId, form, token, load]);

  const handleEliminar = useCallback(async (id) => {
    try {
      await proveedoresService.remove(id, token);
      setAlert({ msg: "Proveedor desactivado", type: "ok" });
      setConfirm(null);
      load();
    } catch (e) {
      setAlert({ msg: e.message, type: "err" });
      setConfirm(null);
    }
  }, [token, load]);

  return {
    proveedores, loading, alert, confirm, setConfirm,
    showForm, setShowForm, form, setField, editId,
    openCreate, openEdit, handleGuardar, handleEliminar,
  };
}
