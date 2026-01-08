
"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Search, User, Paperclip, Send, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, MessageSquare, File, Download, XCircle, Check, CheckCheck } from "lucide-react"
import createEcho from "@/lib/echo"
import apiMiddleware, { chatApi } from "@/lib/api"
import { useMessages } from "@/components/providers/message-provider"
import { format } from "date-fns"

interface Sender {
  id: number
  name: string // Adjust based on User model
  display_name?: string
  profile_photo_url?: string
}

interface ChatMessage {
  id: number
  conversation_id: number
  sender_id: number
  sender_type: string
  content: string | null
  attachment_path?: string | null
  attachment_name?: string | null
  attachment_type?: string | null
  attachment_size?: number | null
  attachment_url?: string | null
  is_image?: boolean
  read_at: string | null
  created_at: string
  sender?: {
    id: number
    name: string
  }
}

interface Conversation {
  id: number
  employer_id: number
  nurse_id: number
  job_post_id: number | null
  last_message_at: string
  created_at: string
  updated_at: string
  employer?: { user: Sender }
  nurse?: { user: Sender }
  last_message?: ChatMessage
  messages?: ChatMessage[]
  job_post?: { title: string }
  unread_messages_count?: number
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [echo, setEcho] = useState<any>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { decrementUnreadCount, setActiveConversationId, updateUnreadCount } = useMessages()

  // Sync active conversation ID with Provider
  useEffect(() => {
    setActiveConversationId(selectedConversation?.id || null)
  }, [selectedConversation, setActiveConversationId])

  const handleConversationSelect = async (conv: Conversation) => {
    setSelectedConversation(conv)

    // Optimistically clear unread count for this conversation
    if (conv.unread_messages_count && conv.unread_messages_count > 0) {
      decrementUnreadCount(conv.unread_messages_count)

      setConversations(prev => prev.map(c =>
        c.id === conv.id
          ? { ...c, unread_messages_count: 0 }
          : c
      ))

      // Call API to mark as read
      try {
        await chatApi.markAsRead(conv.id)
      } catch (error) {
        console.error("Failed to mark messages as read", error)
      }
    }
  }

  // Fetch user and conversations on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get current user ID (you might want a better way to get this, e.g. /api/user context)
        // For now, let's assume we can fetch user info or derive it.
        // Actually, let's fetch 'me' or just rely on the fact that 'You' is the current user.
        const userRes = await apiMiddleware.get('/user') // Standard Laravel Sanctum 'user' endpoint
        if (userRes.data?.data) { // Assuming wrapped response
          setUserId(userRes.data.data.id)
        } else if (userRes.data?.id) {
          setUserId(userRes.data.id)
        }

