import { Icons } from "../components/shared/Icons";

export function Header({ userName, isAdmin, menuOpen, onToggleMenu, onLogout }) {
  return (
    <header className="inv-top">
      <div className="inv-logo">
        <div className="inv-logo-mark">
          <Icons.Box size={16} />
        </div>
        <span className="inv-logo-name">
          Inventario <em>Pro</em>
        </span>
      </div>

      <div className="inv-top-right">
        <div className="inv-user-pill">
          <span className="inv-user-dot" aria-hidden="true" />
          <span className="inv-user-pill-text">{userName}</span>
        </div>

        <span className="inv-role-pill">
          {isAdmin ? "Admin" : "Vendedor"}
        </span>

        <button
          className="inv-logout"
          onClick={onLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <Icons.Logout />
        </button>

        <button
          className={`inv-hamburger${menuOpen ? " open" : ""}`}
          onClick={onToggleMenu}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="app-nav"
        >
          <span className="inv-hamburger-line" />
          <span className="inv-hamburger-line" />
          <span className="inv-hamburger-line" />
        </button>
      </div>
    </header>
  );
}
