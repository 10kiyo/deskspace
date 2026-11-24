'use client'

import { useState } from 'react'
import { PeerUser } from '@/lib/officeMap'
import { Hand, MessageSquare, Send } from 'lucide-react'

export interface ChatMessage {
  id: string
  sender: string
  text: string
  zone: string
}

interface SpatialChatPanelProps {
  messages: ChatMessage[]
  nearbyPeers: PeerUser[]
  onSendMessage: (text: string) => void
  onSendWave: (peer: PeerUser) => void
}

export default function SpatialChatPanel({
  messages,
  nearbyPeers,
  onSendMessage,
  onSendWave,
}: SpatialChatPanelProps) {
  const [chatInput, setChatInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    onSendMessage(chatInput.trim())
    setChatInput('')
  }

  return (
    <div className="absolute bottom-4 left-4 z-20 w-80 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg rounded-2xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span>Spatial Chat</span>
        </div>

        {nearbyPeers.length > 0 ? (
          <button
            onClick={() => onSendWave(nearbyPeers[0])}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-full transition cursor-pointer"
          >
            <Hand className="w-3 h-3" />
            <span>Wave {nearbyPeers[0].name}</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400">
            Dekati rekan untuk Wave
          </span>
        )}
      </div>

      <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 text-xs">
        {messages.map((m) => (
          <div key={m.id} className="bg-slate-50 rounded-xl px-2.5 py-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-bold text-slate-700">{m.sender}</span>
              <span>{m.zone}</span>
            </div>
            <p className="text-slate-600 mt-0.5">{m.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Kirim pesan (muncul di atas kepala)..."
          className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  )
}
