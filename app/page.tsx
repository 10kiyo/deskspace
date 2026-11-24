'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import IsometricCanvas from '@/components/office/IsometricCanvas'
import AvatarLobby from '@/components/office/AvatarLobby'
import SpatialChatPanel, { ChatMessage } from '@/components/office/SpatialChatPanel'
import { BOT_PEERS, HairStyle, PeerUser, ZoneType } from '@/lib/officeMap'
import { supabase } from '@/lib/supabaseClient'
import {
  Building2,
  Coffee,
  Users,
  Sparkles,
  Laptop,
  Video,
  Armchair,
  UserCog,
} from 'lucide-react'

const ZONE_META: Record<
  ZoneType,
  { label: string; status: PeerUser['status']; badgeClass: string }
> = {
  focus: {
    label: 'Work Desk Zone',
    status: 'Focusing',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  meeting: {
    label: 'Meeting Room',
    status: 'In Meeting',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  lounge: {
    label: 'Coffee Lounge',
    status: 'Coffee Break',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  hallway: {
    label: 'Main Hallway',
    status: 'Active',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
}

function playWaveChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.frequency.setValueAtTime(880, now)
    gain1.gain.setValueAtTime(0.12, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.35)

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.frequency.setValueAtTime(1174.66, now + 0.14)
    gain2.gain.setValueAtTime(0.12, now + 0.14)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.14)
    osc2.stop(now + 0.55)
  } catch {
    // Abaikan jika browser memblokir audio
  }
}

export default function DeskSpacePage() {
  const [hasJoined, setHasJoined] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [playerRole, setPlayerRole] = useState('Product Designer')
  const [playerColor, setPlayerColor] = useState('#2563eb')
  const [playerHairStyle, setPlayerHairStyle] = useState<HairStyle>('spiky')
  const [playerHairColor] = useState('#1e293b')

  const [sessionId, setSessionId] = useState('')
  const [livePeers, setLivePeers] = useState<Record<string, PeerUser>>({})
  const [currentZone, setCurrentZone] = useState<ZoneType>('hallway')
  const [isSitting, setIsSitting] = useState(false)
  const [nearbyPeers, setNearbyPeers] = useState<PeerUser[]>([])
  const [playerBubble, setPlayerBubble] = useState<string | undefined>()
  const [waveToast, setWaveToast] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'Steven',
      text: 'Halo! Buka tab baru untuk tes jalan bareng secara real-time 👋',
      zone: 'Meeting Room',
    },
  ])

  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null)

  useEffect(() => {
    setSessionId(crypto.randomUUID())
  }, [])

  // Supabase Realtime Presence & Broadcast
  useEffect(() => {
    if (!hasJoined || !supabase || !sessionId) return

    const channel = supabase.channel('deskspace-hq-room', {
      config: { presence: { key: sessionId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PeerUser>()
        const nextPeers: Record<string, PeerUser> = {}
        Object.entries(state).forEach(([key, presences]) => {
          if (key === sessionId) return
          const latest = presences[presences.length - 1]
          if (latest) nextPeers[key] = { ...latest, id: key }
        })
        setLivePeers(nextPeers)
      })
      .on('broadcast', { event: 'move' }, ({ payload }) => {
        if (payload.id === sessionId) return
        setLivePeers((prev) =>
          prev[payload.id]
            ? {
                ...prev,
                [payload.id]: {
                  ...prev[payload.id],
                  gx: payload.gx,
                  gy: payload.gy,
                  isSitting: payload.isSitting,
                  status: payload.status,
                },
              }
            : prev
        )
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        if (payload.id === sessionId) return
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), sender: payload.sender, text: payload.text, zone: payload.zone },
        ])
        setLivePeers((prev) =>
          prev[payload.id] ? { ...prev, [payload.id]: { ...prev[payload.id], chatBubble: payload.text } } : prev
        )
        setTimeout(() => {
          setLivePeers((prev) =>
            prev[payload.id] ? { ...prev, [payload.id]: { ...prev[payload.id], chatBubble: undefined } } : prev
          )
        }, 4500)
      })
      .on('broadcast', { event: 'wave' }, ({ payload }) => {
        if (payload.targetId === sessionId) {
          playWaveChime()
          setWaveToast(`👋 ${payload.fromName} melambaikan tangan kepadamu!`)
          setTimeout(() => setWaveToast(null), 4000)
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: sessionId,
            name: playerName || 'Guest',
            role: playerRole,
            color: playerColor,
            hairColor: playerHairColor,
            hairStyle: playerHairStyle,
            gx: 8,
            gy: 5,
            status: 'Active',
            isSitting: false,
            schedule: [{ time: 'Hari Ini', title: `Fokus: ${playerRole}` }],
          })
        }
      })

    channelRef.current = channel
    return () => {
      supabase?.removeChannel(channel)
      channelRef.current = null
    }
  }, [hasJoined, sessionId, playerName, playerRole, playerColor, playerHairColor, playerHairStyle])

  const handleMoveBroadcast = useCallback(
    (gx: number, gy: number, sitting: boolean) => {
      if (!channelRef.current || !sessionId) return
      channelRef.current.send({
        type: 'broadcast',
        event: 'move',
        payload: { id: sessionId, gx, gy, isSitting: sitting, status: ZONE_META[currentZone].status },
      })
    },
    [sessionId, currentZone]
  )

  const handleSendWave = useCallback(
    (targetPeer: PeerUser) => {
      playWaveChime()
      setWaveToast(`🔔 Kamu membunyikan bel Wave ke ${targetPeer.name}!`)
      setTimeout(() => setWaveToast(null), 3000)
      channelRef.current?.send({
        type: 'broadcast',
        event: 'wave',
        payload: { fromId: sessionId, fromName: playerName || 'Guest', targetId: targetPeer.id },
      })
    },
    [sessionId, playerName]
  )

  const handleCoffeeInteract = useCallback(() => {
    setPlayerBubble('Ambil espresso dulu ☕')
    setTimeout(() => setPlayerBubble(undefined), 4000)
  }, [])

  const handleSendMessage = (text: string) => {
    const zoneLabel = ZONE_META[currentZone].label
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender: playerName || 'You', text, zone: zoneLabel },
    ])
    setPlayerBubble(text)
    setTimeout(() => setPlayerBubble(undefined), 4500)

    channelRef.current?.send({
      type: 'broadcast',
      event: 'chat',
      payload: { id: sessionId, sender: playerName || 'Guest', text, zone: zoneLabel },
    })
  }

  if (!hasJoined) {
    return (
      <AvatarLobby
        playerName={playerName}
        setPlayerName={setPlayerName}
        playerRole={playerRole}
        setPlayerRole={setPlayerRole}
        playerColor={playerColor}
        setPlayerColor={setPlayerColor}
        playerHairStyle={playerHairStyle}
        setPlayerHairStyle={setPlayerHairStyle}
        playerHairColor={playerHairColor}
        onJoin={() => setHasJoined(true)}
      />
    )
  }

  const allPeers: PeerUser[] = [...Object.values(livePeers), ...BOT_PEERS]
  const zoneInfo = ZONE_META[currentZone]

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-200/70 select-none">
      {waveToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg">
          {waveToast}
        </div>
      )}

      <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm rounded-2xl px-4 py-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">DeskSpace HQ</h1>
            <p className="text-[11px] text-slate-500">
              Dekati kursi/sofa untuk duduk • Klik teman untuk Wave
            </p>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm rounded-2xl px-3.5 py-2">
          {isSitting && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              <Armchair className="w-3.5 h-3.5" />
              <span>Sedang Duduk</span>
            </span>
          )}

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${zoneInfo.badgeClass}`}
          >
            {currentZone === 'focus' && <Laptop className="w-3.5 h-3.5" />}
            {currentZone === 'meeting' && <Video className="w-3.5 h-3.5" />}
            {currentZone === 'lounge' && <Coffee className="w-3.5 h-3.5" />}
            {currentZone === 'hallway' && <Sparkles className="w-3.5 h-3.5" />}
            <span>
              {zoneInfo.label} • {zoneInfo.status}
            </span>
          </span>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>{allPeers.length + 1} Online</span>
          </div>

          <button
            onClick={() => setHasJoined(false)}
            title="Ubah Avatar & Nama"
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
          >
            <UserCog className="w-4 h-4" />
          </button>
        </div>
      </header>

      <IsometricCanvas
        playerName={playerName}
        playerColor={playerColor}
        playerHairColor={playerHairColor}
        playerHairStyle={playerHairStyle}
        playerBubble={playerBubble}
        onZoneChange={setCurrentZone}
        onSittingChange={setIsSitting}
        onMoveBroadcast={handleMoveBroadcast}
        onSendWave={handleSendWave}
        onNearbyPeersChange={setNearbyPeers}
        onCoffeeInteract={handleCoffeeInteract}
        peers={allPeers}
      />

      <SpatialChatPanel
        messages={messages}
        nearbyPeers={nearbyPeers}
        onSendMessage={handleSendMessage}
        onSendWave={handleSendWave}
      />
    </div>
  )
}
