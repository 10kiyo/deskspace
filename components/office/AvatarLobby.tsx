'use client'

import { useEffect, useRef } from 'react'
import { HairStyle } from '@/lib/officeMap'
import { drawChibiAvatar, TILE_SIZE } from '@/lib/isoRenderer'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { Building2, Radio } from 'lucide-react'

const SHIRT_COLORS = [
  { label: 'Royal Blue', hex: '#2563eb' },
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Rose Pink', hex: '#ec4899' },
  { label: 'Amber', hex: '#f59e0b' },
  { label: 'Indigo', hex: '#6366f1' },
  { label: 'Slate Dark', hex: '#334155' },
]

const HAIR_OPTIONS: { id: HairStyle; label: string }[] = [
  { id: 'spiky', label: 'Pendek Poni' },
  { id: 'bob', label: 'Panjang Sebahu' },
  { id: 'cap', label: 'Topi Merah' },
]

interface AvatarLobbyProps {
  playerName: string
  setPlayerName: (v: string) => void
  playerRole: string
  setPlayerRole: (v: string) => void
  playerColor: string
  setPlayerColor: (v: string) => void
  playerHairStyle: HairStyle
  setPlayerHairStyle: (v: HairStyle) => void
  playerHairColor: string
  onJoin: () => void
}

export default function AvatarLobby({
  playerName,
  setPlayerName,
  playerRole,
  setPlayerRole,
  playerColor,
  setPlayerColor,
  playerHairStyle,
  setPlayerHairStyle,
  playerHairColor,
  onJoin,
}: AvatarLobbyProps) {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Render karakter RPG asli langsung di kotak preview lobby
  useEffect(() => {
    const canvas = previewCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = 96 * dpr
    canvas.height = 96 * dpr

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, 96, 96)

    // Gambar karakter di tengah canvas 96x96 (gx=0, gy=0 -> offset agar pas di tengah)
    drawChibiAvatar(
      ctx,
      0,
      0,
      48 - TILE_SIZE / 2,
      62 - TILE_SIZE / 2,
      playerName.trim() || 'You',
      playerColor,
      playerHairColor,
      playerHairStyle,
      true
    )
    ctx.restore()
  }, [playerName, playerColor, playerHairColor, playerHairStyle])

  return (
    <div className="min-h-screen w-screen bg-linear-to-br from-indigo-50 via-amber-50/40 to-emerald-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Masuk ke DeskSpace HQ</h1>
            <p className="text-xs text-slate-500">
              Sesuaikan karakter & profil sebelum bergabung ke ruang kantor
            </p>
          </div>
        </div>

        {/* Live Canvas Preview Karakter Chibi */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <canvas
              ref={previewCanvasRef}
              className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-xs shrink-0"
            />
            <div>
              <p className="text-sm font-bold text-slate-900">
                {playerName.trim() || 'Nama Kamu'}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {playerRole}
              </p>
              <span
                className={`mt-2 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isSupabaseConfigured
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Radio className="w-3 h-3" />
                {isSupabaseConfigured ? 'Realtime Ready' : 'Local Mode'}
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!playerName.trim()) return
            onJoin()
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Panggilan
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Misal: Kiyo"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Peran / Role
              </label>
              <select
                value={playerRole}
                onChange={(e) => setPlayerRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
              >
                <option>Product Designer</option>
                <option>Frontend Engineer</option>
                <option>Backend Engineer</option>
                <option>Product Manager</option>
                <option>CX Specialist</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Warna Baju Avatar
            </label>
            <div className="flex items-center gap-2.5">
              {SHIRT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setPlayerColor(c.hex)}
                  title={c.label}
                  className={`w-8 h-8 rounded-full transition cursor-pointer ${
                    playerColor === c.hex
                      ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Gaya Rambut & Aksesori
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HAIR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPlayerHairStyle(opt.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    playerHairStyle === opt.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-2xl shadow-sm transition cursor-pointer mt-2"
          >
            Masuk ke Kantor Virtual →
          </button>
        </form>
      </div>
    </div>
  )
}
