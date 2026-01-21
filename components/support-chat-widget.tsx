'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Paperclip, Minimize2, File, Download, XCircle, Image as ImageIcon, Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supportChatApi } from '@/lib/api'
import { useEcho } from '@/components/providers/echo-provider'
import { format } from 'date-fns'

interface SupportMessage {
  id: number
  support_conversation_id: number
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

interface SupportConversation {
  id: number
  user_id: number
  support_user_id: number | null
  user_type: string
  subject: string | null
  status: string
  last_message_at: string | null
  created_at: string
  updated_at: string
  user?: { id: number; name: string }
  support_user?: { id: number; name: string }
  last_message?: SupportMessage
}

export function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [userId, setUserId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [totalUnreadCount, setTotalUnreadCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const { echo } = useEcho()

  // Fetch user on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setIsAuthenticated(false)
        setUserId(null)
        return
      }
      setIsAuthenticated(true)

      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/employer/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
        if (userRes.ok) {
          const userData = await userRes.json()
          if (userData.data?.id) {
            setUserId(userData.data.id)
          }
        } else {
          // Handle non-ok response (e.g., 401)
          setIsAuthenticated(false)
          setUserId(null)
        }
      } catch (error: any) {
        console.error('Failed to fetch initial chat data', error)
        setIsAuthenticated(false)
        setUserId(null)
      }
    }

    fetchUserData()

    // Listen for auth changes
    const handleAuthChange = () => {
      fetchUserData()
    }

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        fetchUserData()
      }
    }

    window.addEventListener('authChanged', handleAuthChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('authChanged', handleAuthChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Fetch unread count ONLY when chat is closed
  useEffect(() => {
    if (isAuthenticated && !isOpen && userId) {
      const fetchUnreadCount = async () => {
        try {
          const countRes = await supportChatApi.getUnreadCount()
          if (countRes.success) {
            setTotalUnreadCount(countRes.data?.count || 0)
          }
        } catch (e) {
          console.error('Failed to fetch unread count', e)
        }
      }
      fetchUnreadCount()
    } else if (isOpen) {
      // Clear count when chat is opened
      setTotalUnreadCount(0)
    }
  }, [isOpen, isAuthenticated, userId])

  // Listen for new messages ONLY when chat is closed
  useEffect(() => {
    if (echo && userId && !isOpen) {
      const userChannel = echo.private(`user.${userId}`)
      
      const handleMessage = (e: { message: SupportMessage }) => {
        // Only increment if message is from support
        if (e.message.sender_id !== userId) {
          setTotalUnreadCount((prev) => prev + 1)
        }
      }

      userChannel.listen('SupportMessageSent', handleMessage)

      return () => {
        userChannel.stopListening('SupportMessageSent', handleMessage)
      }
    }
  }, [echo, userId, isOpen])

  // Fetch conversation and messages when opened
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      const fetchConversation = async () => {
        setIsLoading(true)
        try {
          const res = await supportChatApi.getConversation()
          if (res.success && res.data) {
            setConversation(res.data)
            // Fetch messages
            const messagesRes = await supportChatApi.getMessages(res.data.id)
            if (messagesRes.success && messagesRes.data?.messages) {
              setMessages(messagesRes.data.messages)
              
              // Count unread messages before marking as read
              const unreadCount = messagesRes.data.messages.filter(
                (msg: SupportMessage) => Number(msg.sender_id) !== Number(userId) && !msg.read_at
              ).length
              
              // Mark messages as read when opening conversation
              supportChatApi.markAsRead(res.data.id).then(() => {
                // Immediately update local state to show read status
                const now = new Date().toISOString()
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (Number(msg.sender_id) !== Number(userId) && !msg.read_at) {
                      return { ...msg, read_at: now }
                    }
                    return msg
                  })
                )
              }).catch((err) => {
                console.error('Failed to mark as read', err)
              })
            }
          }
        } catch (e) {
          console.error('Failed to fetch conversation', e)
        } finally {
          setIsLoading(false)
        }
      }
      fetchConversation()
    }
  }, [isOpen, isAuthenticated])



  // Listen for new messages
  useEffect(() => {
    if (conversation && echo && userId && isOpen) {
      const channel = echo.private(`support-conversation.${conversation.id}`)
      
      // Listen for new messages
      channel.listen('SupportMessageSent', (e: { message: SupportMessage }) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === e.message.id)) return prev
          return [...prev, e.message]
        })
        // Mark as read if message is from support and chat is open
        if (e.message.sender_id !== userId) {
          if (markAsReadTimeoutRef.current) clearTimeout(markAsReadTimeoutRef.current)
          markAsReadTimeoutRef.current = setTimeout(() => {
            supportChatApi.markAsRead(conversation.id).then(() => {
              // Immediately update local state to show read status
              const now = new Date().toISOString()
              setMessages((prev) =>
                prev.map((msg) => {
                  if (Number(msg.sender_id) !== Number(userId) && !msg.read_at) {
                    return { ...msg, read_at: now }
                  }
                  return msg
                })
              )
              // Count is cleared when chat opens, no need to decrement
            }).catch((err) => {
              console.error('Failed to mark as read', err)
            })
          }, 500) // Debounce to avoid too many API calls
        }
      })

      // Listen for typing indication
      channel.listenForWhisper('typing', (e: { user_id: number }) => {
        if (Number(e.user_id) !== Number(userId)) {
          setIsTyping(true)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000)
        }
      })

      // Listen for read status updates
      channel.listen('support.message.read', (e: { messageIds: number[]; readAt: string; userId: number }) => {
        // Only update if the read was done by the other party (not by us)
        if (Number(e.userId) !== Number(userId)) {
          setMessages((prev) =>
            prev.map((msg) => {
              // Check if message ID matches (handle both string and number comparisons)
              const msgId = Number(msg.id)
              if (e.messageIds.includes(msgId)) {
                return { ...msg, read_at: e.readAt }
              }
              return msg
            })
          )
        }
      })

      // Also listen to user channel for unread updates but filtering for this conversation
      const userChannel = echo.private(`user.${userId}`)
      userChannel.listen('SupportMessageSent', (e: { message: SupportMessage }) => {
        if (e.message.support_conversation_id === conversation.id) {
            // Logic handled by the specific conversation listener mostly, but duplicate check safe
            setMessages((prev) => {
            if (prev.find((m) => m.id === e.message.id)) return prev
            return [...prev, e.message]
          })
        }
      })

      return () => {
        channel.stopListening('SupportMessageSent')
        channel.stopListeningForWhisper('typing')
        channel.stopListening('support.message.read')
        userChannel.stopListening('SupportMessageSent')
      }
    }
  }, [conversation, echo, userId, isOpen])

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle typing input
  const handleTyping = () => {
    if (conversation && echo && userId) {
      const channel = echo.private(`support-conversation.${conversation.id}`)
      channel.whisper('typing', { user_id: userId })
    }
  }

  const handleSendMessage = async () => {
    if (!conversation || (!replyText.trim() && !selectedFile)) return

    const text = replyText
    const file = selectedFile
    setReplyText('')
    setSelectedFile(null)

    try {
      const res = await (supportChatApi as any).sendMessage(conversation.id, text, file || undefined)
      if (res.success && res.data) {
        const newMessage = res.data
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev
          return [...prev, newMessage]
        })
      }
    } catch (error) {
      console.error('Failed to send', error)
      setReplyText(text)
      setSelectedFile(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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

  const getSupportName = () => {
    if (conversation?.support_user) {
      return conversation.support_user.name
    }
    return 'Support Team'
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-[60] bottom-8 right-8 bg-gradient-to-r from-sky-500 to-indigo-600 text-white p-4 rounded-full shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-105 transition-all duration-300 group flex items-center gap-2"
        aria-label="Open Support Chat"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6 fill-current" />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm border border-white">
              {totalUnreadCount}
            </span>
          )}
        </div>
      </button>
    )
  }

  if (!isAuthenticated) {
    return (
      <div
        ref={widgetRef}
        className="fixed z-[60] bottom-8 right-8 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <h3 className="text-lg font-bold text-neutral-900 pl-2">Support Chat</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-600"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-neutral-50/50">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-2">Please Log In</h3>
          <p className="text-neutral-500 text-sm mb-6">You need to be logged in to access support chat.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={widgetRef}
      className="fixed z-[60] bottom-8 right-8 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {getSupportName().charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-neutral-900 truncate max-w-[150px]">{getSupportName()}</h3>
            {isTyping ? (
              <span className="text-[10px] text-sky-500 font-medium animate-pulse block">
                typing...
              </span>
            ) : (
              <span className="text-[10px] text-neutral-500">Support Team</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-600"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col space-y-4 bg-neutral-50/50">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-xs text-neutral-400">Start the conversation with our support team</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === userId
            return (
              <div key={msg.id} className={`flex flex-col gap-1 max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-sky-500 text-white rounded-br-sm' : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-sm shadow-sm'}`}
                >
                  {msg.content && <div>{msg.content}</div>}
                  {msg.attachment_url && (
                    <div className="mt-2">
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
                          className={`flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-sky-600 hover:bg-sky-700' : 'bg-neutral-100 hover:bg-neutral-200'} transition-colors`}
                        >
                          <File className="w-4 h-4" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{msg.attachment_name}</div>
                            {msg.attachment_size && (
                              <div className={`text-[10px] ${isMe ? 'text-sky-100' : 'text-neutral-500'}`}>
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
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-neutral-400">{format(new Date(msg.created_at), 'h:mm a')}</span>
                  {isMe && (msg.read_at ? <CheckCheck className="w-3.5 h-3.5 text-sky-500" /> : <Check className="w-3.5 h-3.5 text-neutral-400" />)}
                </div>
              </div>
            )
          })
        )}
        {isTyping && (
          <div className="self-start flex items-center gap-1 ml-2 mb-2">
            <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-neutral-100 shrink-0">
        {selectedFile && (
          <div className="mb-2 p-2 bg-neutral-50 rounded-lg flex items-center gap-2">
            {selectedFile.type.startsWith('image/') ? (
              <ImageIcon className="w-4 h-4 text-sky-500" />
            ) : (
              <File className="w-4 h-4 text-sky-500" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{selectedFile.name}</div>
              <div className="text-[10px] text-neutral-500">{formatFileSize(selectedFile.size)}</div>
            </div>
            <button onClick={handleRemoveFile} className="p-1 hover:bg-neutral-200 rounded-full transition-colors">
              <XCircle className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
        )}
        <div className="relative flex gap-2">
          <input ref={fileInputRef} type="file" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500 hover:text-sky-500"
            type="button"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <Textarea
            value={replyText}
            onChange={(e) => {
              setReplyText(e.target.value)
              handleTyping()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Write a message..."
            className="flex-1 min-h-[45px] py-3 text-sm resize-none rounded-xl"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!replyText.trim() && !selectedFile}
            className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:bg-neutral-200 transition-colors self-end"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
