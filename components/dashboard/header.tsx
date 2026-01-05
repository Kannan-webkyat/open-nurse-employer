"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, MessageCircle, User, FileText, MessageSquare, Calendar, Briefcase, RefreshCw, LogOut } from "lucide-react"
import { authApi, employerProfileApi } from "@/lib/api"
import { notificationApi } from "@/lib/api/notifications" // Correct import
import { useNotifications } from "@/components/providers/notification-provider"

interface Notification {
  id: string
  type: "application" | "message" | "interview" | "expiry" | "system"
  title: string
  description: string
  timestamp: string
  isUnread: boolean
  data?: any
}

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
  const router = useRouter()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Notification State
  const [notifications, setDesktopNotifications] = useState<Notification[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)

  const [userData, setUserData] = useState<{
    companyName: string
    hiringPersonName: string
    userName: string
    userInitials: string
    companyLogo: string | null
  } | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [buttonImageError, setButtonImageError] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Real-time updates
  const { notifications: realtimeNotifications } = useNotifications()

  // Unread message count - this would typically come from a context or API
  const unreadMessageCount = 3

  // Fetch user data function - using useCallback to avoid dependency issues
  const fetchUserData = useCallback(async () => {
    try {
      setImageError(false) // Reset image error state
      setButtonImageError(false) // Reset button image error state
      const response = await employerProfileApi.getProfile()
      if (response.success && response.data) {
        const user = response.data as any
        const employer = user.employer || {}

        // Get company name or fallback to user name
        const companyName = employer.company_name || user.name || 'Company'
        const hiringPersonName = employer.hiring_person_name || user.name || 'User'

        // Use company name for display, fallback to hiring person name
        const displayName = companyName || hiringPersonName

        // Construct company logo URL if exists
        let companyLogoUrl = null
        if (employer.company_logo) {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
          companyLogoUrl = `${apiBaseUrl}/storage/${employer.company_logo}`
          // Add timestamp to force refresh if image was just updated
          companyLogoUrl += `?t=${Date.now()}`
        }

        setUserData({
          companyName: companyName,
          hiringPersonName: hiringPersonName,
          userName: displayName,
          userInitials: getInitials(displayName),
          companyLogo: companyLogoUrl
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      // Set fallback values
      setUserData({
        companyName: 'Company',
        hiringPersonName: 'User',
        userName: 'User',
        userInitials: 'U',
        companyLogo: null
      })
    } finally {
      setIsLoadingUser(false)
    }
  }, [])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationApi.getNotifications()
      if (response.success && Array.isArray(response.data?.data)) {
        // response.data used to be the paginated object if using Laravel paginate
        setDesktopNotifications(response.data.data)
      } else if (response.success && Array.isArray(response.data)) {
        setDesktopNotifications(response.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }, [])

  // Mark as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }

    try {
      await notificationApi.markAsRead(id)
      setDesktopNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, isUnread: false } : n
      ))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Handle incoming real-time notifications
  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      // Refresh full list to keep sync or append locally
      fetchNotifications()
    }
  }, [realtimeNotifications, fetchNotifications])

  // Initial fetch
  useEffect(() => {
    fetchUserData()
    fetchNotifications()
  }, [fetchUserData, fetchNotifications])

  // Listen for profile update events to refresh header data
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('Profile updated event received, refreshing header...')
      fetchUserData()
    }

    // Listen for custom event when profile is updated
    window.addEventListener('profileUpdated', handleProfileUpdate)

    // Listen for custom event to open notification panel
    const handleOpenPanel = () => {
      setIsNotificationsOpen(true)
    }
    window.addEventListener('open-notification-panel', handleOpenPanel)

    // Also refresh when window regains focus (user might have updated profile in another tab)
    const handleFocus = () => {
      fetchUserData()
      fetchNotifications() // also refresh notifications
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate)
      window.removeEventListener('open-notification-panel', handleOpenPanel)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchUserData, fetchNotifications])

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
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${filter === "all"
                        ? "bg-neutral-200 text-neutral-900 font-medium"
                        : "text-neutral-600 hover:text-neutral-900"
                        }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter("unread")}
                      className={`px-3 py-1 text-sm rounded transition-colors ${filter === "unread"
                        ? "bg-neutral-200 text-neutral-900 font-medium"
                        : "text-neutral-600 hover:text-neutral-900"
                        }`}
                    >
                      Unread
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          setIsLoadingNotifications(true)
                          await notificationApi.deleteRead()
                          await fetchNotifications()
                        } catch (error) {
                          console.error('Error clearing read notifications:', error)
                        } finally {
                          setIsLoadingNotifications(false)
                        }
                      }}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                      title="Clear all read notifications"
                    >
                      Clear Read
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {isLoadingNotifications ? (
                    <div className="p-8 text-center text-neutral-600">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-r-transparent"></div>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
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
                            className={`p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer mb-2 flex items-start gap-3 relative ${notification.isUnread ? 'bg-blue-50/50' : ''}`}
                            onClick={(e) => {
                              if (notification.isUnread) {
                                handleMarkAsRead(notification.id, e)
                              }
                              if (notification.type === 'application') {
                                setIsNotificationsOpen(false)
                                router.push('/candidates')
                              }
                            }}
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
                              <button
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2 hover:scale-150 transition-transform"
                                title="Mark as read"
                              ></button>
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
              className="p-0 hover:opacity-80 rounded-full text-neutral-800 border-2 border-[#0576B8] bg-[#E9F7FF] transition-all overflow-hidden w-10 h-10 flex items-center justify-center"
            >
              {isLoadingUser ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
              ) : userData?.companyLogo && !buttonImageError ? (
                <Image
                  src={userData.companyLogo}
                  alt={userData.companyName || 'Company Logo'}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                  unoptimized
                  onError={(e) => {
                    console.error('Failed to load company logo in button:', userData.companyLogo)
                    setButtonImageError(true)
                  }}
                />
              ) : (
                <User className="w-5 h-5 text-[#0576B8]" />
              )}
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg border border-neutral-200 shadow-xl z-50">
                <div className="p-4 border-b border-neutral-200 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-sky-200">
                    {isLoadingUser ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
                    ) : userData?.companyLogo && !imageError ? (
                      <Image
                        src={userData.companyLogo}
                        alt={userData.companyName || 'Company Logo'}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-full"
                        unoptimized
                        onError={(e) => {
                          console.error('Failed to load company logo:', userData.companyLogo)
                          setImageError(true)
                        }}
                        onLoad={() => {
                          console.log('Company logo loaded successfully:', userData.companyLogo)
                        }}
                      />
                    ) : (
                      <span className="text-sky-600 font-semibold text-lg">
                        {userData?.userInitials || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {isLoadingUser ? (
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse"></div>
                        <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {userData?.companyName || userData?.userName || 'Company'}
                        </p>
                        <p className="text-xs text-neutral-600 mt-1">
                          {userData?.hiringPersonName || 'User'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={async () => {
                      if (isLoggingOut) return

                      setIsLoggingOut(true)
                      setIsUserMenuOpen(false)

                      try {
                        // Call logout API
                        await authApi.logout()
                      } catch (error) {
                        // Even if API call fails, clear local storage and redirect
                        console.error('Logout error:', error)
                      } finally {
                        // Clear token from localStorage
                        localStorage.removeItem('auth_token')

                        // Redirect to login page
                        const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || 'http://localhost:3001/signin'
                        window.location.href = `${loginUrl}?role=employer`
                      }
                    }}
                    disabled={isLoggingOut}
                    className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
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
