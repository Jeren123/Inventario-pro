import { Icons } from "../components/shared/Icons";

/**
 * Declaración centralizada de todas las pestañas.
 * Para agregar una nueva sección: añadir aquí + en pageMap.js.
 */
const ALL_TABS = [
  { id: "dashboard",   label: "Dashboard",     icon: "Chart",  adminOnly: true  },
  { id: "productos",   label: "Productos",     icon: "Box",    adminOnly: false },
  { id: "ventas",      label: "Nueva Venta",   icon: "Cart",   adminOnly: false },
  { id: "movimientos", label: "Movimientos",   icon: "List",   adminOnly: false },
  { id: "ia",          label: "Asistente IA",  icon: "Brain",  adminOnly: false },
  { id: "prediccion",  label: "Predicción IA", icon: "Star",   adminOnly: true  },
  { id: "reporte",     label: "Reporte PDF",   icon: "Pdf",    adminOnly: true  },
  { id: "historial",   label: "Historial",     icon: "Clock",  adminOnly: true  },
  { id: "proveedores", label: "Proveedores",   icon: "Truck",  adminOnly: true  },
  { id: "telegram",    label: "Telegram Bot",  icon: "Send",   adminOnly: true  },
  { id: "usuarios",    label: "Usuarios",      icon: "Robot",  adminOnly: true  },
];

export function AppNav({ isAdmin, activeTab, menuOpen, onNavigate }) {
  const visibleTabs = ALL_TABS.filter((t) => !t.adminOnly || isAdmin);

  return (
    <nav
      id="app-nav"
      className={`inv-nav${menuOpen ? " open" : ""}`}
      role="navigation"
      aria-label="Navegación principal"
    >
      {visibleTabs.map((tab) => {
        const IconComponent = Icons[tab.icon];
        return (
          <button
            key={tab.id}
            className={`inv-nav-btn${activeTab === tab.id ? " on" : ""}`}
            onClick={() => onNavigate(tab.id)}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {IconComponent && <IconComponent />}
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
