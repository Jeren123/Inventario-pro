import { apiFetch } from "./api";

export const movimientosService = {
  getAll: (token) =>
    apiFetch("/movimientos/", {}, token),

  entrada: (data, token) =>
    apiFetch("/movimientos/entrada", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  salida: (data, token) =>
    apiFetch("/movimientos/salida", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
};
