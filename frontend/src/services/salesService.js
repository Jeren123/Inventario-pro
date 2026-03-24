import { apiFetch } from "./api";

export const salesService = {
  create: (data, token) =>
    apiFetch("/ventas/", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  getHistorial: (params, token) => {
    const qs = new URLSearchParams();
    if (params?.fechaInicio) qs.append("fecha_inicio", params.fechaInicio);
    if (params?.fechaFin)    qs.append("fecha_fin",    params.fechaFin);
    return apiFetch(`/historial-ventas/?${qs}`, {}, token);
  },
};
