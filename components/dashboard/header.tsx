"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bell, MessageCircle, User, FileText, MessageSquare, Calendar, Briefcase, RefreshCw, LogOut } from "lucide-react"

interface Notification {
  id: number
  type: "application" | "message" | "interview" | "expiry" | "system"
  title: string
  description: string
  timestamp: string
  isUnread: boolean
}


const notifications: Notification[] = [
  {
    id: 1,
    type: "application",
    title: "New Application Received",
    description: "Emma Johnson applied for ICU Nurse — Night Shift.",
    timestamp: "2 hours ago",
    isUnread: true,
  },
  {
    id: 2,
    type: "message",
    title: "Candidate Message",
    description: "Michael sent you a message about General Ward Nurse.",
    timestamp: "1 day ago",
    isUnread: false,
  },
  {
    id: 3,
    type: "interview",
    title: "Interview scheduled",
    description: "Interview with Ria for Pediatric Nurse - Sep 12, 11:00 AM.",
    timestamp: "1 day ago",
    isUnread: false,
  },
  {
    id: 4,
    type: "expiry",
    title: "Job Posting About to Expire",
    description: 'Your posting "ER Nurse" will expire in 3 days.',
    timestamp: "3 day ago",
    isUnread: true,
  },
  {
    id: 5,
    type: "system",
    title: "System Update",
    description: "Dashboard updated for easier navigation.",
    timestamp: "3 day ago",
    isUnread: true,
  },
]

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "application":
      return FileText
    case "message":
      return MessageSquare
    case "interview":
      return Calendar
    case "expiry":
      return Briefcase
    case "system":
      return RefreshCw
    default:
      return Bell
  }
}

const getNotificationIconBg = (type: Notification["type"]) => {
  switch (type) {
    case "application":
      return "bg-orange-200" 
    case "message":
      return "bg-blue-200"
    case "interview":
      return "bg-purple-200"
    case "expiry":
      return "bg-pink-200"
    case "system":
      return "bg-green-200"
    default:
      return "bg-neutral-200"
  }
}

const getNotificationIconColor = (type: Notification["type"]) => {
  switch (type) {
    case "application":
      return "text-orange-600"
    case "message":
      return "text-blue-600"
    case "interview":
      return "text-purple-600"
    case "expiry":
      return "text-pink-600"
    case "system":
      return "text-green-600"
    default:
      return "text-neutral-600"
  }
}

// Function to generate initials from user name
const getInitials = (name: string): string => {
  if (!name) return "U"
  
  // Remove common prefixes and split into words
  const words = name
    .replace(/^(St\.|Mr\.|Mrs\.|Ms\.|Dr\.)\s+/i, "") // Remove titles
    .split(/\s+/)
    .filter(word => word.length > 0 && !word.match(/^(and|of|the|a|an)$/i)) // Filter out common words
  
  if (words.length === 0) return "U"
  
  // Get first letter of first two significant words
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  
  // If only one word, use first two letters
  return words[0].substring(0, 2).toUpperCase()
}

export function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const notificationsRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // User data - this would typically come from a context or API
  const userName = "St. Mary's NHS Trust" // Example: "NR SOMTHING" or "St. Mary's NHS Trust"
  const userInitials = getInitials(userName)

  // Unread message count - this would typically come from a context or API
  const unreadMessageCount = 3

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isNotificationsOpen || isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isNotificationsOpen, isUserMenuOpen])

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => n.isUnread)
    : notifications

  const unreadCount = notifications.filter(n => n.isUnread).length

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-50">
      <div className="my-2 mx-2 bg-white px-6 py-4 h-[65px] flex items-center justify-between border border-neutral-200 rounded-full shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="logo" width={40} height={40} className="w-36" />
        </div>
        <div className="flex items-center gap-4 relative">
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 hover:bg-neutral-100 rounded-full text-neutral-800 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Panel */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg border border-neutral-200 shadow-xl z-50 max-h-[600px] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">Notifications</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFilter("all")}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        filter === "all"
                          ? "bg-neutral-200 text-neutral-900 font-medium"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter("unread")}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        filter === "unread"
                          ? "bg-neutral-200 text-neutral-900 font-medium"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                    >
                      Unread
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-neutral-600">
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {filteredNotifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type)
                        const iconBg = getNotificationIconBg(notification.type)
                        const iconColor = getNotificationIconColor(notification.type)
                        
                        return (
                          <div
                            key={notification.id}
                            className="p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer mb-2 flex items-start gap-3 relative"
                          >
                            {/* Icon */}
                            <div className={`${iconBg} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-5 h-5 ${iconColor}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-neutral-900 mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-neutral-600 mb-1 line-clamp-2">
                                {notification.description}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {notification.timestamp}
                              </p>
                            </div>

                            {/* Unread Indicator */}
                            {notification.isUnread && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link href="/messages" className="relative">
            <button className="p-2 hover:bg-neutral-100 rounded-full text-neutral-800 transition-colors relative">
              <MessageCircle className="w-5 h-5" />
              {unreadMessageCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessageCount}
                </span>
              )}
            </button>
          </Link>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="p-2 hover:bg-[#D0ECFF] rounded-full text-neutral-800 border border-[#0576B8] bg-[#E9F7FF] transition-colors"
            >
              <User className="w-5 h-5 text-[#0576B8]" />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg border border-neutral-200 shadow-xl z-50">
                <div className="p-4 border-b border-neutral-200 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <span className="text-sky-600 font-semibold text-lg">{userInitials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{userName}</p>
                    <p className="text-xs text-neutral-600 mt-1">HR Manager</p>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      // TODO: Implement logout functionality
                      console.log("Logging out...")
                      setIsUserMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
