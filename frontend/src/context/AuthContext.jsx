import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("inv_token") || ""
  );
  const [userData, setUserData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("inv_user") || "null");
    } catch {
      return null;
    }
  });

  const login = useCallback((accessToken) => {
    const payload = parseJwt(accessToken);
    setToken(accessToken);
    setUserData(payload);
    localStorage.setItem("inv_token", accessToken);
    localStorage.setItem("inv_user", JSON.stringify(payload));
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setUserData(null);
    localStorage.removeItem("inv_token");
    localStorage.removeItem("inv_user");
  }, []);

  const isAdmin  = userData?.id_rol === 1;
  const userId   = userData?.id_usuario;
  const userName = userData?.sub ?? "";

  return (
    <AuthContext.Provider
      value={{ token, userData, isAdmin, userId, userName, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be inside <AuthProvider>");
  return ctx;
}
