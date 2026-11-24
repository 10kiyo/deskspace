export type ZoneType = 'focus' | 'meeting' | 'lounge' | 'hallway'
export type HairStyle = 'spiky' | 'bob' | 'cap'

export interface FurnitureItem {
  id: string
  type:
    | 'desk_pc'
    | 'meeting_table'
    | 'sofa'
    | 'pingpong'
    | 'bookshelf'
    | 'plant'
    | 'aquarium'
    | 'coffee_bar'
    | 'rug_purple'
    | 'rug_gray'
  gx: number
  gy: number
  gw: number
  gh: number
  walkable?: boolean
  sittable?: boolean
  label?: string
}

export interface PeerUser {
  id: string
  name: string
  role: string
  color: string
  hairColor: string
  hairStyle: HairStyle
  gx: number
  gy: number
  status: 'Active' | 'In Meeting' | 'Focusing' | 'Coffee Break'
  isSitting?: boolean
  chatBubble?: string
  isBot?: boolean
  schedule?: { time: string; title: string }[]
}

export const GRID_COLS = 22
export const GRID_ROWS = 15

export function getZoneAt(gx: number, gy: number): ZoneType {
  if (gx >= 2 && gx <= 6 && gy >= 1 && gy <= 12) return 'meeting'
  if (gx >= 9 && gx <= 13 && gy >= 9 && gy <= 12) return 'lounge'
  if (
    (gx >= 9 && gx <= 14 && gy >= 3 && gy <= 6) ||
    (gx >= 15 && gx <= 19 && gy >= 8 && gy <= 12)
  ) {
    return 'focus'
  }
  return 'hallway'
}

export const FURNITURE: FurnitureItem[] = [
  // Karpet Zona
  { id: 'rug-prod', type: 'rug_gray', gx: 9, gy: 3, gw: 6, gh: 4, walkable: true, label: 'Product team' },
  { id: 'rug-cx', type: 'rug_gray', gx: 15, gy: 8, gw: 5, gh: 5, walkable: true, label: 'CX team' },
  { id: 'rug-lounge', type: 'rug_purple', gx: 9, gy: 9, gw: 5, gh: 4, walkable: true, label: 'Lounge' },

  // Meeting Room Kiri
  { id: 'mt-top', type: 'meeting_table', gx: 3, gy: 2, gw: 3, gh: 1 },
  { id: 'cf-1', type: 'coffee_bar', gx: 2, gy: 5, gw: 2, gh: 1, label: 'Espresso [E]' },
  { id: 'mt-mid', type: 'meeting_table', gx: 3, gy: 7, gw: 2, gh: 1 },
  { id: 'bk-1', type: 'bookshelf', gx: 2, gy: 9, gw: 2, gh: 1 },
  { id: 'mt-bot', type: 'meeting_table', gx: 3, gy: 11, gw: 2, gh: 1 },

  // Dekorasi Lorong
  { id: 'aq-1', type: 'aquarium', gx: 8, gy: 1, gw: 2, gh: 1 },

  // Product Team Desks
  { id: 'dk-p1', type: 'desk_pc', gx: 9, gy: 3, gw: 2, gh: 1 },
  { id: 'dk-p2', type: 'desk_pc', gx: 12, gy: 3, gw: 2, gh: 1 },
  { id: 'dk-p3', type: 'desk_pc', gx: 9, gy: 6, gw: 2, gh: 1 },
  { id: 'dk-p4', type: 'desk_pc', gx: 12, gy: 6, gw: 2, gh: 1 },

  // Lounge (Ping Pong & Sofa yang bisa diduduki)
  { id: 'pp-1', type: 'pingpong', gx: 9, gy: 11, gw: 1, gh: 2 },
  { id: 'sf-1', type: 'sofa', gx: 11, gy: 9, gw: 2, gh: 1, walkable: true, sittable: true },
  { id: 'sf-2', type: 'sofa', gx: 11, gy: 12, gw: 2, gh: 1, walkable: true, sittable: true },

  // CX Team Desks
  { id: 'dk-c1', type: 'desk_pc', gx: 16, gy: 8, gw: 2, gh: 1 },
  { id: 'dk-c2', type: 'desk_pc', gx: 16, gy: 11, gw: 2, gh: 1 },

  // Tanaman Hias
  { id: 'pl-1', type: 'plant', gx: 14, gy: 4, gw: 1, gh: 1 },
  { id: 'pl-2', type: 'plant', gx: 13, gy: 9, gw: 1, gh: 1 },
  { id: 'pl-3', type: 'plant', gx: 10, gy: 12, gw: 1, gh: 1 },
]

