"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import apiMiddleware, { chatApi } from '@/lib/api'
import Echo from '@/lib/echo'

interface MessageContextType {
    unreadCount: number
    updateUnreadCount: () => Promise<void>
    incrementUnreadCount: () => void
    decrementUnreadCount: (count?: number) => void
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0)

    const updateUnreadCount = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            // Get user ID from API if possible, or assume the conversations endpoint logic filters correctly
            // We need the ID for client-side filtering of our own messages
            // Since we can't reliably decode the token (might not be JWT), let's fetch user profile
            // Optimally, we should store userId in localStorage on login, but for now:

            // For now, let's rely on the fact that conversation messages have sender_id.
            // If we don't have the current user ID, we can't filter out our own messages accurately for unread count
            // UNLESS the unread count logic in backend handles it?
            // The frontend logic performs: msg.sender_id !== userId.

            // Let's fetch the user first
            // We can use a simple cached approach or just fetch it.
            let userId: number | null = null;
            try {
                // Try to decode if it LOOKS like a JWT (3 parts)
                if (token.split('.').length === 3) {
                    userId = JSON.parse(atob(token.split('.')[1])).sub
                }
            } catch (e) {
                // Ignore decode error
            }

            // If still null, try fetching (or maybe we can skip this and rely on backend response if we adjust api?)
            // But we need it for real-time check too. 
            // Let's try to get it from apiMiddleware.get('/user')
            if (!userId) {
                const userRes = await apiMiddleware.get('/user')
                if (userRes.data?.data?.id) userId = userRes.data.data.id
                else if (userRes.data?.id) userId = userRes.data.id
            }

            if (!userId) return // Can't calculate without user ID

            const response = await chatApi.getConversations()
            if (response.success && response.data) {
                const conversations = response.data as any[]
                const totalUnread = conversations.reduce((count, conv) => {
                    // Use the count provided by the backend query
                    return count + (conv.unread_messages_count || 0)
                }, 0)
                setUnreadCount(totalUnread)
            }
        } catch (error) {
            console.error('Error fetching unread count:', error)
        }
    }, [])

    const incrementUnreadCount = useCallback(() => {
        setUnreadCount(prev => prev + 1)
    }, [])

    const decrementUnreadCount = useCallback((count: number = 1) => {
        setUnreadCount(prev => Math.max(0, prev - count))
    }, [])

    // Initial fetch
    useEffect(() => {
        updateUnreadCount()
    }, [updateUnreadCount])

    // Listen for real-time message events
    useEffect(() => {
        const token = localStorage.getItem('auth_token')
        if (!token) return

        let userId: number | null = null;
        try {
            if (token.split('.').length === 3) {
                userId = JSON.parse(atob(token.split('.')[1])).sub
            }
        } catch (e) { }

        const setupEcho = async () => {
            if (!userId) {
                try {
                    const userRes = await apiMiddleware.get('/user')
                    if (userRes.data?.data?.id) userId = userRes.data.data.id
                    else if (userRes.data?.id) userId = userRes.data.id
                } catch (e) { return }
            }

            if (!userId) return

            const echo = Echo()
            if (echo) {
                const channel = echo.private(`user.${userId}`)

                channel.listen('MessageSent', (data: any) => {
                    // If message is from someone else, increment unread count
                    if (data.message.sender_id !== userId) {
                        incrementUnreadCount()
                    }
                })

                return () => {
                    channel.stopListening('MessageSent')
                }
            }
        }

        setupEcho()

    }, [incrementUnreadCount])

    return (
        <MessageContext.Provider value={{ unreadCount, updateUnreadCount, incrementUnreadCount, decrementUnreadCount }}>
            {children}
        </MessageContext.Provider>
    )
}

export function useMessages() {
    const context = useContext(MessageContext)
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessageProvider')
    }
    return context
}
