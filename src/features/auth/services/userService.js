import { hashString } from '@/shared/utils/math'
// Ids de las caras generadas con IA: se marcan con "AI generated" en toda la app
import AI_GENERATED from '../../../assets/faces/ai-generated.json'

const AI_IDS = new Set(AI_GENERATED)

/**
 * Cada imagen dentro de src/assets/faces se convierte en un usuario.
 * El nombre se deriva del archivo: "ana-torres.jpg" -> "Ana Torres".
 */
const faceModules = import.meta.glob('../../../assets/faces/*.{png,jpg,jpeg,webp,avif,svg}', {
  eager: true,
  import: 'default',
})

const ROLES = [
  'Mission Commander',
  'Pilot',
  'Mission Specialist',
  'Flight Engineer',
  'Payload Specialist',
]
const CLEARANCES = ['ALPHA', 'BRAVO', 'CHARLIE']

function toTitleCase(slug) {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function buildUser(path, image) {
  const file = path.split('/').pop()
  const id = file.replace(/\.[^.]+$/, '').toLowerCase()
  const h = hashString(id)
  return {
    id,
    name: toTitleCase(id),
    image,
    // Los .svg de la carpeta son marcadores de posición; cualquier otro formato es una foto real
    hasPhoto: !/\.svg$/i.test(file),
    aiGenerated: AI_IDS.has(id),
    role: ROLES[h % ROLES.length],
    clearance: CLEARANCES[h % CLEARANCES.length],
    crewCode: `CRW-${String(h % 10000).padStart(4, '0')}`,
  }
}

const users = Object.entries(faceModules)
  .map(([path, image]) => buildUser(path, image))
  .sort((a, b) => a.name.localeCompare(b.name, 'es'))

export const getUsers = () => users

export const getUserById = (id) => users.find((u) => u.id === id) ?? null
