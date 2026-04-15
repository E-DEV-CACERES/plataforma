/**
 * Convierte segundos a formato legible: "2h 30m" o "45m" o "1h"
 * @param {number} totalSeconds - Duración total en segundos
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  const total = Number(totalSeconds) || 0;
  if (total <= 0) return '—';

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(' ') : '< 1m';
}

const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/**
 * Formatea una fecha a "abril de 2023"
 * @param {string|Date} date
 * @returns {string}
 */
export function formatLastUpdated(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return `${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`;
}
