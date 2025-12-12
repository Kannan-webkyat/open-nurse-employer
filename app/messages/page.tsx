"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Search, User, Paperclip, Send, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Bold, Italic, Underline, Strikethrough } from "lucide-react"

interface Message {
  id: number
  senderName: string
  snippet: string
  date: string
  isUnread: boolean
  jobAppliedFor?: string
  messages: {
    id: number
    sender: string
    text: string
    timestamp: string
  }[]
}

const messages: Message[] = [
  {
    id: 1,
    senderName: "Emma Johnson",
    snippet: "Hello, I applied for the ICU Nurse position...",
    date: "Aug 12",
    isUnread: false,
    jobAppliedFor: "ICU Nurse — Night Shift",
    messages: [
      {
        id: 1,
        sender: "Emma Johnson",
        text: "Hello, I'm very interested in this role. Could you please share more about the shift timings?",
        timestamp: "Aug 08 2025, 2:30pm",
      },
    ],
  },
  {
    id: 2,
    senderName: "Michael Lee",
    snippet: "I have 3 years of pediatric experience. Is this...",
    date: "Aug 08",
    isUnread: false,
    jobAppliedFor: "Pediatric Nurse",
    messages: [],
  },
  {
    id: 3,
    senderName: "David Wilson",
    snippet: "Can you confirm if this is a permanent or ...",
    date: "Aug 12",
    isUnread: true,
    jobAppliedFor: "General Ward Nurse",
    messages: [],
  },
  {
    id: 4,
    senderName: "Emma Johnson",
    snippet: "Hello, I applied for the ICU Nurse position...",
    date: "Aug 08",
    isUnread: false,
    jobAppliedFor: "ICU Nurse — Night Shift",
    messages: [],
  },
  {
    id: 5,
    senderName: "David Wilson",
    snippet: "Can you confirm if this is a permanent or ...",
    date: "Aug 08",
    isUnread: true,
    jobAppliedFor: "General Ward Nurse",
    messages: [],
  },
  {
    id: 6,
    senderName: "David Wilson",
    snippet: "Can you confirm if this is a permanent or ...",
    date: "Aug 12",
    isUnread: true,
    jobAppliedFor: "General Ward Nurse",
    messages: [],
  },
  {
    id: 7,
    senderName: "Michael Lee",
    snippet: "I have 3 years of pediatric experience. Is this...",
    date: "Aug 08",
    isUnread: false,
    jobAppliedFor: "Pediatric Nurse",
    messages: [],
  },
  {
    id: 8,
    senderName: "Michael Lee",
    snippet: "I have 3 years of pediatric experience. Is this...",
    date: "Aug 08",
    isUnread: false,
    jobAppliedFor: "Pediatric Nurse",
    messages: [],
  },
  {
    id: 9,
    senderName: "Michael Lee",
    snippet: "I have 3 years of pediatric experience. Is this...",
    date: "Aug 08",
    isUnread: false,
    jobAppliedFor: "Pediatric Nurse",
    messages: [],
  },
]

