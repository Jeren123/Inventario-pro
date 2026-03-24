import { useState, useCallback } from "react";
import { telegramService } from "../services/telegramService";

export function useTelegram(token) {
  const [loadingTest,    setLoadingTest]    = useState(false);
  const [loadingStock,   setLoadingStock]   = useState(false);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [loadingMsg,     setLoadingMsg]     = useState(false);
  const [mensaje,        setMensaje]        = useState("");
  const [estado,         setEstado]         = useState(null); // "ok" | "err" | null
  const [logs,           setLogs]           = useState([]);

  const addLog = useCallback((texto, tipo = "ok") => {
    const hora = new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [{ texto, tipo, hora }, ...prev].slice(0, 20));
  }, []);

  const call = useCallback(async (serviceMethod, setLoading, label) => {
    setLoading(true);
    try {
      const res = await serviceMethod(token);
      if (res?.ok !== false) {
        addLog(`${label} — enviado correctamente`, "ok");
        setEstado("ok");
      } else {
        addLog(`${label} — error al enviar`, "err");
        setEstado("err");
      }
    } catch (e) {
      addLog(`${label} — ${e.message}`, "err");
      setEstado("err");
    } finally {
      setLoading(false);
    }
  }, [token, addLog]);

  const handleTest        = useCallback(() => call(telegramService.test,         setLoadingTest,    "Test de conexión"),  [call]);
  const handleAlertaStock = useCallback(() => call(telegramService.alertasStock, setLoadingStock,   "Alertas de stock"),  [call]);
  const handleResumenHoy  = useCallback(() => call(telegramService.resumenHoy,   setLoadingResumen, "Resumen del día"),   [call]);

  const handleMensaje = useCallback(async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;
    setLoadingMsg(true);
    try {
      const res = await telegramService.mensaje(mensaje, token);
      if (res?.ok !== false) {
        addLog(`Mensaje enviado: "${mensaje.slice(0, 40)}${mensaje.length > 40 ? "..." : ""}"`, "ok");
        setMensaje("");
      } else {
        addLog("Error al enviar mensaje", "err");
      }
    } catch (e) {
      addLog(e.message, "err");
    } finally {
      setLoadingMsg(false);
    }
  }, [mensaje, token, addLog]);

  return {
    loadingTest, loadingStock, loadingResumen, loadingMsg,
    mensaje, setMensaje, estado, logs, setLogs,
    handleTest, handleAlertaStock, handleResumenHoy, handleMensaje,
  };
}
