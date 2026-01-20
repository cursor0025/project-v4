'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MessageSquare, MoreVertical, Search, Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface Conversation {
  id: string
  customerName: string
  lastMessage: string
  lastAt: string
  unreadCount: number
}

interface Message {
  id: string
  from: 'seller' | 'customer'
  content: string
  createdAt: string
  isRead: boolean
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [search, setSearch] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations
    const q = search.toLowerCase()
    return conversations.filter((c) => c.customerName.toLowerCase().includes(q))
  }, [search, conversations])

  const selectedConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedId) || null
  }, [conversations, selectedId])

  const loadConversations = async () => {
    try {
      setLoadingConversations(true)
      const res = await fetch('/api/messages', { method: 'GET' })
      const json = await res.json()
      setConversations(json.conversations || [])
    } catch {
      toast.error('Erreur lors du chargement des messages')
    } finally {
      setLoadingConversations(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      setSelectedId(conversationId)
      setLoadingMessages(true)
      const res = await fetch(`/api/messages/${conversationId}`, { method: 'GET' })
      const json = await res.json()
      setMessages(json.messages || [])
    } catch {
      toast.error('Erreur lors du chargement de la conversation')
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSend = async () => {
    if (!selectedId) {
      toast.error('Sélectionne une conversation')
      return
    }
    if (!input.trim()) return

    // TODO: brancher l’endpoint d’envoi si tu l’as (/api/messages/[id] POST par ex.)
    toast('Envoi non branché pour le moment')
    setInput('')
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col p-4 md:p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Messages Clients</h1>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Colonne gauche */}
        <div className="lg:w-80 bg-[#131926] border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0b0f1a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <p className="text-slate-500 text-xs p-6 italic text-center">Chargement...</p>
            ) : filteredConversations.length === 0 ? (
              <p className="text-slate-500 text-xs p-6 italic text-center">Aucune conversation</p>
            ) : (
              filteredConversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadMessages(c.id)}
                  className={`w-full text-left p-4 flex items-start gap-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                    selectedId === c.id ? 'bg-slate-800/50' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
                    {c.customerName?.charAt(0) || '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-bold text-white truncate">{c.customerName}</p>
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.lastAt).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{c.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Colonne droite */}
        <div className="flex-1 bg-[#131926] border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-xl">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
                    {selectedConversation.customerName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{selectedConversation.customerName}</p>
                    <p className="text-[10px] text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> En ligne
                    </p>
                  </div>
                </div>
                <button className="text-slate-500 hover:text-white" type="button">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0b0f1a]/30">
                {loadingMessages ? (
                  <p className="text-slate-500 text-xs italic">Chargement...</p>
                ) : messages.length === 0 ? (
                  <p className="text-slate-500 text-xs italic">Aucun message</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`flex ${m.from === 'seller' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                          m.from === 'seller'
                            ? 'bg-cyan-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p>{m.content}</p>
                        <p className="text-[9px] mt-1 opacity-60 text-right">
                          {new Date(m.createdAt).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                <div ref={bottomRef} />
              </div>

              <div className="p-4 bg-slate-800/20 border-t border-slate-800">
                <div className="flex gap-3">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Votre message ici..."
                    className="flex-1 bg-[#0b0f1a] border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    className="w-12 h-12 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-900/20 transition"
                    title="Envoyer"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={32} className="opacity-20" />
              </div>
              <p className="text-sm font-medium">Sélectionnez un client pour démarrer la discussion</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
