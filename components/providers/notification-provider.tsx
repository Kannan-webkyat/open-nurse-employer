'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import createEcho from '@/lib/echo'
// @ts-ignore
import { employerProfileApi } from '@/lib/api/profile'
// @ts-ignore
import { useToast } from '@/components/ui/toast'

interface NotificationContextType {
    notifications: any[]
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<any[]>([])
    const { info, success } = useToast() as any

    useEffect(() => {
        const setupEcho = async () => {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            try {
                const response: any = await employerProfileApi.getProfile()

                if (response.success || (response.data && response.data.id)) {
                    // Handle both response structures just in case
                    const data = response.success ? response.data : response
                    const userId = data.id

                    if (!userId) return

                    const echo = createEcho(token)

                    // Listen to private channel
                    console.log(`Subscribing to channel: user.${userId}`);
                    const channel = echo.private(`user.${userId}`);

                    channel
                        .listen('.job.application.received', (e: any) => {
                            console.log('EVENT RECEIVED [.job.application.received]:', e);
                            const title = e.title || (e.data && e.data.title) || 'New Notification';
                            const message = e.message || (e.data && e.data.message) || 'You have received a new notification.';

                            success(
                                <span className="block">
                                    <span className="font-semibold text-neutral-900">{title}</span>
                                    <span className="block text-sm text-neutral-600 mt-1">{message}</span>
                                </span>,
                                {
                                    title: 'Notification',
                                    duration: 8000,
                                    action: (closeToast: () => void) => (
                                        <button
                                            onClick={() => {
                                                window.dispatchEvent(new Event('open-notification-panel'))
                                                closeToast()
                                            }}
                                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors"
                                        >
                                            View Notifications
                                        </button>
                                    )
                                }
                            );
                            setNotifications(prev => [e, ...prev]);
                        })
                        .listen('job.application.received', (e: any) => {
                            console.log('EVENT RECEIVED [job.application.received]:', e);
                            const title = e.title || (e.data && e.data.title) || 'New Notification';
                            const message = e.message || (e.data && e.data.message) || 'You have received a new notification.';

                            success(
                                <span className="block">
                                    <span className="font-semibold text-neutral-900">{title}</span>
                                    <span className="block text-sm text-neutral-600 mt-1">{message}</span>
                                </span>,
                                {
                                    title: 'Notification',
                                    duration: 8000,
                                    action: (closeToast: () => void) => (
                                        <button
                                            onClick={() => {
                                                window.dispatchEvent(new Event('open-notification-panel'))
                                                closeToast()
                                            }}
                                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors"
                                        >
                                            View Notifications
                                        </button>
                                    )
                                }
                            );
                            setNotifications(prev => [e, ...prev]);
                        })
                        .listen('.notification.sent', (e: any) => {
                            console.log('EVENT RECEIVED [.notification.sent]:', e);
                            info(e.title || "Notification", { description: e.message });
                        })
                        .error((error: any) => {
                            console.error('Echo Channel Error:', error);
                        });

                    // Cleanup function

                    // Cleanup function
                    return () => {
                        echo.leave(`user.${userId}`)
                    }
                }
            } catch (error) {
                console.error('Failed to setup notification listener:', error)
            }
        }

        setupEcho()
    }, [success, info])

    return (
        <NotificationContext.Provider value={{ notifications }}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotifications = () => useContext(NotificationContext)
