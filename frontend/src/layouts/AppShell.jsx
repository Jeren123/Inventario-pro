import { Header }    from "./Header";
import { AppNav }    from "./AppNav";
import { useUI }     from "../context/UIContext";
import { PAGE_MAP }  from "./pageMap";

export function AppShell({ userData, isAdmin, userId, token, onLogout }) {
  const { activeTab, navigateTo, menuOpen, toggleMenu } = useUI();

  const ActivePage = PAGE_MAP[activeTab];

  return (
    <div className="inv-app">
      <Header
        userName={userData?.sub ?? ""}
        isAdmin={isAdmin}
        menuOpen={menuOpen}
        onToggleMenu={toggleMenu}
        onLogout={onLogout}
      />

      <AppNav
        isAdmin={isAdmin}
        activeTab={activeTab}
        menuOpen={menuOpen}
        onNavigate={navigateTo}
      />

      <main className="inv-main">
        {ActivePage ? (
          <ActivePage
            token={token}
            isAdmin={isAdmin}
            userId={userId}
          />
        ) : null}
      </main>
    </div>
  );
}
