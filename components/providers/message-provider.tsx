"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import apiMiddleware, { chatApi } from '@/lib/api'
import { useEcho } from '@/components/providers/echo-provider'
import { useUser } from '@/components/providers/user-provider'

interface MessageContextType {
    unreadCount: number
    updateUnreadCount: () => Promise<void>
    incrementUnreadCount: () => void
    decrementUnreadCount: (count?: number) => void
    activeConversationId: number | null
    setActiveConversationId: (id: number | null) => void
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0)
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null)

    const updateUnreadCount = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            // Simplified user ID check not strictly needed for just fetching the count authenticated
            // but the provider logic used it for filtering.
            // With the new endpoint, we just call it.

            const response = await apiMiddleware.get('/conversations/unread-count')
            if (response.data?.success) {
                setUnreadCount(response.data.count)
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

    const { echo } = useEcho()
    const { user } = useUser()

    // Listen for real-time message events
    useEffect(() => {
        if (!echo || !user?.id) return

        const userId = user.id
        console.log("MessageProvider: Subscribing to user.", userId);

        const channelName = `user.${userId}`;
        const channel = echo.private(channelName)

        channel.listen('MessageSent', (data: any) => {
            console.log("MessageProvider: MessageSent received", data);
            
            // Broadcast to other components (like MessagesPage) via window event
            window.dispatchEvent(new CustomEvent('messageSentEvent', { detail: data }));
            
            // If message is from someone else and not in active conversation, increment unread count
            if (data.message.sender_id !== userId) {
                console.log("MessageProvider: Sender is not us. ActiveConv:", activeConversationId, "MsgConv:", data.message.conversation_id);
                if (data.message.conversation_id !== activeConversationId) {
                    console.log("MessageProvider: Incrementing unread count");
                    incrementUnreadCount()
                } else {
                    console.log("MessageProvider: Skipped increment (Active Chat)");
                }
            }
        })

        return () => {
            console.log("MessageProvider: Cleaning up listeners");
            channel.stopListening('MessageSent')
        }
    }, [echo, user, incrementUnreadCount, activeConversationId])

    return (
        <MessageContext.Provider value={{ unreadCount, updateUnreadCount, incrementUnreadCount, decrementUnreadCount, activeConversationId, setActiveConversationId }}>
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
