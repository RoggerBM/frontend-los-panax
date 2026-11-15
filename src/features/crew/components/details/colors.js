import { statusOf } from '../../config/status'

/** Color de relleno (hex) y de texto (fg) por nivel: -1 sensor · 0 ok · 1 precaución · 2 alerta */
export const fill = (level) => statusOf(level).hex
export const ink = (level) => statusOf(level).fg