        const res = await apiMiddleware.get('/conversations')
        if (res.data?.success) {
          setConversations(res.data.data)
        }
      } catch (error) {
        console.error("Failed to fetch conversations", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()

  }, [userId])

  // Track selected conversation ID for listener
  const selectedConversationIdRef = useRef<number | null>(null)
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversation?.id || null
  }, [selectedConversation])

  // Initialize Echo
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      const echoInstance = createEcho(token)
      setEcho(echoInstance)

      // Listen for global message events to update conversation list for unread counts
      if (userId) {
        const channel = echoInstance.private(`user.${userId}`)
        channel.listen('MessageSent', (e: { message: ChatMessage, conversation_id: number }) => {
          setConversations(prev => {
            const updated = prev.map(c => {
              if (c.id === e.message.conversation_id) {
                // Determine if we should increment unread count
                const isFromUs = e.message.sender_id === userId
                // Check if this is the currently open conversation
                const isOpen = selectedConversationIdRef.current === c.id

                const increment = (!isFromUs && !isOpen) ? 1 : 0

                return {
                  ...c,
                  last_message: e.message,
                  last_message_at: e.message.created_at,
                  unread_messages_count: isOpen ? 0 : (c.unread_messages_count || 0) + increment
                }
              }
              return c
            })

            // Sort by last_message_at
            return updated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
          })
        })
      }

      return () => {
        if (userId) echoInstance.leave(`user.${userId} `)
        echoInstance.disconnect()
      }
    }
  }, [userId])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConversation) return

    const fetchMessages = async () => {
      try {
        const res = await apiMiddleware.get(`/conversations/${selectedConversation.id}`)
        if (res.data?.success) {
          setMessages(res.data.data.messages || [])
        }
      } catch (error) {
        console.error("Failed to fetch messages", error)
      }
    }

    fetchMessages()

    // Listen for new messages
    if (echo && userId) {
      const channel = echo.private(`conversation.${selectedConversation.id}`)
      channel.listen('MessageSent', (e: { message: ChatMessage }) => {
        setMessages(prev => {
          if (prev.find(m => m.id === e.message.id)) return prev
          return [...prev, e.message]
        })

        setConversations(prev => prev.map(c => {
          if (c.id === selectedConversation.id) {
            return {
              ...c,
              last_message: e.message,
              last_message_at: e.message.created_at
            }
          }
          return c
        }).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()))

        // If we receive a message in the currently open conversation, mark it as read immediately?
        // Or wait for user interaction? Usually immediately if focused.
        console.log("MessageSent received in Employer", e.message);
        if (e.message.sender_id !== userId) {
          console.log("Marking as read for conversation", selectedConversation.id);
          chatApi.markAsRead(selectedConversation.id)
            .then(() => console.log("Mark as read success"))
            .catch(err => console.error("Mark as read failed", err));
        } else {
          console.log("Sender is self, skipping mark as read");
        }
      })

      // Listen for read receipts
      channel.listen('.message.read', (e: { messageIds: number[], readAt: string, userId: number }) => {
        console.log("Event: MessageRead received", e);
        // Update messages state to show read status
        setMessages(prev => prev.map(msg => {
          if (e.messageIds.includes(msg.id)) {
            return { ...msg, read_at: e.readAt }
          }
          return msg
        }))
      })

      return () => {
        channel.stopListening('MessageSent')
        channel.stopListening('.message.read')
      }
    }

  }, [selectedConversation?.id, echo, userId])

  const handleSendMessage = async () => {
    if (!selectedConversation || (!messageText.trim() && !selectedFile)) return

    const text = messageText
    const file = selectedFile
    setMessageText("") // Optimistic clear
    setSelectedFile(null)

    try {
      const formData = new FormData()
      formData.append('conversation_id', selectedConversation.id.toString())
      if (text.trim()) {
        formData.append('content', text)
      }
      if (file) {
        formData.append('attachment', file)
      }

      const res = await apiMiddleware.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      if (res.data?.success) {
        const newMessage = res.data.data
        setMessages(prev => {
          if (prev.find(m => m.id === newMessage.id)) return prev
          return [...prev, newMessage]
        })

        setConversations(prev => prev.map(c => {
          if (c.id === selectedConversation.id) {
            return {
              ...c,
              last_message: newMessage,
              last_message_at: newMessage.created_at
            }
          }
          return c
        }).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()))
      }
    } catch (error) {
      console.error("Failed to send message", error)
      setMessageText(text) // Restore on error
      setSelectedFile(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Typing listener
  useEffect(() => {
    if (selectedConversation?.id && echo && userId) {
      const channel = echo.private(`conversation.${selectedConversation.id}`)

      channel.listenForWhisper('typing', (e: { user_id: number }) => {
        if (e.user_id !== userId) {
          setIsTyping(true)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000)
        }
      })

      return () => {
        channel.stopListeningForWhisper('typing')
      }
    }
  }, [selectedConversation?.id, echo, userId])

  // Handle typing broadcast
  const handleTyping = () => {
    if (selectedConversation?.id && echo && userId) {
      const channel = echo.private(`conversation.${selectedConversation.id}`)
      channel.whisper('typing', { user_id: userId })
    }
  }

  const filteredConversations = conversations.filter(c => {
    const otherParty = c.nurse?.user
    const name = otherParty?.display_name || otherParty?.name || "Unknown"
    return name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getOtherPartyName = (conv: Conversation) => {
    return conv.nurse?.user?.display_name || conv.nurse?.user?.name || "Nurse"
  }

  const getOtherPartyPhoto = (conv: Conversation) => {
    // Assuming backend provides this or we use a placeholder
    return conv.nurse?.user?.profile_photo_url || null
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden bg-white">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 md:w-96 flex flex-col border-r border-neutral-200 bg-white z-10">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-neutral-100">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Messages</h1>
                {(() => {
                  const unreadCount = conversations.reduce((count, conv) => {
                    return count + (conv.unread_messages_count || 0)
                  }, 0)
                  return unreadCount > 0 ? (
                    <div className="bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                      {unreadCount}
                    </div>
                  ) : null
                })()}
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-sky-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border-none rounded-2xl text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-sky-100 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto hover:overflow-y-overlay scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-3">
                  <div className="w-8 h-8 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin" />
                  <span className="text-xs text-neutral-400 font-medium">Loading chats...</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                  <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-3">
                    <User className="w-6 h-6 text-neutral-300" />
                  </div>
                  <p className="text-sm text-neutral-500 font-medium">No conversations found</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredConversations.map((conv) => {
                    const isSelected = selectedConversation?.id === conv.id;
                    const lastMessage = conv.last_message;
                    const time = conv.last_message_at ? format(new Date(conv.last_message_at), 'MMM d, h:mm a') : '';
                    const photo = getOtherPartyPhoto(conv);
                    const name = getOtherPartyName(conv);

                    return (
                      <button
                        key={conv.id}
                        onClick={() => handleConversationSelect(conv)}
                        className={`w-full p-3 flex items-start gap-3 rounded-2xl transition-all duration-200 group text-left ${isSelected
                          ? "bg-sky-50 shadow-sm ring-1 ring-sky-100"
                          : "hover:bg-neutral-50"
                          }`}
                      >
                        <div className="relative shrink-0">
                          {photo ? (
                            <img src={photo} alt={name} className="w-12 h-12 rounded-2xl object-cover shadow-sm bg-neutral-100" />
                          ) : (
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm ${isSelected ? 'bg-sky-200 text-sky-700' : 'bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-500'}`}>
                              {name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {/* Online Status Indicator (Mock) */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <span className={`font-semibold truncate text-sm ${isSelected ? "text-neutral-900" : "text-neutral-700"
                              }`}>
                              {name}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[10px] font-medium ${isSelected ? "text-sky-600" : "text-neutral-400 group-hover:text-neutral-500"
                                }`}>
                                {time}
                              </span>
                              {conv.unread_messages_count && conv.unread_messages_count > 0 ? (
                                <div className="bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                  {conv.unread_messages_count}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <p className={`text-xs line-clamp-1 break-all ${isSelected ? "text-sky-700 font-medium" : "text-neutral-500"
                            }`}>
                            {lastMessage?.sender_id === userId && <span className="mr-1">You:</span>}
                            {lastMessage?.content || "No messages yet"}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="h-[73px] px-6 border-b border-neutral-200 bg-white/80 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {getOtherPartyName(selectedConversation).charAt(0)}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-neutral-900 leading-tight">
                        {getOtherPartyName(selectedConversation)}
                      </h2>
                      {isTyping ? (
                        <p className="text-xs text-sky-500 font-medium flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-sky-500 animate-pulse"></span>
                          typing...
                        </p>
                      ) : selectedConversation.job_post && (
                        <p className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                          {selectedConversation.job_post.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-neutral-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all">
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col space-y-4 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-neutral-400" />
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900 mb-2">No messages yet</h3>
                      <p className="text-neutral-500 max-w-xs text-center text-sm">
                        Start the conversation with <span className="font-semibold text-neutral-900">{getOtherPartyName(selectedConversation)}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      {messages.map((msg, idx) => {
                        const isYou = msg.sender_id === userId;
                        const isLast = idx === messages.length - 1;
                        const showAvatar = !isYou && (idx === 0 || messages[idx - 1].sender_id !== msg.sender_id);

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col gap-1 max-w-[75%] ${isYou ? "self-end items-end" : "self-start items-start"}`}
                          >
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm ${isYou
                                ? "bg-sky-500 text-white rounded-br-sm"
                                : "bg-white text-neutral-800 border border-neutral-200 rounded-bl-sm shadow-sm"
                                }`}
                            >
                              {msg.content && <div>{msg.content}</div>}
                              {msg.attachment_url && (
                                <div className={msg.content ? "mt-2" : ""}>
                                  {msg.is_image ? (
                                    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                                      <img
                                        src={msg.attachment_url}
                                        alt={msg.attachment_name || 'Image'}
                                        className="max-w-full max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      />
                                    </a>
                                  ) : (
                                    <a
                                      href={msg.attachment_url}
                                      download={msg.attachment_name}
                                      className={`flex items-center gap-2 p-2 rounded-lg ${isYou ? 'bg-sky-600 hover:bg-sky-700' : 'bg-neutral-100 hover:bg-neutral-200'} transition-colors`}
                                    >
                                      <File className="w-4 h-4" />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium truncate">{msg.attachment_name}</div>
                                        {msg.attachment_size && (
                                          <div className={`text-[10px] ${isYou ? 'text-sky-100' : 'text-neutral-500'}`}>
                                            {formatFileSize(msg.attachment_size)}
                                          </div>
                                        )}
                                      </div>
                                      <Download className="w-3.5 h-3.5 flex-shrink-0" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 mt-1 block text-right flex items-center justify-end gap-1">
                              {format(new Date(msg.created_at), "h:mm a")}
                              {msg.sender_id === userId && (
                                <span>
                                  {msg.read_at ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-neutral-400" />
                                  )}
                                </span>
                              )}
                            </span>
                          </div>
                        )
                      })}
                      {isTyping && (
                        <div className="self-start flex items-center gap-1 ml-2 mb-2">
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                        </div>
                      )}
                      <div ref={messagesEndRef} className="h-4" />
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-neutral-100">
                  {selectedFile && (
                    <div className="max-w-4xl mx-auto mb-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
                      {selectedFile.type.startsWith('image/') ? (
                        <ImageIcon className="w-5 h-5 text-sky-500" />
                      ) : (
                        <File className="w-5 h-5 text-sky-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{selectedFile.name}</div>
                        <div className="text-xs text-neutral-500">{formatFileSize(selectedFile.size)}</div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="p-1.5 hover:bg-neutral-200 rounded-full transition-colors"
                      >
                        <XCircle className="w-5 h-5 text-neutral-500" />
                      </button>
                    </div>
                  )}
                  <div className="max-w-4xl mx-auto relative bg-neutral-50 border border-neutral-200 rounded-[24px] focus-within:ring-2 focus-within:ring-sky-100 focus-within:border-sky-300 transition-all shadow-sm">
                    <textarea
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value)
                        handleTyping()
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="Type your message..."
                      className="w-full max-h-32 min-h-[56px] py-4 pl-5 pr-32 bg-transparent text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none resize-none"
                      style={{ height: '56px' }}
                    />

                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-neutral-400 hover:text-sky-500 hover:bg-neutral-200/50 rounded-full transition-colors"
                        type="button"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() && !selectedFile}
                        className="h-10 px-5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:hover:bg-sky-600 text-white rounded-full text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
                      >
                        Send
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-[10px] text-neutral-400">Press Enter to send, Shift + Enter for new line</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] text-center p-8">
                <div className="w-48 h-48 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center mb-8 relative group cursor-pointer hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-tr from-sky-50/50 to-indigo-50/50 rounded-full opacity-50 blur-2xl group-hover:blur-3xl transition-all"></div>
                  <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-sky-100 to-indigo-100 rounded-3xl rotate-12 group-hover:rotate-6 transition-transform duration-500 flex items-center justify-center shadow-inner">
                    <MessageSquare className="w-10 h-10 text-sky-600" />
                  </div>
                  <div className="absolute top-10 right-10 w-12 h-12 bg-white rounded-2xl -rotate-6 group-hover:-rotate-12 transition-transform duration-500 shadow-lg flex items-center justify-center z-20">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight">Your Messages</h2>
                <p className="text-neutral-500 max-w-sm mx-auto leading-relaxed mb-8">
                  Select a conversation from the sidebar to view history, share files, and communicate with candidates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
