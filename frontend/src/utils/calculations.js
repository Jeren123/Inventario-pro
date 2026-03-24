/** Calcula el valor total del inventario */
export function calcInventoryValue(products) {
  return products.reduce(
    (acc, p) => acc + parseFloat(p.precio_venta || 0) * (p.stock_actual || 0),
    0
  );
}

/** Devuelve productos con stock <= mínimo */
export function getLowStockProducts(products) {
  return products.filter((p) => p.stock_actual <= p.stock_minimo);
}

/** Calcula el total de un carrito */
export function calcCartTotal(items) {
  return items.reduce(
    (acc, i) => acc + parseFloat(i.precio_venta || 0) * (i.cantidad || 0),
    0
  );
}

/** Construye stats para la página de productos */
export function buildProductStats(products) {
  const value    = calcInventoryValue(products);
  const lowStock = getLowStockProducts(products);
  return [
    { lbl: "Total productos",  val: products.length,  sub: `${products.filter((p) => p.activo).length} activos`, color: "var(--dark)" },
    { lbl: "Stock bajo",       val: lowStock.length,  sub: "Requieren reabastecimiento",                        color: "var(--danger)" },
    { lbl: "Valor inventario", val: `$${value.toLocaleString("es", { maximumFractionDigits: 0 })}`, sub: "Precio venta total", color: "var(--success)" },
    { lbl: "Activos",          val: products.filter((p) => p.activo).length, sub: `de ${products.length} total`, color: "var(--primary)" },
  ];
}
