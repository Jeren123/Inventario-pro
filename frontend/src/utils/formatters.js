/**
 * Utilidades de formato — puras, sin efectos secundarios, testeables.
 */

/** Formatea un número como moneda (COP por defecto) */
export function formatCurrency(value, locale = "es-CO", currency = "COP") {
  const num = parseFloat(value) || 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

/** Formatea un número con 2 decimales y símbolo $ */
export function formatPrice(value) {
  return `$${(parseFloat(value) || 0).toFixed(2)}`;
}

/** Formatea fecha ISO a legible en español */
export function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("es", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

/** Formatea número abreviado (1200 → 1.2k) */
export function formatShort(value) {
  const n = parseFloat(value) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
