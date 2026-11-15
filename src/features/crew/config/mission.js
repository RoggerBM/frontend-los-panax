/** Inicio de la misión simulada: de aquí sale el "día N en el espacio". */
export const MISSION_START = new Date('2026-10-04T00:00:00')

export const missionDay = (now = new Date()) => Math.max(1, Math.floor((now - MISSION_START) / 86400000))

/** Límite de dosis de carrera de NASA (mSv). */
export const CAREER_LIMIT_MSV = 600
