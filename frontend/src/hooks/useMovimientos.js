import { useState, useEffect, useCallback } from "react";
import { productService }     from "../services/productService";
import { movimientosService } from "../services/movimientosService";

export function useMovimientos(token, isAdmin) {
  const [productos,    setProductos]   = useState([]);
  const [movimientos,  setMovimientos] = useState([]);
  const [loadingMov,   setLoadingMov]  = useState(false);
  const [alert,        setAlert]       = useState({ msg: "", type: "ok" });
  const [form,         setForm]        = useState({ id_producto: "", cantidad: "", motivo: "", tipo: "entrada" });

  const loadMovimientos = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingMov(true);
    try {
      setMovimientos(await movimientosService.getAll(token));
    } catch {
      // silently fail — non-critical
    } finally {
      setLoadingMov(false);
    }
  }, [token, isAdmin]);

  useEffect(() => {
    productService.getAll(token)
      .then(setProductos)
      .catch((e) => setAlert({ msg: e.message, type: "err" }));
    loadMovimientos();
  }, [token, loadMovimientos]);

  const setField = useCallback(
    (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value })),
    []
  );

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id_producto: parseInt(form.id_producto),
        cantidad:    parseInt(form.cantidad),
        motivo:      form.motivo,
      };
      if (form.tipo === "entrada") {
        await movimientosService.entrada(payload, token);
      } else {
        await movimientosService.salida(payload, token);
      }
      setAlert({ msg: `Movimiento de ${form.tipo} registrado`, type: "ok" });
      setForm((f) => ({ id_producto: "", cantidad: "", motivo: "", tipo: f.tipo }));
      loadMovimientos();
    } catch (e) {
      setAlert({ msg: e.message, type: "err" });
    }
  }, [form, token, loadMovimientos]);

  return { productos, movimientos, loadingMov, alert, form, setField, handleSubmit };
}
