import { createContext, useContext, useState, useCallback } from "react";

const UIContext = createContext(null);

const DEFAULT_TAB = "productos";

export function UIProvider({ children }) {
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);
  const [menuOpen,  setMenuOpen]  = useState(false);

  const navigateTo = useCallback((tabId) => {
    setActiveTab(tabId);
    setMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(
    () => setMenuOpen((prev) => !prev),
    []
  );

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <UIContext.Provider
      value={{ activeTab, navigateTo, menuOpen, toggleMenu, closeMenu }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be inside <UIProvider>");
  return ctx;
}
