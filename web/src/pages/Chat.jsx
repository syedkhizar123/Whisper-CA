import { useAuth, UserButton, useUser } from '@clerk/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from "react-router"
import { useSocketStore } from '../lib/socket'
import { useSocketConnection } from '../hooks/socket'
import { useChats, useGetOrCreateChat } from '../hooks/useChats'
import { useMessages } from '../hooks/useMessages'
import { SparklesIcon, MessageSquareIcon, PlusIcon } from "lucide-react";
import { ChatListItem } from '../components/ChatListItem'

export const Chat = () => {
  const { signOut } = useAuth()
  const { user } = useUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeChatId = searchParams.get("chat")
  const [messageInput, setMessageInput] = useState("")
  const [newChatModalOpen, setNewChatModalOpen] = useState(false)

  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const { socket, setTyping, sendMessage } = useSocketStore()

  useSocketConnection()

  const { data: chats = [], isLoading: chatsLoading } = useChats()
  const { data: messages, isLoading: messagesLoading } = useMessages(activeChatId)
  const startChatMutation = useGetOrCreateChat()

  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behaviour: "smooth" })
  }, [activeChatId, messages])

  const handleStartChat = (participantId) => {
    startChatMutation.mutate(participantId, {
      onSuccess: (chat) => setSearchParams({ chat: chat._id })
    })
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !activeChatId || !socket || !user) return

    const text = messageInput.trim()
    sendMessage(activeChatId, text, user)
    setMessageInput("")
    setTyping(activeChatId, false)
  }

  const handleTyping = (e) => {
    setMessageInput(e.target.value)
    if (!activeChatId) return

    setTyping(activeChatId, true)
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(activeChatId, false)
    }, 2000)
  }

  // console.log("chats:", chats)
  // console.log("type:", typeof chats)
  const activeChat = chats?.find((c) => c._id === activeChatId)

  return (
    <div className='h-screen bg-base-100 text-base-content flex '>

      {/* Sidebar */}
      <div className='w-80 border-r border-base-300 flex flex-col bg-base-200'>

        {/* Header */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between mb-4">
            <Link to="/chat" className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-400
               to-orange-500 flex items-center justify-center"
              >
                <SparklesIcon className="w-4 h-4 text-primary-content" />
              </div>
              <span className="font-bold">Whisper</span>
            </Link>
            <UserButton />
          </div>
          <button
            onClick={() => setNewChatModalOpen(true)}
            className="btn btn-primary btn-block gap-2 rounded-xl bg-linear-to-r
             from-amber-500 to-orange-500 border-none"
          >
            <PlusIcon className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className='flex-1 overflow-y-auto'>
          {chatsLoading && (
            <div className='flex items-center justify-center py-8'>
              <span className='loading loading-spinner loading-sm text-amber-400' />
            </div>
          )}

          {chats?.length === 0 && !chatsLoading && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquareIcon className="w-10 h-10 text-amber-400 mb-3" />
              <p className="text-base-content/70 text-sm">No conversations yet</p>
              <p className="text-base-content/60 text-xs mt-1">Start a new chat to begin</p>
            </div>
          )}

          <div className='flex flex-col gap-1'>
            {chats?.map(chat => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                isACtive={activeChatId === chat._id}
                onClick={() => setSearchParams({ chat: chat._id })}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}


