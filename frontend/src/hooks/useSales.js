import { useState, useEffect, useCallback, useMemo } from "react";
import { productService } from "../services/productService";
import { salesService }   from "../services/salesService";
import { calcCartTotal }  from "../utils/calculations";

export function useSales(token, userId) {
  const [productos, setProductos] = useState([]);
  const [items,     setItems]     = useState([]);
  const [alert,     setAlert]     = useState({ msg: "", type: "ok" });
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    productService.getAll(token)
      .then(setProductos)
      .catch((e) => setAlert({ msg: e.message, type: "err" }));
  }, [token]);

  const addItem = useCallback((id) => {
    const p = productos.find((x) => x.id_producto === parseInt(id));
    if (!p) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.id_producto === p.id_producto);
      if (existing) {
        return prev.map((i) =>
          i.id_producto === p.id_producto
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { id_producto: p.id_producto, nombre: p.nombre, precio_venta: p.precio_venta, cantidad: 1 }];
    });
  }, [productos]);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id_producto !== id));
  }, []);

  const setQuantity = useCallback((id, value) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id_producto === id
          ? { ...i, cantidad: Math.max(1, parseInt(value) || 1) }
          : i
      )
    );
  }, []);

  const total = useMemo(() => calcCartTotal(items), [items]);

  const handleVenta = useCallback(async () => {
    if (!items.length) {
      setAlert({ msg: "Agrega al menos un producto", type: "err" });
      return;
    }
    setLoading(true);
    try {
      const d = await salesService.create({
        id_usuario: userId,
        detalles: items.map((i) => ({ id_producto: i.id_producto, cantidad: i.cantidad })),
      }, token);
      setAlert({ msg: `✓ Venta #${d.id_venta} registrada — Total: $${parseFloat(d.total).toFixed(2)}`, type: "ok" });
      setItems([]);
    } catch (e) {
      setAlert({ msg: e.message, type: "err" });
    } finally {
      setLoading(false);
    }
  }, [items, token, userId]);

  return { productos, items, alert, loading, total, addItem, removeItem, setQuantity, handleVenta };
}
