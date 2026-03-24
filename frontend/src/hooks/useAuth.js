import { useState, useCallback } from "react";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

/**
 * Self-contained auth hook — usado en la raíz de App antes de que
 * existan providers. Los componentes hijos deben usar useAuthContext().
 */
export function useAuth() {
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

  return {
    token,
    userData,
    isAdmin:  userData?.id_rol === 1,
    userId:   userData?.id_usuario,
    userName: userData?.sub ?? "",
    login,
    logout,
  };
}
