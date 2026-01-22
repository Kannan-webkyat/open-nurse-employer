'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useEcho } from '@/components/providers/echo-provider'
import { useUser } from '@/components/providers/user-provider'
import { notificationApi } from '@/lib/api/notifications'
// @ts-ignore
import { useToast } from '@/components/ui/toast'

export type NotificationType = 'application' | 'message' | 'interview' | 'expiry' | 'system' | 'job';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    timestamp: string;
    isUnread: boolean;
    data?: any;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAsRead: () => { },
    markAllAsRead: () => { },
    clearNotifications: () => { },
    refreshNotifications: async () => { },
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const { info, success } = useToast() as any
    const [realTimeAlertsEnabled, setRealTimeAlertsEnabled] = useState(true)

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("employer_notifications");
        if (stored) {
            try {
                setNotifications(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse notifications", e);
            }
        }
    }, []);

    // Save to localStorage whenever notifications change
    useEffect(() => {
        localStorage.setItem("employer_notifications", JSON.stringify(notifications));
    }, [notifications]);

    // Fetch settings
    const fetchSettings = async () => {
        try {
            const response: any = await notificationApi.getSettings()
            if (response.success && response.data && response.data.in_app_notifications) {
                setRealTimeAlertsEnabled(!!response.data.in_app_notifications.real_time_alerts)
            }
        } catch (error) {
            console.error('Failed to fetch notification settings:', error)
        }
    }

    // Refresh from API (syncs with backend)
    const refreshNotifications = async () => {
        try {
            // Optional: You could fetch here if you have an endpoint for historic notifications
            // For now we rely on local persistence + real-time updates
            // const response = await notificationApi.getNotifications();
            // if (response.success) setNotifications(response.data);
        } catch (error) {
            console.error("Failed to refresh notifications", error);
        }
    };

    useEffect(() => {
        fetchSettings()
        window.addEventListener('notificationSettingsUpdated', fetchSettings)
        return () => window.removeEventListener('notificationSettingsUpdated', fetchSettings)
    }, [])

    const { echo } = useEcho()
    const { user } = useUser()

    useEffect(() => {
        if (!echo || !user?.id) return

        const userId = user.id
        console.log(`NotificationProvider: Subscribing to channel: user.${userId}`);
        const channel = echo.private(`user.${userId}`);

        const handleEvent = (e: any, type: NotificationType = 'system') => {
            console.log('NotificationProvider: EVENT RECEIVED:', e);

            const newNotif: Notification = {
                id: Date.now().toString(),
                type: type,
                title: e.title || (e.data?.title) || 'Notification',
                description: e.message || (e.data?.message) || 'You have a new notification',
                timestamp: 'Just now',
                isUnread: true,
                data: e
            };

            setNotifications(prev => [newNotif, ...prev]);

            if (realTimeAlertsEnabled) {
                success(
                    <span className="block">
                        <span className="font-semibold text-neutral-900">{newNotif.title}</span>
                        <span className="block text-sm text-neutral-600 mt-1">{newNotif.description}</span>
                    </span>,
                    { duration: 5000 }
                );
            }
        };

        channel
            .listen('.job.application.received', (e: any) => handleEvent(e, 'application'))
            .listen('job.application.received', (e: any) => handleEvent(e, 'application'))
            .listen('.job.status.changed', (e: any) => handleEvent(e, 'job'))
            .listen('.notification.sent', (e: any) => handleEvent(e, 'system'))
            .error((error: any) => console.error('NotificationProvider: Echo Channel Error:', error));

        return () => {
            console.log('NotificationProvider: Cleaning up listeners');
            channel.stopListening('.job.application.received')
            channel.stopListening('job.application.received')
            channel.stopListening('.job.status.changed')
            channel.stopListening('.notification.sent')
        }
    }, [echo, user, success, realTimeAlertsEnabled])

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
        // Optional: Call API to mark as read on backend too
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
        // Optional: Call API
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => n.isUnread).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications, refreshNotifications }}>
            {children}
        </NotificationContext.Provider>
    )
}


export const useNotifications = () => useContext(NotificationContext)
