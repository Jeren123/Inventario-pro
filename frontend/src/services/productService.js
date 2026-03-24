import { apiFetch } from "./api";

export const productService = {
  getAll: (token) =>
    apiFetch("/productos/", {}, token),

  create: (data, token) =>
    apiFetch("/productos/", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  update: (id, data, token) =>
    apiFetch(`/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token),

  remove: (id, token) =>
    apiFetch(`/productos/${id}`, { method: "DELETE" }, token),
};
