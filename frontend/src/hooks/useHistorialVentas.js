import { useState, useEffect, useCallback } from "react";
import { salesService } from "../services/salesService";

export function useHistorialVentas(token) {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin,    setFechaFin]    = useState("");
  const [expandido,   setExpandido]   = useState(null);

  const load = useCallback(async (inicio = fechaInicio, fin = fechaFin) => {
    setLoading(true);
    setError("");
    try {
      setData(await salesService.getHistorial({ fechaInicio: inicio, fechaFin: fin }, token));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, fechaInicio, fechaFin]);

  useEffect(() => { load("", ""); }, [token]);

  const handleSearch = useCallback(() => load(), [load]);

  const handleClear = useCallback(() => {
    setFechaInicio("");
    setFechaFin("");
    load("", "");
  }, [load]);

  const toggleExpandido = useCallback((id) => {
    setExpandido((prev) => (prev === id ? null : id));
  }, []);

  return {
    data, loading, error,
    fechaInicio, setFechaInicio,
    fechaFin,    setFechaFin,
    expandido, toggleExpandido,
    handleSearch, handleClear,
  };
}
