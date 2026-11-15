/**
 * URL del backend FastAPI. En desarrollo usa localhost:8000 si no se define VITE_API_URL.
 * En producción, sin VITE_API_URL, el panel funciona con los escenarios locales.
 */
const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '')).replace(
  /\/$/,
  '',
)

export const isTelemetryApiEnabled = () => Boolean(API_URL)

export const telemetryStreamUrl = (crewId, scenario) =>
  `${API_URL}/telemetry/${encodeURIComponent(crewId)}/stream?scenario=${encodeURIComponent(scenario)}`
