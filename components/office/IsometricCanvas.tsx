'use client'

import { useEffect, useRef, useState } from 'react'
import {
  GRID_COLS,
  GRID_ROWS,
  FURNITURE,
  PeerUser,
  HairStyle,
  getZoneAt,
  isWall,
  isWalkable,
  findPath,
  checkIsSitting,
  ZoneType,
} from '@/lib/officeMap'
import {
  TILE_SIZE,
  drawTopDownFloor,
  drawTopDownWall,
  drawTopDownFurniture,
  drawChibiAvatar,
} from '@/lib/isoRenderer'
import { Hand, Video, Calendar, X } from 'lucide-react'

interface IsometricCanvasProps {
  playerName: string
  playerColor: string
  playerHairColor: string
  playerHairStyle: HairStyle
  playerBubble?: string
  onZoneChange: (zone: ZoneType) => void
  onSittingChange: (sitting: boolean) => void
  onMoveBroadcast: (gx: number, gy: number, isSitting: boolean) => void
  onSendWave: (targetPeer: PeerUser) => void
  onNearbyPeersChange: (peers: PeerUser[]) => void
  onCoffeeInteract: () => void
  peers: PeerUser[]
}

export default function IsometricCanvas({
  playerName,
  playerColor,
  playerHairColor,
  playerHairStyle,
  playerBubble,
  onZoneChange,
  onSittingChange,
  onMoveBroadcast,
  onSendWave,
  onNearbyPeersChange,
  onCoffeeInteract,
  peers,
}: IsometricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [selectedPeer, setSelectedPeer] = useState<PeerUser | null>(null)
  const [wavedPeerId, setWavedPeerId] = useState<string | null>(null)

  const playerRef = useRef({
    gx: 8,
    gy: 5,
    path: [] as { gx: number; gy: number }[],
    bobPhase: 0,
    hasCoffee: false,
    isSitting: false,
  })

  const keysRef = useRef<Record<string, boolean>>({})
  const hoverTileRef = useRef<{ gx: number; gy: number } | null>(null)
  const lastZoneRef = useRef<ZoneType>('hallway')
  const lastSittingRef = useRef<boolean>(false)
  const lastNearbyIdsRef = useRef<string>('')
  const lastBroadcastRef = useRef<number>(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      const key = e.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault()
      }
      keysRef.current[key] = true

      if (key === 'e') {
        const dist = Math.hypot(playerRef.current.gx - 3, playerRef.current.gy - 5)
        if (dist <= 2.2) {
          playerRef.current.hasCoffee = true
          onCoffeeInteract()
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onCoffeeInteract])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let lastTime = performance.now()

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      if (
        canvas.width !== Math.floor(rect.width * dpr) ||
        canvas.height !== Math.floor(rect.height * dpr)
      ) {
        canvas.width = Math.floor(rect.width * dpr)
        canvas.height = Math.floor(rect.height * dpr)
      }

      ctx.save()
      ctx.scale(dpr, dpr)

      const mapW = GRID_COLS * TILE_SIZE
      const mapH = GRID_ROWS * TILE_SIZE
      const originX = (rect.width - mapW) / 2
      const originY = (rect.height - mapH) / 2 + 12

      // 1. Pergerakan Pemain
      const p = playerRef.current
      const speed = 5.2
      let vx = 0
      let vy = 0

      if (keysRef.current['w'] || keysRef.current['arrowup']) vy -= 1
      if (keysRef.current['s'] || keysRef.current['arrowdown']) vy += 1
      if (keysRef.current['a'] || keysRef.current['arrowleft']) vx -= 1
      if (keysRef.current['d'] || keysRef.current['arrowright']) vx += 1

      let isMoving = false

      if (vx !== 0 || vy !== 0) {
        p.path = []
        const len = Math.hypot(vx, vy)
        const nx = p.gx + (vx / len) * speed * dt
        const ny = p.gy + (vy / len) * speed * dt

        if (isWalkable(Math.round(nx), Math.round(p.gy))) p.gx = nx
        if (isWalkable(Math.round(p.gx), Math.round(ny))) p.gy = ny
        isMoving = true
      } else if (p.path.length > 0) {
        const next = p.path[0]
        const dx = next.gx - p.gx
        const dy = next.gy - p.gy
        const dist = Math.hypot(dx, dy)
        if (dist < 0.08) {
          p.gx = next.gx
          p.gy = next.gy
          p.path.shift()
        } else {
          p.gx += (dx / dist) * speed * dt
          p.gy += (dy / dist) * speed * dt
        }
        isMoving = true
      }

      p.bobPhase = isMoving ? p.bobPhase + dt * 15 : 0

      // 2. Cek Status Duduk & Zona
      const sittingNow = !isMoving && checkIsSitting(p.gx, p.gy)
      p.isSitting = sittingNow
      if (sittingNow !== lastSittingRef.current) {
        lastSittingRef.current = sittingNow
        onSittingChange(sittingNow)
      }

      const currZone = getZoneAt(Math.round(p.gx), Math.round(p.gy))
      if (currZone !== lastZoneRef.current) {
        lastZoneRef.current = currZone
        onZoneChange(currZone)
      }

      // Broadcast koordinat ke Supabase Realtime tiap ~80ms saat bergerak
      if ((isMoving || now - lastBroadcastRef.current > 2000) && now - lastBroadcastRef.current > 80) {
        lastBroadcastRef.current = now
        onMoveBroadcast(Number(p.gx.toFixed(2)), Number(p.gy.toFixed(2)), sittingNow)
      }

      // 3. Rekan Terdekat
      const nearby = peers.filter(
        (peer) => Math.hypot(peer.gx - p.gx, peer.gy - p.gy) <= 2.6
      )
      const nearbyKey = nearby.map((n) => n.id).join(',')
      if (nearbyKey !== lastNearbyIdsRef.current) {
        lastNearbyIdsRef.current = nearbyKey
        onNearbyPeersChange(nearby)
      }

      // 4. Render Lantai, Dinding & Furnitur
      ctx.clearRect(0, 0, rect.width, rect.height)
      drawTopDownFloor(ctx, GRID_COLS, GRID_ROWS, originX, originY)

      if (
        hoverTileRef.current &&
        isWalkable(hoverTileRef.current.gx, hoverTileRef.current.gy)
      ) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.16)'
        ctx.beginPath()
        ctx.roundRect(
          originX + hoverTileRef.current.gx * TILE_SIZE + 3,
          originY + hoverTileRef.current.gy * TILE_SIZE + 3,
          TILE_SIZE - 6,
          TILE_SIZE - 6,
          6
        )
        ctx.fill()
      }

      for (let gy = 0; gy < GRID_ROWS; gy++) {
        for (let gx = 0; gx < GRID_COLS; gx++) {
          if (isWall(gx, gy)) {
            drawTopDownWall(ctx, gx, gy, originX, originY)
          }
        }
      }

      for (const item of FURNITURE) {
        drawTopDownFurniture(ctx, item, originX, originY)
      }

      // 5. Lingkaran Proximity
      const px = originX + (p.gx + 0.5) * TILE_SIZE
      const py = originY + (p.gy + 0.5) * TILE_SIZE
      ctx.save()
      ctx.beginPath()
      ctx.arc(px, py, TILE_SIZE * 2.4, 0, Math.PI * 2)
      ctx.fillStyle =
        nearby.length > 0 ? 'rgba(99, 102, 241, 0.08)' : 'rgba(148, 163, 184, 0.06)'
      ctx.fill()
      ctx.strokeStyle =
        nearby.length > 0 ? 'rgba(99, 102, 241, 0.35)' : 'rgba(148, 163, 184, 0.2)'
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.restore()

      // 6. Render Semua Karakter (Depth Sorted)
      const entities = [
        ...peers.map((peer) => ({
          gy: peer.gy,
          draw: () =>
            drawChibiAvatar(
              ctx,
              peer.gx,
              peer.gy,
              originX,
              originY,
              peer.name,
              peer.color,
              peer.hairColor,
              peer.hairStyle || 'spiky',
              false,
              wavedPeerId === peer.id ? '👋 Halo!' : peer.chatBubble,
              0,
              false,
              peer.isSitting
            ),
        })),
        {
          gy: p.gy,
          draw: () =>
            drawChibiAvatar(
              ctx,
              p.gx,
              p.gy,
              originX,
              originY,
              playerName,
              playerColor,
              playerHairColor,
              playerHairStyle,
              true,
              playerBubble,
              Math.abs(Math.sin(p.bobPhase)) * 3.5,
              p.hasCoffee,
              p.isSitting
            ),
        },
      ]

      entities.sort((a, b) => a.gy - b.gy)
      entities.forEach((ent) => ent.draw())

      ctx.restore()
      animationId = requestAnimationFrame(render)
    }

    animationId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animationId)
  }, [
    peers,
    playerName,
    playerColor,
    playerHairColor,
    playerHairStyle,
    playerBubble,
    wavedPeerId,
    onZoneChange,
    onSittingChange,
    onMoveBroadcast,
    onNearbyPeersChange,
  ])

  const getGridCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const originX = (rect.width - GRID_COLS * TILE_SIZE) / 2
    const originY = (rect.height - GRID_ROWS * TILE_SIZE) / 2 + 12
    const gx = Math.floor((e.clientX - rect.left - originX) / TILE_SIZE)
    const gy = Math.floor((e.clientY - rect.top - originY) / TILE_SIZE)
    return { gx, gy }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { gx, gy } = getGridCoords(e)

    const clickedPeer = peers.find(
      (peer) => Math.abs(peer.gx - gx) <= 0.85 && Math.abs(peer.gy - gy) <= 0.85
    )
    if (clickedPeer) {
      setSelectedPeer(clickedPeer)
      return
    }

    setSelectedPeer(null)

    const path = findPath(playerRef.current.gx, playerRef.current.gy, gx, gy)
    if (path.length > 0) {
      playerRef.current.path = path
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    hoverTileRef.current = getGridCoords(e)
  }

  const handleWaveClick = (peer: PeerUser) => {
    setWavedPeerId(peer.id)
    onSendWave(peer)
    setTimeout(() => setWavedPeerId(null), 3000)
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        className="w-full h-full cursor-pointer block"
      />

      {/* Kartu Profil Rekan Kerja */}
      {selectedPeer && (
        <div className="absolute top-20 right-6 z-30 w-72 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs"
                style={{ backgroundColor: selectedPeer.color }}
              >
                {selectedPeer.name[0]}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedPeer.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{selectedPeer.status}</span>
                  <span>• {selectedPeer.role}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedPeer(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleWaveClick(selectedPeer)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Wave / Ping</span>
            </button>
            <button
              onClick={() => handleWaveClick(selectedPeer)}
              title="Panggil Video"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>

          {selectedPeer.schedule && selectedPeer.schedule.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Jadwal Hari Ini</span>
              </div>
              {selectedPeer.schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-indigo-50/80 border border-indigo-100 rounded-xl px-3 py-2"
                >
                  <p className="text-xs font-bold text-indigo-950">{item.title}</p>
                  <p className="text-[11px] text-indigo-600 mt-0.5">{item.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
