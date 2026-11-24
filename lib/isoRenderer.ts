import { FurnitureItem } from './officeMap'

export const TILE_SIZE = 44

export function drawTopDownFloor(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  originX: number,
  originY: number
) {
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const sx = originX + gx * TILE_SIZE
      const sy = originY + gy * TILE_SIZE

      // 1. Taman Rumput Luar Gedung (Kolom 0..1)
      if (gx < 2) {
        ctx.fillStyle = '#a7f3d0'
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE)
        ctx.fillStyle = '#6ee7b7'
        ctx.fillRect(sx + 8, sy + 10, 4, 4)
        ctx.fillRect(sx + 28, sy + 26, 4, 4)
        continue
      }

      // 2. Lantai Ruang Rapat Kiri (Karpet Motif Ungu Lembut)
      if (gx >= 2 && gx <= 6 && gy >= 1 && gy <= 12) {
        ctx.fillStyle = '#e0e7ff'
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE)
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.22)'
        ctx.lineWidth = 1
        ctx.strokeRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8)
        continue
      }

      // 3. Lantai Utama: Papan Kayu Krem Hangat
      ctx.fillStyle = '#f5e6d3'
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE)

      ctx.fillStyle = '#ebd5b8'
      ctx.fillRect(sx, sy + TILE_SIZE / 2 - 1, TILE_SIZE, 2)
      ctx.fillRect(sx, sy + TILE_SIZE - 1, TILE_SIZE, 1.5)

      ctx.fillStyle = '#dfc39d'
      const jointX = gy % 2 === 0 ? sx + TILE_SIZE * 0.5 : sx + 4
      ctx.fillRect(jointX, sy, 1.5, TILE_SIZE / 2)
    }
  }

  // Pepohonan Rimba di Taman Kiri
  const treeRows = [2, 6, 10]
  treeRows.forEach((ty) => {
    const tx = originX + TILE_SIZE * 0.95
    const py = originY + ty * TILE_SIZE + 12

    ctx.fillStyle = 'rgba(22, 101, 52, 0.18)'
    ctx.beginPath()
    ctx.ellipse(tx, py + 24, 24, 9, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#78350f'
    ctx.fillRect(tx - 6, py + 10, 12, 16)
    ctx.fillStyle = '#92400e'
    ctx.fillRect(tx - 3, py + 10, 4, 16)

    ctx.fillStyle = '#15803d'
    ctx.beginPath()
    ctx.arc(tx, py + 2, 24, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.arc(tx - 4, py - 4, 20, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#4ade80'
    ctx.beginPath()
    ctx.arc(tx - 8, py - 9, 12, 0, Math.PI * 2)
    ctx.fill()
  })
}

export function drawTopDownWall(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  originX: number,
  originY: number
) {
  const sx = originX + gx * TILE_SIZE
  const sy = originY + gy * TILE_SIZE

  const isTopInterior = gy === 0 && gx >= 3 && gx <= 20
  const topFace = isTopInterior ? '#a5b4fc' : '#cbd5e1'
  const frontFace = isTopInterior ? '#6366f1' : '#64748b'

  ctx.fillStyle = frontFace
  ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE)

  ctx.fillStyle = topFace
  ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE * 0.45)

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE)

  if (gy === 0 && gx === 11) {
    ctx.fillStyle = '#fef3c7'
    ctx.fillRect(sx + 8, sy + 21, TILE_SIZE - 16, 18)
    ctx.strokeStyle = '#78350f'
    ctx.lineWidth = 2
    ctx.strokeRect(sx + 8, sy + 21, TILE_SIZE - 16, 18)
    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.arc(sx + 22, sy + 30, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  if (gy === 14 && (gx === 3 || gx === 4)) {
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(sx + 4, sy + 18, TILE_SIZE - 8, 20)
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2
    ctx.strokeRect(sx + 4, sy + 18, TILE_SIZE - 8, 20)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillRect(sx + 8, sy + 21, 10, 4)
  }
}

export function drawTopDownFurniture(
  ctx: CanvasRenderingContext2D,
  item: FurnitureItem,
  originX: number,
  originY: number
) {
  const sx = originX + item.gx * TILE_SIZE
  const sy = originY + item.gy * TILE_SIZE
  const w = item.gw * TILE_SIZE
  const h = item.gh * TILE_SIZE

  if (item.type === 'rug_gray' || item.type === 'rug_purple') {
    const isPurple = item.type === 'rug_purple'
    ctx.fillStyle = isPurple ? '#a5b4fc' : '#cbd5e1'
    ctx.fillRect(sx + 2, sy + 2, w - 4, h - 4)

    ctx.fillStyle = isPurple ? 'rgba(99, 102, 241, 0.25)' : 'rgba(100, 116, 139, 0.22)'
    for (let rx = sx + 8; rx < sx + w - 8; rx += 12) {
      for (let ry = sy + 8; ry < sy + h - 8; ry += 12) {
        ctx.fillRect(rx, ry, 4, 4)
      }
    }

    ctx.strokeStyle = isPurple ? '#6366f1' : '#94a3b8'
    ctx.lineWidth = 1.5
    ctx.strokeRect(sx + 2, sy + 2, w - 4, h - 4)

    if (item.label && item.label !== 'Lounge') {
      ctx.font = '600 11px sans-serif'
      const tw = ctx.measureText(item.label).width + 18
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.beginPath()
      ctx.roundRect(sx + w / 2 - tw / 2, sy - 24, tw, 20, 10)
      ctx.fill()
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.fillStyle = '#334155'
      ctx.textAlign = 'center'
      ctx.fillText(item.label, sx + w / 2, sy - 10.5)
    }
    return
  }

  if (item.type === 'desk_pc') {
    drawOfficeChair(ctx, sx + 22, sy + 34)
    drawOfficeChair(ctx, sx + w - 22, sy + 34)

    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(sx + 4, sy + 10, w - 8, h - 14)
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(sx + 4, sy + 6, w - 8, h - 16)
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 1.2
    ctx.strokeRect(sx + 4, sy + 6, w - 8, h - 16)

    ctx.fillStyle = '#1e293b'
    ctx.fillRect(sx + 12, sy + 8, 22, 13)
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(sx + 14, sy + 10, 18, 9)
    ctx.fillStyle = '#cbd5e1'
    ctx.fillRect(sx + 15, sy + 23, 16, 4)

    ctx.fillStyle = '#1e293b'
    ctx.fillRect(sx + w - 34, sy + 8, 22, 13)
    ctx.fillStyle = '#818cf8'
    ctx.fillRect(sx + w - 32, sy + 10, 18, 9)
    ctx.fillStyle = '#cbd5e1'
    ctx.fillRect(sx + w - 31, sy + 23, 16, 4)

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(sx + w / 2, sy + 18, 3.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#78350f'
    ctx.stroke()
    return
  }

  if (item.type === 'meeting_table') {
    const seats = Math.max(2, item.gw)
    for (let i = 0; i < seats; i++) {
      const cx = sx + 22 + i * 38
      drawWoodChair(ctx, cx, sy + 3)
      drawWoodChair(ctx, cx, sy + h - 3)
    }

    ctx.fillStyle = '#92400e'
    ctx.beginPath()
    ctx.roundRect(sx + 4, sy + 9, w - 8, h - 12, 6)
    ctx.fill()

    ctx.fillStyle = '#d97706'
    ctx.beginPath()
    ctx.roundRect(sx + 4, sy + 6, w - 8, h - 14, 6)
    ctx.fill()
    ctx.strokeStyle = '#451a03'
    ctx.lineWidth = 1.2
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(sx + 18, sy + 14, 12, 9)
    ctx.fillStyle = '#334155'
    ctx.fillRect(sx + w - 32, sy + 13, 15, 10)
    return
  }

  if (item.type === 'sofa') {
    ctx.fillStyle = '#c2410c'
    ctx.beginPath()
    ctx.roundRect(sx + 4, sy + 8, w - 8, h - 10, 7)
    ctx.fill()

    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.roundRect(sx + 4, sy + 5, w - 8, h - 12, 7)
    ctx.fill()
    ctx.strokeStyle = '#7c2d12'
    ctx.lineWidth = 1.2
    ctx.stroke()

    ctx.fillStyle = '#fb923c'
    ctx.fillRect(sx + 10, sy + 12, (w - 24) / 2, h - 22)
    ctx.fillRect(sx + w / 2 + 2, sy + 12, (w - 24) / 2, h - 22)
    return
  }

  if (item.type === 'pingpong') {
    ctx.fillStyle = '#14532d'
    ctx.fillRect(sx + 5, sy + 8, w - 10, h - 10)
    ctx.fillStyle = '#16a34a'
    ctx.fillRect(sx + 5, sy + 5, w - 10, h - 12)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.8
    ctx.strokeRect(sx + 7, sy + 7, w - 14, h - 16)

    ctx.beginPath()
    ctx.moveTo(sx + w / 2, sy + 7)
    ctx.lineTo(sx + w / 2, sy + h - 9)
    ctx.stroke()

    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(sx + 3, sy + h / 2 - 2, w - 6, 3)

    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(sx + 16, sy + 18, 4, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  if (item.type === 'bookshelf') {
    ctx.fillStyle = '#451a03'
    ctx.fillRect(sx + 4, sy + 4, w - 8, h - 6)
    ctx.fillStyle = '#78350f'
    ctx.fillRect(sx + 7, sy + 8, w - 14, 12)
    ctx.fillRect(sx + 7, sy + 23, w - 14, 12)

    const bookColors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#f97316']
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = bookColors[i % bookColors.length]
      ctx.fillRect(sx + 9 + i * 8, sy + 9, 6, 10)
      ctx.fillStyle = bookColors[(i + 2) % bookColors.length]
      ctx.fillRect(sx + 9 + i * 8, sy + 24, 6, 10)
    }
    return
  }

  if (item.type === 'aquarium') {
    ctx.fillStyle = '#334155'
    ctx.fillRect(sx + 4, sy + 6, w - 8, h - 8)
    ctx.fillStyle = '#0ea5e9'
    ctx.fillRect(sx + 7, sy + 9, w - 14, h - 16)
    ctx.fillStyle = '#bae6fd'
    ctx.fillRect(sx + 10, sy + 11, w - 20, 5)
    ctx.fillStyle = '#f97316'
    ctx.fillRect(sx + 24, sy + 19, 7, 4)
    ctx.fillRect(sx + 52, sy + 16, 6, 4)
    return
  }

  if (item.type === 'coffee_bar') {
    ctx.fillStyle = '#334155'
    ctx.fillRect(sx + 4, sy + 6, w - 24, h - 8)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(sx + 4, sy + 4, w - 24, 12)
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(sx + 12, sy + 8, 22, 16)
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(sx + 16, sy + 12, 14, 4)

    ctx.fillStyle = '#e2e8f0'
    ctx.fillRect(sx + w - 18, sy + 12, 14, 22)
    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.arc(sx + w - 11, sy + 11, 6.5, 0, Math.PI * 2)
    ctx.fill()

    if (item.label) {
      ctx.font = '600 10px sans-serif'
      ctx.fillStyle = '#334155'
      ctx.textAlign = 'center'
      ctx.fillText(item.label, sx + w / 2, sy - 4)
    }
    return
  }

  if (item.type === 'plant') {
    const cx = sx + TILE_SIZE / 2
    const cy = sy + TILE_SIZE / 2
    ctx.fillStyle = '#9a3412'
    ctx.fillRect(cx - 8, cy + 2, 16, 12)
    ctx.fillStyle = '#c2410c'
    ctx.fillRect(cx - 9, cy, 18, 4)
    ctx.fillStyle = '#15803d'
    ctx.beginPath()
    ctx.arc(cx, cy - 5, 13, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.arc(cx - 3, cy - 8, 9, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawOfficeChair(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#1e293b'
  ctx.beginPath()
  ctx.roundRect(cx - 9, cy - 6, 18, 12, 4)
  ctx.fill()
  ctx.fillStyle = '#475569'
  ctx.fillRect(cx - 7, cy + 2, 14, 4)
}

function drawWoodChair(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#b45309'
  ctx.strokeStyle = '#451a03'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(cx - 7, cy - 5, 14, 10, 3)
  ctx.fill()
  ctx.stroke()
}

export function drawChibiAvatar(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  originX: number,
  originY: number,
  name: string,
  shirtColor: string,
  hairColor: string,
  hairStyle: 'spiky' | 'bob' | 'cap',
  isSelf: boolean,
  bubble?: string,
  bobOffset = 0,
  hasCoffee = false,
  isSitting = false
) {
  const cx = Math.round(originX + (gx + 0.5) * TILE_SIZE)
  const baseY = Math.round(originY + (gy + 0.5) * TILE_SIZE)
  const stepSwing = !isSitting && bobOffset > 0 ? Math.sin(bobOffset * 2.2) : 0
  const sitOffset = isSitting ? 4 : 0
  const cy = Math.round(baseY - Math.abs(stepSwing) * 2 + sitOffset)

  ctx.fillStyle = 'rgba(15, 23, 42, 0.24)'
  ctx.beginPath()
  ctx.ellipse(cx, baseY + 15, 11, 4.5, 0, 0, Math.PI * 2)
  ctx.fill()

  const p = 2
  const px = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(cx + x * p, cy + y * p, w * p, h * p)
  }

  if (isSitting) {
    px(-4, 4, 3, 2, '#1e293b')
    px(1, 4, 3, 2, '#1e293b')
    px(-4, 6, 2, 1, '#0f172a')
    px(2, 6, 2, 1, '#0f172a')
  } else {
    const leftFootY = stepSwing > 0.2 ? 6 : 7
    const rightFootY = stepSwing < -0.2 ? 6 : 7
    px(-3, 5, 2, 2, '#1e293b')
    px(1, 5, 2, 2, '#1e293b')
    px(-3, leftFootY, 2, 1, '#0f172a')
    px(1, rightFootY, 2, 1, '#0f172a')
  }

  px(-4, 0, 8, 5, '#1e293b')
  px(-3, 0, 6, 5, shirtColor)
  px(-1, 0, 2, 1, '#ffffff')
  px(-5, 1, 1, 3, shirtColor)
  px(4, 1, 1, 3, shirtColor)
  px(-5, 4, 1, 1, '#fed7aa')
  px(4, 4, 1, 1, '#fed7aa')

  px(-5, -8, 10, 8, '#1e293b')
  px(-4, -7, 8, 7, '#fed7aa')

  px(-3, -4, 1, 2, '#0f172a')
  px(2, -4, 1, 2, '#0f172a')
  px(-4, -2, 1, 1, '#fca5a5')
  px(3, -2, 1, 1, '#fca5a5')

  if (hairStyle === 'spiky') {
    px(-5, -9, 10, 3, hairColor)
    px(-5, -6, 1, 3, hairColor)
    px(4, -6, 1, 3, hairColor)
    px(-2, -6, 2, 1, hairColor)
  } else if (hairStyle === 'bob') {
    px(-5, -9, 10, 3, hairColor)
    px(-5, -6, 1, 6, hairColor)
    px(4, -6, 1, 6, hairColor)
    px(-3, -6, 2, 1, hairColor)
  } else {
    px(-5, -9, 10, 3, '#ef4444')
    px(-4, -10, 8, 1, '#dc2626')
    px(-2, -6, 6, 1, '#b91c1c')
    px(-5, -6, 1, 2, hairColor)
  }

  if (hasCoffee) {
    px(5, 2, 3, 3, '#ffffff')
    px(5, 2, 3, 1, '#78350f')
  }

  ctx.font = '600 11px sans-serif'
  const label = isSelf ? `${name} (You)` : name
  const tw = ctx.measureText(label).width
  const pillW = tw + 22
  const pillY = cy - 39

  ctx.fillStyle = 'rgba(24, 24, 27, 0.92)'
  ctx.beginPath()
  ctx.roundRect(cx - pillW / 2, pillY, pillW, 19, 9.5)
  ctx.fill()

  ctx.fillStyle = isSitting ? '#38bdf8' : '#22c55e'
  ctx.beginPath()
  ctx.arc(cx - pillW / 2 + 9, pillY + 9.5, 3.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.fillText(label, cx + 4, pillY + 13)

  if (bubble) {
    const bw = Math.max(ctx.measureText(bubble).width + 16, 32)
    const by = pillY - 25
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.roundRect(cx - bw / 2, by, bw, 21, 10.5)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#0f172a'
    ctx.fillText(bubble, cx, by + 14)
  }
}
