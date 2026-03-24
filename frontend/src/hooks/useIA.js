import { useState, useEffect, useRef, useCallback } from "react";
import { productService }  from "../services/productService";
import { reportesService } from "../services/reportesService";

const WELCOME = {
  role: "assistant",
  content:
    "¡Hola! Soy tu asistente de inventario con IA.\n\nPuedo ayudarte a analizar tu inventario, sugerir estrategias, identificar productos con bajo stock y mucho más. ¿En qué te ayudo?",
};

export function useIA(token) {
  const [messages,  setMessages]  = useState([WELCOME]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [productos, setProductos] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    productService.getAll(token)
      .then(setProductos)
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContext = useCallback(() => {
    if (!productos.length) return "No hay productos.";
    const resumen    = productos.map((p) => `- ${p.nombre}: stock=${p.stock_actual}, mínimo=${p.stock_minimo}, precio_venta=$${p.precio_venta}`).join("\n");
    const valorTotal = productos.reduce((s, p) => s + parseFloat(p.precio_venta) * p.stock_actual, 0);
    const bajo       = productos.filter((p) => p.stock_actual <= p.stock_minimo);
    return `INVENTARIO (${productos.length} productos, valor: $${valorTotal.toFixed(2)}):\n${resumen}\nSTOCK BAJO: ${bajo.map((p) => p.nombre).join(", ") || "ninguno"}`;
  }, [productos]);

  const sendMessage = useCallback(async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const historial = newMessages.slice(1, -1).map((m) => ({ role: m.role, content: m.content }));
      const res = await reportesService.getIaChat(
        { messages: [...historial, { role: "user", content: msg }], contexto_inventario: buildContext() },
        token
      );
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Error al conectar con la IA. Verifica la configuración del servidor." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, token, buildContext]);

  const sugerencias = [
    "¿Qué productos tienen stock bajo?",
    "¿Cuáles son los más rentables?",
    "Analiza el valor del inventario",
    "¿Qué debo reabastecer pronto?",
  ];

  return { messages, input, setInput, loading, endRef, sendMessage, sugerencias, productos };
}
