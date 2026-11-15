/**
 * Motor 3D volumétrico sin dependencias (canvas 2D + painter's algorithm).
 * Dibuja el astronauta EVA, el núcleo cardíaco o la esfera de riesgo.
 */
import { COLORS, rgba } from '../config/colors'

const { brand: BRAND, soft: SOFT, amber: AMBER, red: RED, paper: PAPER } = COLORS

// ---------- Geometría ----------

function rotPoint(x, y, z, rx, ry) {
  const cy = Math.cos(ry)
  const sy = Math.sin(ry)
  const x1 = x * cy + z * sy
  const z1 = -x * sy + z * cy
  const cx = Math.cos(rx)
  const sx = Math.sin(rx)
  return { x: x1, y: y * cx - z1 * sx, z: y * sx + z1 * cx }
}

function project(p, w, h, fov = 420) {
  const scale = fov / (4.6 + p.z)
  return { x: w * 0.5 + p.x * scale, y: h * 0.52 + p.y * scale, z: p.z, scale }
}

function addBox(polys, cx, cy, cz, sx, sy, sz, fill, stroke, rotZ = 0) {
  const hx = sx / 2
  const hy = sy / 2
  const hz = sz / 2
  const raw = [
    [-hx, -hy, -hz], [hx, -hy, -hz], [hx, hy, -hz], [-hx, hy, -hz],
    [-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz],
  ]
  const c = Math.cos(rotZ)
  const s = Math.sin(rotZ)
  const v = raw.map(([px, py, pz]) => [cx + px * c - py * s, cy + px * s + py * c, cz + pz])
  const faces = [[0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [4, 5, 1, 0], [3, 2, 6, 7]]
  faces.forEach((f) => polys.push({ pts: f.map((i) => v[i]), fill, stroke }))
}

function addCylinder(polys, cx, cy, cz, rTop, rBot, h, segs, fill, stroke, tiltZ = 0, tiltX = 0) {
  const top = []
  const bot = []
  const ctZ = Math.cos(tiltZ)
  const stZ = Math.sin(tiltZ)
  const ctX = Math.cos(tiltX)
  const stX = Math.sin(tiltX)

  const local = (lx, ly, lz) => {
    const y1 = ly * ctX - lz * stX
    const z1 = ly * stX + lz * ctX
    return [cx + lx * ctZ - y1 * stZ, cy + lx * stZ + y1 * ctZ, cz + z1]
  }

  for (let i = 0; i < segs; i += 1) {
    const a = (i / segs) * Math.PI * 2
    top.push(local(Math.cos(a) * rTop, -h / 2, Math.sin(a) * rTop))
    bot.push(local(Math.cos(a) * rBot, h / 2, Math.sin(a) * rBot))
  }
  for (let i = 0; i < segs; i += 1) {
    const n = (i + 1) % segs
    polys.push({ pts: [top[i], top[n], bot[n], bot[i]], fill, stroke })
  }
  polys.push({ pts: top.slice().reverse(), fill, stroke })
  polys.push({ pts: bot, fill, stroke })
}

function addSphere(polys, cx, cy, cz, rx, ry, rz, rings, segs, fill, stroke, visorFront = false) {
  const grid = []
  for (let r = 0; r <= rings; r += 1) {
    const phi = (r / rings) * Math.PI
    const row = []
    for (let s = 0; s <= segs; s += 1) {
      const theta = (s / segs) * Math.PI * 2
      row.push([
        cx + rx * Math.sin(phi) * Math.cos(theta),
        cy + ry * Math.cos(phi),
        cz + rz * Math.sin(phi) * Math.sin(theta),
      ])
    }
    grid.push(row)
  }
  for (let r = 0; r < rings; r += 1) {
    for (let s = 0; s < segs; s += 1) {
      const quad = [grid[r][s], grid[r][s + 1], grid[r + 1][s + 1], grid[r + 1][s]]
      let f = fill
      let st = stroke
      if (visorFront) {
        const avg = (k) => quad.reduce((acc, p) => acc + p[k], 0) / 4
        if (avg(2) > cz + rz * 0.35 && Math.abs(avg(1) - cy) < ry * 0.45 && Math.abs(avg(0)) < rx * 0.78) {
          f = rgba(SOFT, 0.38)
          st = 'rgba(255, 220, 120, 0.75)'
        }
      }
      polys.push({ pts: quad, fill: f, stroke: st })
    }
  }
}

// ---------- Mallas ----------

function buildAstronaut(b) {
  const p = []
  const suitFill = 'rgba(42, 40, 112, 0.42)'
  const suitStroke = rgba(SOFT, 0.7)
  const jointFill = 'rgba(26, 24, 72, 0.65)'
  const jointStroke = rgba(PAPER, 0.45)
  const packFill = 'rgba(34, 32, 92, 0.55)'

  // Casco + visor + aro de cuello
  addSphere(p, 0, -1.26 + b * 0.4, 0.03, 0.31, 0.33, 0.32, 8, 14, 'rgba(52, 50, 132, 0.48)', suitStroke, true)
  addBox(p, -0.32, -1.26 + b * 0.4, 0.02, 0.07, 0.14, 0.14, jointFill, BRAND)
  addBox(p, 0.32, -1.26 + b * 0.4, 0.02, 0.07, 0.14, 0.14, jointFill, BRAND)
  addCylinder(p, 0, -0.94 + b * 0.4, 0.02, 0.25, 0.28, 0.08, 14, jointFill, SOFT)

  // Mochila de soporte vital (PLSS) + tanques
  addBox(p, 0, -0.44 + b * 0.5, -0.33, 0.62, 0.86, 0.28, packFill, rgba(SOFT, 0.68))
  addCylinder(p, -0.16, -0.44 + b * 0.5, -0.44, 0.09, 0.09, 0.72, 10, jointFill, BRAND)
  addCylinder(p, 0.16, -0.44 + b * 0.5, -0.44, 0.09, 0.09, 0.72, 10, jointFill, BRAND)

  // Torso + módulo de pecho (DCM)
  addCylinder(p, 0, -0.48 + b * 0.5, 0.02, 0.37, 0.31, 0.78, 14, suitFill, suitStroke)
  addBox(p, 0, -0.52 + b * 0.5, 0.27, 0.3, 0.24, 0.11, 'rgba(18, 17, 46, 0.85)', SOFT)

  // Brazos (postura zero-g)
  for (const side of [-1, 1]) {
    addSphere(p, 0.44 * side, -0.74 + b * 0.5, 0, 0.14, 0.14, 0.14, 5, 10, jointFill, jointStroke)
    addCylinder(p, 0.54 * side, -0.46 + b * 0.4, 0.05, 0.12, 0.105, 0.46, 10, suitFill, suitStroke, 0.24 * -side, -0.15)
    addSphere(p, 0.62 * side, -0.22 + b * 0.3, 0.11, 0.1, 0.1, 0.1, 4, 8, jointFill, jointStroke)
    addCylinder(p, 0.57 * side, 0.02 + b * 0.2, 0.24, 0.1, 0.085, 0.42, 10, suitFill, suitStroke, 0.22 * side, -0.52)
    addSphere(p, 0.51 * side, 0.24 + b * 0.2, 0.36, 0.085, 0.1, 0.075, 4, 8, jointFill, SOFT)
  }

  // Cadera
  addCylinder(p, 0, -0.02, 0.01, 0.31, 0.29, 0.2, 14, jointFill, jointStroke)

  // Piernas + botas
  addCylinder(p, -0.18, 0.34, 0.04, 0.145, 0.125, 0.54, 10, suitFill, suitStroke, 0.06, -0.12)
  addSphere(p, -0.2, 0.63, 0.08, 0.115, 0.11, 0.115, 4, 8, jointFill, jointStroke)
  addCylinder(p, -0.21, 0.94, 0.03, 0.12, 0.105, 0.54, 10, suitFill, suitStroke, 0.03, 0.14)
  addBox(p, -0.22, 1.24, 0.09, 0.2, 0.14, 0.34, jointFill, SOFT)

  addCylinder(p, 0.18, 0.34, -0.02, 0.145, 0.125, 0.54, 10, suitFill, suitStroke, -0.06, 0.08)
  addSphere(p, 0.2, 0.63, -0.06, 0.115, 0.11, 0.115, 4, 8, jointFill, jointStroke)
  addCylinder(p, 0.21, 0.94, -0.02, 0.12, 0.105, 0.54, 10, suitFill, suitStroke, -0.03, -0.08)
  addBox(p, 0.22, 1.24, 0.05, 0.2, 0.14, 0.34, jointFill, SOFT)

  return p
}

function buildHeart(k) {
  const p = []
  addSphere(p, -0.14, -0.05, 0, 0.42 * k, 0.52 * k, 0.4 * k, 8, 14, rgba(RED, 0.32), RED)
  addSphere(p, 0.16, 0.05, 0.04, 0.38 * k, 0.56 * k, 0.36 * k, 8, 14, rgba(SOFT, 0.28), SOFT)
  addCylinder(p, -0.05, -0.62, 0, 0.11, 0.13, 0.48, 10, rgba(SOFT, 0.4), BRAND, -0.25, 0)
  addCylinder(p, 0.18, -0.58, -0.05, 0.09, 0.11, 0.44, 10, rgba(BRAND, 0.38), SOFT, 0.28, 0)
  return p
}

function buildHazard(t) {
  const p = []
  const r = 0.42 + Math.sin(t * 3) * 0.04
  addSphere(p, 0, 0, 0, 0.85, 0.85, 0.85, 7, 14, rgba(SOFT, 0.1), rgba(SOFT, 0.45))
  addSphere(p, 0, 0, 0, r, r, 0.42, 6, 10, rgba(BRAND, 0.28), BRAND)
  addBox(p, 0, 0, 0, 1.55, 0.04, 0.04, rgba(SOFT, 0.5), SOFT)
  addBox(p, 0, 0, 0, 0.04, 1.55, 0.04, rgba(BRAND, 0.5), BRAND)
  addBox(p, 0, 0, 0, 0.04, 0.04, 1.55, rgba(AMBER, 0.5), AMBER)
  return p
}

// ---------- Render ----------

export function createHoloState() {
  return { rotX: 0.08, rotY: 0.35, autoRotate: true, scanPhase: 0, heartbeatPhase: 0, mode: 'astronaut', accent: BRAND }
}

/** Dibuja un frame. `s` es un objeto mutable creado con createHoloState(). */
export function drawHoloFrame(ctx, w, h, s) {
  if (s.autoRotate) s.rotY += 0.0065
  s.scanPhase += 0.025
  s.heartbeatPhase += 0.075

  const P = (x, y, z) => project(rotPoint(x, y, z, s.rotX, s.rotY), w, h)

  // 1. Esfera orbital de referencia
  const R = 1.48
  ctx.lineWidth = 1
  ctx.strokeStyle = rgba(SOFT, 0.12)
  for (let lat = -2; lat <= 2; lat += 1) {
    const y = (lat / 3) * R
    const r = Math.sqrt(Math.max(0.01, R * R - y * y))
    ctx.beginPath()
    for (let i = 0; i <= 48; i += 1) {
      const a = (i / 48) * Math.PI * 2
      const pt = P(Math.cos(a) * r, y, Math.sin(a) * r)
      if (i === 0) ctx.moveTo(pt.x, pt.y)
      else ctx.lineTo(pt.x, pt.y)
    }
    ctx.stroke()
  }
  for (let lon = 0; lon < 6; lon += 1) {
    const ang = (lon / 6) * Math.PI
    ctx.beginPath()
    for (let i = 0; i <= 48; i += 1) {
      const a = (i / 48) * Math.PI * 2
      const pt = P(Math.cos(a) * R * Math.cos(ang), Math.sin(a) * R, Math.cos(a) * R * Math.sin(ang))
      if (i === 0) ctx.moveTo(pt.x, pt.y)
      else ctx.lineTo(pt.x, pt.y)
    }
    ctx.stroke()
  }

  // 2. Malla activa
  const breath = Math.sin(s.scanPhase * 0.9) * 0.025
  const pulse = 1 + Math.max(0, Math.sin(s.heartbeatPhase)) ** 6 * 0.12
  const polys =
    s.mode === 'heart' ? buildHeart(pulse) : s.mode === 'hazard' ? buildHazard(s.scanPhase) : buildAstronaut(breath)

  const projected = polys.map((poly) => {
    const t = poly.pts.map((pt) => rotPoint(pt[0], pt[1], pt[2], s.rotX, s.rotY))
    return {
      pts: t.map((pt) => project(pt, w, h)),
      z: t.reduce((acc, pt) => acc + pt.z, 0) / t.length,
      fill: poly.fill,
      stroke: poly.stroke,
    }
  })
  projected.sort((a, b) => b.z - a.z)

  ctx.lineWidth = 0.85
  for (const poly of projected) {
    ctx.beginPath()
    poly.pts.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)))
    ctx.closePath()
    ctx.fillStyle = poly.fill
    ctx.fill()
    ctx.strokeStyle = poly.stroke
    ctx.stroke()
  }

  // 3. Láser de escaneo
  const scanY = Math.sin(s.scanPhase) * 1.25
  const a = P(-0.85, scanY, 0.45)
  const b = P(0.85, scanY, 0.45)
  const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
  grad.addColorStop(0, rgba(BRAND, 0))
  grad.addColorStop(0.5, s.accent)
  grad.addColorStop(1, rgba(BRAND, 0))
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.strokeStyle = grad
  ctx.lineWidth = 2
  ctx.stroke()

  // 4. Nodos biométricos + líneas guía hacia las etiquetas
  if (s.mode === 'astronaut') {
    const nodes = [
      { pos: [-0.08, -1.24, 0.3], label: [w * 0.24, 48], color: SOFT },
      { pos: [0.22, -0.52, -0.25], label: [w * 0.76, 48], color: s.accent },
      { pos: [-0.06, -0.52, 0.34], label: [w * 0.24, h - 55], color: BRAND },
      { pos: [0.12, -0.1, 0.31], label: [w * 0.76, h - 55], color: SOFT },
    ]
    const ring = 5 + Math.sin(s.scanPhase * 2) * 2
    for (const n of nodes) {
      const pt = P(...n.pos)
      ctx.beginPath()
      ctx.moveTo(pt.x, pt.y)
      ctx.lineTo(n.label[0], n.label[1])
      ctx.strokeStyle = rgba(SOFT, 0.34)
      ctx.setLineDash([3, 3])
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.setLineDash([])

      ctx.beginPath()
      ctx.arc(pt.x, pt.y, ring, 0, Math.PI * 2)
      ctx.strokeStyle = n.color
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = PAPER
      ctx.fill()
    }
  }
}
