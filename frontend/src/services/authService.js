import { apiFetch } from "./api";

export const authService = {
  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getUsuarios: (token) =>
    apiFetch("/auth/usuarios", {}, token),

  createUsuario: (data, token) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  deleteUsuario: (id, token) =>
    apiFetch(`/auth/usuarios/${id}`, { method: "DELETE" }, token),
};
