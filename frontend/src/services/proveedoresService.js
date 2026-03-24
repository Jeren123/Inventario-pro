import { apiFetch } from "./api";

export const proveedoresService = {
  getAll: (token) =>
    apiFetch("/proveedores/", {}, token),

  create: (data, token) =>
    apiFetch("/proveedores/", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  update: (id, data, token) =>
    apiFetch(`/proveedores/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token),

  remove: (id, token) =>
    apiFetch(`/proveedores/${id}`, { method: "DELETE" }, token),
};
