import { useAuth }     from "./hooks/useAuth";
import { UIProvider }  from "./context/UIContext";
import { AppShell }    from "./layouts/AppShell";
import { LoginPage }   from "./pages/LoginPage";


export default function App() {
  const { token, login, logout, userData, isAdmin, userId } = useAuth();

  if (!token) return <LoginPage onLogin={login} />;

  return (
    <UIProvider>
      <AppShell
        userData={userData}
        isAdmin={isAdmin}
        userId={userId}
        token={token}
        onLogout={logout}
      />
    </UIProvider>
  );
}
