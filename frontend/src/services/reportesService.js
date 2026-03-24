import { apiFetch } from "./api";

export const reportesService = {
  getDashboard: (token) =>
    apiFetch("/reportes/dashboard", {}, token),

  getPrediccion: (token) =>
    apiFetch("/reportes/prediccion", {}, token),

  getPdfData: (token) =>
    apiFetch("/reportes/pdf-data", {}, token),

  getIaChat: (payload, token) =>
    apiFetch("/ia/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }, token),
};
