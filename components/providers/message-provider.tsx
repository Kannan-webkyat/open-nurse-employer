"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import apiMiddleware, { chatApi } from '@/lib/api'
import Echo from '@/lib/echo'
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

    const { user } = useUser()

    // Listen for real-time message events
    useEffect(() => {
        const token = localStorage.getItem('auth_token')
        if (!token) return

        const userId = user?.id

        const setupEcho = async () => {
            console.log("MessageProvider: Setup Echo for UserID:", userId);

            if (!userId) return

            const echo = Echo(token) // Pass token here
            if (echo) {
                const channelName = `user.${userId}`;
                console.log("MessageProvider: Subscribing to", channelName);
                const channel = echo.private(channelName)

                channel.listen('MessageSent', (data: any) => {
                    console.log("MessageProvider: MessageSent received", data);
                    // If message is from someone else, increment unread count
                    // CHECK: If this conversation is currently active, DO NOT increment.
                    if (data.message.sender_id !== userId) {
                        console.log("MessageProvider: Sender is not us. ActiveConv:", activeConversationId, "MsgConv:", data.message.conversation_id);
                        // We will fix the closure issue by verifying against a value tracked in a ref (which we need to add)
                        // OR just adding activeConversationId to dependency array. Re-subscribing is fine.
                        // Actually re-subscribing to a PRIVATE channel "user.{id}" repeatedly is handled by Echo/Pusher efficiently?
                        // Usually it's better to avoid it.
                        // Let's use functional update or ref?
                        // Functional update of setUnreadCount can't calculate "should increment" based on external state easily 
                        // unless that state is inside the callback.

                        // Let's assume we re-run effect when `activeConversationId` changes.
                        if (data.message.conversation_id !== activeConversationId) {
                            console.log("MessageProvider: Incrementing unread count");
                            incrementUnreadCount()
                        } else {
                            console.log("MessageProvider: Skipped increment (Active Chat)");
                        }
                    }
                })

                return () => {
                    console.log("MessageProvider: Unsubscribing");
                    channel.stopListening('MessageSent')
                }
            }
        }

        setupEcho()

    }, [incrementUnreadCount, activeConversationId, user]) // Re-run when activeConversationId or user changes

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
