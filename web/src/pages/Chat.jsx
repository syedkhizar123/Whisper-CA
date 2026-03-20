import { useAuth, useUser } from '@clerk/react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from "react-router"
import { useSocketStore } from '../lib/socket'
import { useSocketConnection } from '../hooks/socket'
import { useChats, useGetOrCreateChat } from '../hooks/useChats'
import { useMessages } from '../hooks/useMessages'

export const Chat = () => {
  const { signOut } = useAuth()
  const { user } = useUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeChatId = searchParams.get("chat")
  const [messageInput, setMessageInput] = useState("")
  const [newChatModalOpen, setNewChatModalOpen] = useState(false)

  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const { socket , setTyping, sendMessage} = useSocketStore()

  useSocketConnection()

  const { data: chats , isLoading : chatsLoading} = useChats()
  const { data: messages , isLoading : messagesLoading} = useMessages(activeChatId)
  const startChatMutation = useGetOrCreateChat()

  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behaviour: "smooth"})
  } , [activeChatId , messages])

  const handleStartChat = (participantId) => {
    startChatMutation.mutate(participantId , {
      onSuccess: (chat) => setSearchParams({ chat: chat._id})
    })
  }

  const handleSend = (e) => {
    e.preventDefault()
    if(!messageInput.trim() || !activeChatId || !socket || !user) return

    const text = messageInput.trim()
    sendMessage(activeChatId , text , user)
    setMessageInput("")
    setTyping(activeChatId , false)
  }

  const handleTyping = (e) => {
    setMessageInput(e.target.value)
    if (!activeChatId) return

    setTyping(activeChatId , true)
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(activeChatId, false)
    } , 2000)
  }

  const activeChat = chats.find((c) => c._id === activeChatId)

  return (
    <div>
      <h1>Chat Page</h1>
      <button onClick={signOut} className='btn btn-primary'>
        Sign Out
      </button>
    </div>
  )
}