export default function MessagesPage() {
  const [messageTab, setMessageTab] = useState<"inbox" | "unread" | "archived" | "spam">("inbox")
  const [messageSearch, setMessageSearch] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(messages[0])
  const [messageText, setMessageText] = useState("Hi Emma\n\nThank you for applying. The shift runs from 7 PM — 7 AM. Would that work for you?")

  const filteredMessages = (() => {
    let filtered = messages
    if (messageTab === "unread") {
      filtered = filtered.filter(m => m.isUnread)
    }
    if (messageSearch) {
      filtered = filtered.filter(m => 
        m.senderName.toLowerCase().includes(messageSearch.toLowerCase()) ||
        m.snippet.toLowerCase().includes(messageSearch.toLowerCase())
      )
    }
    return filtered
  })()

  const handleSendMessage = () => {
    if (!selectedMessage || !messageText.trim()) return
    
    // Add the new message to the conversation
    const newMessage = {
      id: selectedMessage.messages.length + 1,
      sender: "You",
      text: messageText,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
    }
    
    // Update the selected message with the new message
    const updatedMessage = {
      ...selectedMessage,
      messages: [...selectedMessage.messages, newMessage],
    }
    
    // Update the messages array
    const messageIndex = messages.findIndex(m => m.id === selectedMessage.id)
    if (messageIndex !== -1) {
      messages[messageIndex] = updatedMessage
      setSelectedMessage(updatedMessage)
    }
    
    // Clear the input
    setMessageText("")
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-93px)] flex bg-neutral-50">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-neutral-200 flex flex-col shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-neutral-200 bg-white">
            <h1 className="text-2xl font-bold text-neutral-900 mb-6">Messages</h1>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {(["inbox", "unread", "archived", "spam"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMessageTab(tab)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-all capitalize font-medium ${
                    messageTab === tab
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-neutral-300 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Message List */}
          <div className="overflow-y-auto flex-1">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-neutral-600">
                <p className="text-sm">No messages</p>
              </div>
            ) : (
              <div>
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message)
                      setMessageText("")
                    }}
                    className={`p-4 border-b border-neutral-100 cursor-pointer transition-all ${
                      selectedMessage?.id === message.id 
                        ? "bg-sky-50 border-l-4 border-l-sky-600" 
                        : "hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        selectedMessage?.id === message.id 
                          ? "bg-sky-100" 
                          : "bg-neutral-200"
                      }`}>
                        <User className={`w-5 h-5 ${
                          selectedMessage?.id === message.id 
                            ? "text-sky-600" 
                            : "text-neutral-600"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className={`text-sm font-semibold truncate ${
                            selectedMessage?.id === message.id 
                              ? "text-sky-900" 
                              : "text-neutral-900"
                          }`}>
                            {message.senderName}
                          </p>
                          {message.isUnread && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5 ml-2"></div>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 line-clamp-2 mb-1">{message.snippet}</p>
                        <p className="text-xs text-neutral-500">{message.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat View */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {selectedMessage ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-neutral-200 flex items-center gap-4 bg-white flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-neutral-900 truncate">{selectedMessage.senderName}</p>
                  <p className="text-sm text-neutral-600 truncate">Applied for: {selectedMessage.jobAppliedFor}</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-neutral-50 min-h-0">
                {selectedMessage.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-neutral-600">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-neutral-400" />
                      </div>
                      <p className="text-sm font-medium text-neutral-900 mb-1">No messages yet</p>
                      <p className="text-xs text-neutral-600">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl">
                    {selectedMessage.messages.map((msg) => {
                      const isYou = msg.sender === "You"
                      return (
                        <div key={msg.id} className={`flex items-start gap-3 ${isYou ? "flex-row-reverse" : ""}`}>
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isYou ? "bg-sky-600" : "bg-neutral-200"
                          }`}>
                            <User className={`w-5 h-5 ${isYou ? "text-white" : "text-neutral-600"}`} />
                          </div>
                          <div className={`flex-1 min-w-0 ${isYou ? "flex items-end flex-col" : ""}`}>
                            <div className={`rounded-2xl p-4 shadow-sm ${
                              isYou 
                                ? "bg-sky-600 text-white rounded-br-sm" 
                                : "bg-white text-neutral-900 rounded-bl-sm border border-neutral-200"
                            }`}>
                              <p className={`text-sm whitespace-pre-wrap break-words ${
                                isYou ? "text-white" : "text-neutral-900"
                              }`}>
                                {msg.text}
                              </p>
                            </div>
                            <p className={`text-xs mt-1.5 px-1 ${isYou ? "text-right" : "text-left"} text-neutral-500`}>
                              {msg.timestamp}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-neutral-200 bg-white flex-shrink-0">
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1.5 mb-4 pb-4 border-b border-neutral-200 overflow-x-auto">
                  <select className="text-xs border border-neutral-300 rounded-md px-2 py-1.5 bg-white hover:bg-neutral-50 transition-colors">
                    <option>14</option>
                  </select>
                  <select className="text-xs border border-neutral-300 rounded-md px-2 py-1.5 bg-white hover:bg-neutral-50 transition-colors">
                    <option>T</option>
                  </select>
                  <div className="w-px h-5 bg-neutral-300 mx-1"></div>
                  <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors">
                    <Bold className="w-4 h-4 text-neutral-600" />
                  </button>
                  <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors">
                    <Italic className="w-4 h-4 text-neutral-600" />
                  </button>
                  <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors">
                    <Underline className="w-4 h-4 text-neutral-600" />
                  </button>
                  <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors">
                    <Strikethrough className="w-4 h-4 text-neutral-600" />
                  </button>
                  <div className="w-px h-5 bg-neutral-300 mx-1"></div>
                  <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors">
                    <AlignLeft className="w-4 h-4 text-neutral-600" />
                  </button>
                  <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors">
                    <AlignCenter className="w-4 h-4 text-neutral-600" />
                  </button>
                  <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors">
                    <AlignRight className="w-4 h-4 text-neutral-600" />
                  </button>
                  <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors">
                    <AlignJustify className="w-4 h-4 text-neutral-600" />
                  </button>
                  <div className="w-px h-5 bg-neutral-300 mx-1"></div>
                  <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors">
                    <List className="w-4 h-4 text-neutral-600" />
                  </button>
                  <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors">
                    <ListOrdered className="w-4 h-4 text-neutral-600" />
                  </button>
                  <div className="w-px h-5 bg-neutral-300 mx-1"></div>
                  <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors">
                    <ImageIcon className="w-4 h-4 text-neutral-600" />
                  </button>
                  <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors">
                    <LinkIcon className="w-4 h-4 text-neutral-600" />
                  </button>
                </div>

                {/* Input Area */}
                <div className="flex items-end gap-3">
                  <button className="p-2.5 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0">
                    <Paperclip className="w-5 h-5 text-neutral-600" />
                  </button>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 min-h-[100px] max-h-[200px] p-4 border border-neutral-300 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent focus:bg-white resize-none text-sm transition-colors"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-sky-600 text-white px-6 py-3 rounded-full hover:bg-sky-700 transition-colors flex items-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <span>Sent Messages</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-600 bg-neutral-50">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-neutral-200 flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-neutral-400" />
                </div>
                <p className="text-base font-medium text-neutral-900 mb-1">Select a message to view</p>
                <p className="text-sm text-neutral-600">Choose a conversation from the list</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
