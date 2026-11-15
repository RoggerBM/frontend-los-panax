export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/** Hash entero simple y determinista para derivar datos a partir de un texto. */
export function hashString(text) {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}
