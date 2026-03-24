/**
 * Mapa de tab id → componente de página.
 * Para agregar una nueva página: importar aquí + declarar en AppNav.jsx.
 *
 * NOTA: estas páginas aún no existen como archivos separados en FASE 1.
 * En FASE 2 se crean. Por ahora se re-exportan desde el App.jsx original
 * usando el shim de compatibilidad de abajo.
 */

// ── Shim de compatibilidad ─────────────────────────────────────────────────
// Mientras se completa la migración por fases, importamos las funciones
// directamente del App.jsx original renombrado a AppLegacy.jsx.
// En FASE 2 cada import apuntará a su propio archivo en /pages/.

import { DashboardPage }       from "../pages/DashboardPage";
import { ProductosPage }       from "../pages/ProductosPage";
import { VentasPage }          from "../pages/VentasPage";
import { MovimientosPage }     from "../pages/MovimientosPage";
import { AsistenteIAPage }     from "../pages/AsistenteIAPage";
import { PrediccionPage }      from "../pages/PrediccionPage";
import { ReportePDFPage }      from "../pages/ReportePDFPage";
import { HistorialVentasPage } from "../pages/HistorialVentasPage";
import { ProveedoresPage }     from "../pages/ProveedoresPage";
import { TelegramPage }        from "../pages/TelegramPage";
import { UsuariosPage }        from "../pages/UsuariosPage";

export const PAGE_MAP = {
  dashboard:   DashboardPage,
  productos:   ProductosPage,
  ventas:      VentasPage,
  movimientos: MovimientosPage,
  ia:          AsistenteIAPage,
  prediccion:  PrediccionPage,
  reporte:     ReportePDFPage,
  historial:   HistorialVentasPage,
  proveedores: ProveedoresPage,
  telegram:    TelegramPage,
  usuarios:    UsuariosPage,
};
