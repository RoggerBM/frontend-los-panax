/**
 * Cuerpo 3D independiente del framework: humanoide anatómico (malla base MakeHuman, CC0) con traje de vuelo,
 * sombras suaves, controles de órbita y sistemas corporales clicables.
 * Portado a JavaScript desde scene.ts (livorbit body3d). Añade setHalo() para el anillo de estado AEGIS.
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import { BODY_MESH } from './bodyMesh'

function decodeBodyMesh() {
  const bytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer
  const q = new Int16Array(bytes(BODY_MESH.positions))
  const pos = new Float32Array(q.length)
  for (let i = 0; i < q.length; i += 1) pos[i] = (q[i] / 32767) * BODY_MESH.extent
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const ib = bytes(BODY_MESH.indices)
  geo.setIndex(new THREE.BufferAttribute(BODY_MESH.index32 ? new Uint32Array(ib) : new Uint16Array(ib), 1))
  BODY_MESH.groups.forEach((g, i) => geo.addGroup(g.start, g.count, i))
  geo.computeVertexNormals()
  return geo
}

/** Zonas del cuerpo: mind, eyes, heart, lungs, metabolism, immune, muscle, bones. */
const BODY_GREY = 0x9aa1a9
const V = (x, y, z) => new THREE.Vector3(x, y, z)

/** Posición frontal (x, y) en metros de cada marcador (figura ~1,78 m mirando a +z). La z se calcula sobre la superficie. */
const HOTSPOTS = {
  mind: [0, 1.71],
  eyes: [0.033, 1.643],
  heart: [0.055, 1.3],
  lungs: [-0.095, 1.34],
  metabolism: [0, 1.06],
  immune: [-0.43, 1.12],
  muscle: [0.1, 0.66],
  bones: [-0.12, 0.32],
}

/**
 * opts: { name, suitColor, onSelect(id), onHover(id|null, x, y), autoRotate }
 * zonas en setZones: { [id]: { label, color, status: 'NOMINAL'|'CAUTION'|'WARNING'|'NODATA' } }
 */