// Cek apakah pemain sedang duduk (di atas sofa atau tepat di kursi depan komputer)
export function checkIsSitting(gx: number, gy: number): boolean {
  const rx = Math.round(gx)
  const ry = Math.round(gy)

  // Di atas sofa
  const onSofa = FURNITURE.some(
    (f) =>
      f.sittable &&
      rx >= f.gx &&
      rx < f.gx + f.gw &&
      ry >= f.gy &&
      ry < f.gy + f.gh
  )
  if (onSofa) return true

  // Tepat di kursi kerja (1 petak di bawah meja desk_pc)
  const atDeskChair = FURNITURE.some(
    (f) =>
      f.type === 'desk_pc' &&
      rx >= f.gx &&
      rx < f.gx + f.gw &&
      ry === f.gy + 1
  )
  return atDeskChair
}

export function isWall(gx: number, gy: number): boolean {
  if (gx < 2) return false
  if (gy === 0 && gx >= 2) return true
  if (gy === GRID_ROWS - 1 && gx >= 2) return true
  if (gx === 2 && gy >= 0) return true
  if (gx === GRID_COLS - 1 && gy >= 0) return true

  if (gx === 6 && ![3, 6, 10].includes(gy)) return true
  if (gy === 4 && gx >= 2 && gx <= 6) return true
  if (gy === 8 && gx >= 2 && gx <= 6) return true

  return false
}

export function isWalkable(gx: number, gy: number): boolean {
  if (gx < 2 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return false
  if (isWall(gx, gy)) return false

  for (const f of FURNITURE) {
    if (f.walkable) continue
    if (gx >= f.gx && gx < f.gx + f.gw && gy >= f.gy && gy < f.gy + f.gh) {
      return false
    }
  }
  return true
}

export function findPath(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number
): { gx: number; gy: number }[] {
  const sx = Math.round(startX)
  const sy = Math.round(startY)
  if (!isWalkable(targetX, targetY)) return []
  if (sx === targetX && sy === targetY) return []

  const queue: { gx: number; gy: number; path: { gx: number; gy: number }[] }[] = [
    { gx: sx, gy: sy, path: [] },
  ]
  const visited = new Set<string>([`${sx},${sy}`])
  const dirs = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ]

  while (queue.length > 0) {
    const curr = queue.shift()!
    for (const d of dirs) {
      const nx = curr.gx + d.dx
      const ny = curr.gy + d.dy
      const key = `${nx},${ny}`
      if (!visited.has(key) && isWalkable(nx, ny)) {
        const nextPath = [...curr.path, { gx: nx, gy: ny }]
        if (nx === targetX && ny === targetY) return nextPath
        visited.add(key)
        queue.push({ gx: nx, gy: ny, path: nextPath })
      }
    }
  }
  return []
}

export const BOT_PEERS: PeerUser[] = [
  {
    id: 'bot-som',
    name: 'Som',
    role: 'Product Lead',
    color: '#6366f1',
    hairColor: '#1e293b',
    hairStyle: 'spiky',
    gx: 10,
    gy: 4,
    status: 'Focusing',
    isSitting: true,
    isBot: true,
    schedule: [{ time: '2:00 - 3:00 pm', title: 'Design Crit' }],
  },
  {
    id: 'bot-steven',
    name: 'Steven',
    role: 'Product Designer',
    color: '#f59e0b',
    hairColor: '#78350f',
    hairStyle: 'cap',
    gx: 4,
    gy: 6,
    status: 'In Meeting',
    chatBubble: '•••',
    isBot: true,
    schedule: [{ time: '1:00 - 2:30 pm', title: 'User Research' }],
  },
  {
    id: 'bot-nina',
    name: 'Nina',
    role: 'CX Specialist',
    color: '#ec4899',
    hairColor: '#be185d',
    hairStyle: 'bob',
    gx: 17,
    gy: 9,
    status: 'Focusing',
    isSitting: true,
    isBot: true,
    schedule: [{ time: '4:00 - 4:30 pm', title: 'Customer Feedback' }],
  },
]
