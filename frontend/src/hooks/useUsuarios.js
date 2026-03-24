import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";

const EMPTY_FORM = { nombre: "", email: "", password: "", id_rol: "2" };

export function useUsuarios(token) {
  const [usuarios,  setUsuarios]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [alert,     setAlert]     = useState({ msg: "", type: "ok" });
  const [confirm,   setConfirm]   = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsuarios(await authService.getUsuarios(token));
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

  const handleCrear = useCallback(async (e) => {
    e.preventDefault();
    setAlert({ msg: "", type: "ok" });
    try {
      await authService.createUsuario({ ...form, id_rol: parseInt(form.id_rol) }, token);
      setAlert({ msg: `Usuario "${form.nombre}" creado correctamente`, type: "ok" });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (e) {
      setAlert({ msg: e.message, type: "err" });
    }
  }, [form, token, load]);

  const handleEliminar = useCallback(async (id) => {
    try {
      await authService.deleteUsuario(id, token);
      setAlert({ msg: "Usuario eliminado", type: "ok" });
      setConfirm(null);
      load();
    } catch (e) {
      setAlert({ msg: e.message, type: "err" });
      setConfirm(null);
    }
  }, [token, load]);

  return {
    usuarios, loading, alert, confirm, setConfirm,
    showForm, setShowForm, form, setField,
    handleCrear, handleEliminar,
  };
}
