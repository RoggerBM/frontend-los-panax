/** Mensajes del registro del escaneo de identidad según el % de avance. */
export const SCAN_STEPS = [
  { at: 0, level: 'info', text: () => 'Initializing biometric sensor...' },
  { at: 12, level: 'info', text: (u) => `Identity check requested: ${u.crewCode}` },
  { at: 28, level: 'info', text: () => 'Capturing facial mesh (68 landmarks)...' },
  { at: 48, level: 'warn', text: () => 'Compensating cabin lighting...' },
  { at: 64, level: 'info', text: () => 'Checking liveness (blink and micro-motion)...' },
  { at: 80, level: 'info', text: (u) => `Matching crew record: ${u.name}` },
  {
    at: 92,
    level: 'ok',
    text: () => `Biometric match ${(96 + Math.random() * 3.9).toFixed(1)}%`,
  },
  { at: 100, level: 'ok', text: (u) => `Identity verified · clearance ${u.clearance}` },
]

export const SCAN_DURATION_MS = 4500
export const GRANT_DELAY_MS = 1300