export function createBody3D(container, opts = {}) {
  const suitColor = opts.suitColor ?? 0x2b56a8
  // ---------- renderer / escena ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  // three r187 retiró PCFSoftShadowMap; PCFShadowMap + shadow.radius da la sombra suave
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.touchAction = 'none'
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50)
  camera.position.set(1.2, 1.35, 3.6)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0.95, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.enablePan = false
  controls.minDistance = 1.4
  controls.maxDistance = 5.5
  controls.minPolarAngle = Math.PI * 0.18
  controls.maxPolarAngle = Math.PI * 0.62
  controls.autoRotate = opts.autoRotate ?? true
  controls.autoRotateSpeed = 1.2
  controls.addEventListener('start', () => {
    controls.autoRotate = false
  })

  // ---------- luces ----------
  scene.add(new THREE.HemisphereLight(0xdfe7f2, 0x2a2f38, 0.9))
  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(2.2, 4, 2.6)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.left = -1.2
  key.shadow.camera.right = 1.2
  key.shadow.camera.top = 2.2
  key.shadow.camera.bottom = -0.4
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 10
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.02
  key.shadow.radius = 4
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x9fd8ff, 1.3)
  rim.position.set(-2.5, 2.5, -3)
  scene.add(rim)
  const fill = new THREE.DirectionalLight(0xffffff, 0.35)
  fill.position.set(-3, 1, 2)
  scene.add(fill)

  // ---------- suelo (solo muestra la sombra) + anillo de estado ----------
  const ground = new THREE.Mesh(new THREE.CircleGeometry(1.4, 64), new THREE.ShadowMaterial({ opacity: 0.38 }))
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x8892a0, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.64, 96), ringMat)
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.002
  scene.add(ring)

  // ---------- cuerpo ----------
  const body = new THREE.Group()
  scene.add(body)
  const pickables = []
  const LAYER_LOOK = {
    skin: {
      color: BODY_GREY,
      dim: 0x7d838b,
      params: { roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.6, sheen: 0.4, sheenRoughness: 0.8, sheenColor: new THREE.Color(0xb8c4d0) },
    },
    suit: {
      color: suitColor,
      dim: new THREE.Color(suitColor).multiplyScalar(0.7).getHex(),
      params: { roughness: 0.62, sheen: 0.8, sheenRoughness: 0.45, sheenColor: new THREE.Color(0x8fa8e8), side: THREE.DoubleSide },
    },
    boot: { color: 0x1f1f22, dim: 0x18181a, params: { roughness: 0.62, clearcoat: 0.35, clearcoatRoughness: 0.55 } },
    sole: { color: 0x2a2a2d, dim: 0x202022, params: { roughness: 0.9 } },
    under: { color: 0x14224a, dim: 0x0f1a38, params: { roughness: 0.8 } },
    zip: { color: 0x16244a, dim: 0x111c3a, params: { roughness: 0.35, metalness: 0.5, side: THREE.DoubleSide } },
    lace: { color: 0x050506, dim: 0x050506, params: { roughness: 0.95, side: THREE.DoubleSide } },
  }
  /** Un material por (capa, zona) para resaltar un sistema entero en piel y ropa. */
  const zoneMaterials = []
  const mat = (zone, layer) => {
    let e = zoneMaterials.find((x) => x.zone === zone && x.layer === layer)
    if (!e) {
      const look = LAYER_LOOK[layer]
      e = {
        zone,
        layer,
        m: new THREE.MeshPhysicalMaterial({ color: zone === 'eyes' ? 0xc9ced4 : look.color, metalness: 0, emissive: 0x000000, ...look.params }),
      }
      zoneMaterials.push(e)
    }
    return e.m
  }

  const geo = decodeBodyMesh()
  const order = BODY_MESH.groups.map((g) => g.zone)
  const bodyMesh = new THREE.Mesh(
    geo,
    BODY_MESH.groups.map((g) => mat(g.zone, g.layer)),
  )
  bodyMesh.castShadow = true
  bodyMesh.receiveShadow = true
  body.add(bodyMesh)
  pickables.push(bodyMesh)

  // ---------- placa con el nombre en el pecho ----------
  const tagCanvas = document.createElement('canvas')
  tagCanvas.width = 512
  tagCanvas.height = 160
  const tagTex = new THREE.CanvasTexture(tagCanvas)
  tagTex.colorSpace = THREE.SRGBColorSpace
  tagTex.anisotropy = 8
  const tagMat = new THREE.MeshStandardMaterial({
    map: tagTex,
    transparent: true,
    roughness: 0.7,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    depthWrite: false,
  })
  let tagMesh = null
  const drawTag = (text) => {
    const c = tagCanvas.getContext('2d')
    const W = tagCanvas.width
    const H = tagCanvas.height
    const r = 22
    c.clearRect(0, 0, W, H)
    c.beginPath()
    c.roundRect(6, 6, W - 12, H - 12, r)
    c.fillStyle = '#0b1631'
    c.fill()
    c.lineWidth = 8
    c.strokeStyle = '#e9eef7'
    c.stroke()
    c.beginPath()
    c.roundRect(20, 20, W - 40, H - 40, r - 10)
    c.lineWidth = 3
    c.strokeStyle = '#f2c94c'
    c.stroke()
    c.fillStyle = '#ffffff'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    let size = 78
    c.font = `800 ${size}px Arial, Helvetica, sans-serif`
    while (c.measureText(text).width > W - 80 && size > 30) {
      size -= 4
      c.font = `800 ${size}px Arial, Helvetica, sans-serif`
    }
    c.fillText(text.toUpperCase(), W / 2, H / 2 + 4)
    tagTex.needsUpdate = true
  }
  const placeTag = () => {
    const ray0 = new THREE.Raycaster(V(0.075, 1.35, 3), V(0, 0, -1))
    const hit = ray0.intersectObject(bodyMesh, false)[0]
    if (!hit) return
    const n = hit.face.normal.clone()
    const orient = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), n))
    const dg = new DecalGeometry(bodyMesh, hit.point, orient, V(0.125, 0.04, 0.04))
    tagMesh = new THREE.Mesh(dg, tagMat)
    tagMesh.renderOrder = 2
    tagMesh.receiveShadow = true
    scene.add(tagMesh)
  }

  // ---------- marcadores ----------
  const hotspotGroup = new THREE.Group()
  scene.add(hotspotGroup)
  const hotspots = new Map()
  const snapRay = new THREE.Raycaster()
  bodyMesh.updateMatrixWorld(true)
  const surfacePoint = ([x, y]) => {
    for (const dx of [0, 0.02, -0.02, 0.04, -0.04, 0.07, -0.07]) {
      snapRay.set(V(x + dx, y, 3), V(0, 0, -1))
      const hit = snapRay.intersectObject(bodyMesh, false)[0]
      if (hit) return hit.point.add(hit.face.normal.clone().multiplyScalar(0.014))
    }
    return V(x, y, 0.15)
  }
  const HOT_POS = {}
  for (const [id, xy] of Object.entries(HOTSPOTS)) HOT_POS[id] = surfacePoint(xy)
  for (const [id, pos] of Object.entries(HOT_POS)) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.014, 20, 14), new THREE.MeshBasicMaterial({ color: 0x5ee6a8, transparent: true }))
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 20, 14),
      new THREE.MeshBasicMaterial({ color: 0x5ee6a8, transparent: true, opacity: 0.3, depthWrite: false }),
    )
    dot.position.copy(pos)
    halo.position.copy(pos)
    dot.renderOrder = 11
    halo.renderOrder = 10
    dot.userData.zone = id
    halo.userData.zone = id
    hotspotGroup.add(halo, dot)
    pickables.push(halo)
    hotspots.set(id, { dot, halo })
  }

  // ---------- estado ----------
  let info = {}
  let selected = null
  let hovered = null
  const tmpColor = new THREE.Color()

  const applyLook = () => {
    for (const { zone: id, layer, m } of zoneMaterials) {
      const c = info[id]?.color ?? '#5ee6a8'
      tmpColor.set(c)
      const sel = id === selected || (selected === 'heart' && id === 'lungs')
      if (sel) {
        m.emissive.copy(tmpColor)
        m.emissiveIntensity = layer === 'skin' ? 0.3 : 0.45
      } else if (id === hovered) {
        m.emissive.copy(tmpColor)
        m.emissiveIntensity = 0.18
      } else {
        m.emissive.setHex(0x000000)
      }
      if (id !== 'eyes') m.color.setHex(selected && !sel ? LAYER_LOOK[layer].dim : LAYER_LOOK[layer].color)
    }
    for (const [id, h] of hotspots) {
      const c = info[id]?.color ?? '#5ee6a8'
      h.dot.material.color.set(c)
      h.halo.material.color.set(c)
      const dim = selected && id !== selected
      h.dot.material.opacity = dim ? 0.35 : 1
    }
    renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab'
  }

  // ---------- selección con el puntero ----------
  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const pick = (e) => {
    const r = renderer.domElement.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    const hits = ray.intersectObjects(pickables, false)
    // los marcadores ganan a las partes del cuerpo (se dibujan encima)
    const hs = hits.find((h) => hotspotGroup.children.includes(h.object))
    const hit = hs ?? hits[0]
    if (!hit) return null
    if (hit.object === bodyMesh && hit.face) return order[hit.face.materialIndex] ?? null
    return hit.object.userData.zone ?? null
  }
  let down = null
  const onDown = (e) => {
    down = { x: e.clientX, y: e.clientY }
  }
  const onUp = (e) => {
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) {
      // Un toque fuera del cuerpo devuelve null (vista de cuerpo completo)
      opts.onSelect?.(pick(e))
    }
    down = null
  }
  const onMove = (e) => {
    if (e.buttons) return
    const z = pick(e)
    if (z !== hovered) {
      hovered = z
      applyLook()
    }
    const r = renderer.domElement.getBoundingClientRect()
    opts.onHover?.(z, e.clientX - r.left, e.clientY - r.top)
  }
  const onLeave = () => {
    hovered = null
    applyLook()
    opts.onHover?.(null, 0, 0)
  }
  renderer.domElement.addEventListener('pointerdown', onDown)
  renderer.domElement.addEventListener('pointerup', onUp)
  renderer.domElement.addEventListener('pointermove', onMove)
  renderer.domElement.addEventListener('pointerleave', onLeave)

  // ---------- enfoque de cámara ----------
  const defaultTarget = V(0, 0.95, 0)
  const goalTarget = defaultTarget.clone()
  let goalDist = null

  // ---------- tamaño y bucle ----------
  const resize = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  resize()

  const timer = new THREE.Timer()
  let raf = 0
  const tick = () => {
    raf = requestAnimationFrame(tick)
    timer.update()
    const t = timer.getElapsed()
    controls.target.lerp(goalTarget, 0.08)
    if (goalDist !== null) {
      const d = camera.position.distanceTo(controls.target)
      const nd = THREE.MathUtils.lerp(d, goalDist, 0.08)
      camera.position.sub(controls.target).setLength(nd).add(controls.target)
      if (Math.abs(nd - goalDist) < 0.005) goalDist = null
    }
    for (const [id, h] of hotspots) {
      const st = info[id]?.status
      const speed = st === 'WARNING' ? 6 : st === 'CAUTION' ? 3.5 : 2
      const amp = id === selected ? 0.6 : st === 'WARNING' ? 0.55 : 0.3
      const k = 1 + amp * (0.5 + 0.5 * Math.sin(t * speed + h.dot.position.y * 7))
      h.halo.scale.setScalar(k * (id === selected ? 1.25 : 1))
    }
    controls.update()
    renderer.render(scene, camera)
  }
  tick()
  applyLook()
  drawTag(opts.name ?? '')
  placeTag()
  if (tagMesh) tagMesh.visible = !!opts.name

  return {
    /** Lienzo WebGL (para ajustar su posición/capa desde fuera). */
    canvas: renderer.domElement,
    setZones(next) {
      info = next
      applyLook()
    },
    setSelected(id) {
      selected = id
      if (id) {
        goalTarget.set(0, THREE.MathUtils.clamp(HOT_POS[id].y, 0.55, 1.5), 0)
        goalDist = 3.0
      } else {
        goalTarget.copy(defaultTarget)
        goalDist = 3.9
      }
      applyLook()
    },
    /** Nombre en la placa del pecho. */
    setName(text) {
      drawTag(text)
      if (tagMesh) tagMesh.visible = !!text
    },
    /** Anillo del suelo con el color del estado general (estilo AEGIS). */
    setHalo(color) {
      ringMat.color.set(color)
      ringMat.opacity = 0.75
    },
    focus(target, distance) {
      controls.autoRotate = false
      goalTarget.set(...target)
      goalDist = distance
    },
    resetView() {
      controls.autoRotate = true
      goalTarget.copy(defaultTarget)
      goalDist = 3.9
    },
    dispose() {
      cancelAnimationFrame(raf)
      timer.dispose()
      ro.disconnect()
      controls.dispose()
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointerup', onUp)
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('pointerleave', onLeave)
      renderer.domElement.remove()
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        const mm = o.material
        if (Array.isArray(mm)) mm.forEach((x) => x.dispose())
        else mm?.dispose()
      })
      tagTex.dispose()
      renderer.dispose()
    },
  }
}
