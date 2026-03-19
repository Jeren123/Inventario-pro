const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiFetch = async (path, options = {}, token = null) => {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Error desconocido" }));
    throw new Error(err.detail || "Error en la petición");
  }
  return res.json();
};
