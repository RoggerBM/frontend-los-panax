/** Mensajes que aparecen en el registro según el % de avance del escaneo. */
export const SCAN_STEPS = [
  { at: 0, level: 'info', text: () => 'Inicializando enlace con estación terrena...' },
  { at: 10, level: 'info', text: () => 'Señal adquirida · banda S 2.287 GHz' },
  { at: 22, level: 'info', text: (u) => `Solicitud de acceso recibida: ${u.crewCode}` },
  { at: 34, level: 'info', text: () => 'Capturando malla facial (68 puntos de referencia)...' },
  { at: 50, level: 'warn', text: () => 'Compensando latencia del enlace (+212 ms)' },
  { at: 62, level: 'info', text: () => 'Verificando signos vitales del operador...' },
  { at: 78, level: 'info', text: (u) => `Comparando con registro de tripulación: ${u.name}` },
  {
    at: 92,
    level: 'ok',
    text: () => `Coincidencia biométrica ${(96 + Math.random() * 3.9).toFixed(1)}%`,
  },
  { at: 100, level: 'ok', text: (u) => `Acceso concedido · autorización ${u.clearance}` },
]

export const SCAN_DURATION_MS = 4500
export const GRANT_DELAY_MS = 1300
