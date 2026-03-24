import { apiFetch } from "./api";

export const telegramService = {
  test:        (token) => apiFetch("/telegram/test",          { method: "POST" }, token),
  alertasStock:(token) => apiFetch("/telegram/alertas-stock", { method: "POST" }, token),
  resumenHoy:  (token) => apiFetch("/telegram/resumen-hoy",   { method: "POST" }, token),
  mensaje: (texto, token) =>
    apiFetch("/telegram/mensaje", {
      method: "POST",
      body: JSON.stringify({ texto }),
    }, token),
};
