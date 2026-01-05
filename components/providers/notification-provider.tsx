'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import createEcho from '@/lib/echo'
// @ts-ignore
import { employerProfileApi } from '@/lib/api/profile'
import { notificationApi } from '@/lib/api/notifications'
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

    const [realTimeAlertsEnabled, setRealTimeAlertsEnabled] = useState(true)

    // Fetch settings to determine if real-time alerts are enabled
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

    useEffect(() => {
        fetchSettings()

        // Listen for settings updates
        const handleSettingsUpdate = () => {
            fetchSettings()
        }
        window.addEventListener('notificationSettingsUpdated', handleSettingsUpdate)

        return () => {
            window.removeEventListener('notificationSettingsUpdated', handleSettingsUpdate)
        }
    }, [])

    useEffect(() => {
        let echoInstance: any;

        const setupEcho = async () => {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            try {
                const response: any = await employerProfileApi.getProfile()

                if (response.success || (response.data && response.data.id)) {
                    const data = response.success ? response.data : response
                    const userId = data.id

                    if (!userId) return

                    echoInstance = createEcho(token)

                    console.log(`Subscribing to channel: user.${userId} with RealTimeAlerts: ${realTimeAlertsEnabled}`);
                    const channel = echoInstance.private(`user.${userId}`);

                    channel
                        .listen('.job.application.received', (e: any) => {
                            console.log('EVENT [.job.application.received]:', { event: e, alertsEnabled: realTimeAlertsEnabled });
                            setNotifications(prev => [e, ...prev]);

                            if (!realTimeAlertsEnabled) {
                                console.log('Real-time alerts disabled, suppressing toast.');
                                return;
                            }

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
                        })
                        .listen('job.application.received', (e: any) => {
                            console.log('EVENT [job.application.received]:', { event: e, alertsEnabled: realTimeAlertsEnabled });
                            setNotifications(prev => [e, ...prev]);

                            if (!realTimeAlertsEnabled) {
                                console.log('Real-time alerts disabled, suppressing toast.');
                                return;
                            }

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
                        })
                        .listen('.notification.sent', (e: any) => {
                            if (realTimeAlertsEnabled) {
                                info(e.title || "Notification", { description: e.message });
                            }
                        })
                        .error((error: any) => {
                            console.error('Echo Channel Error:', error);
                        });
                }
            } catch (error) {
                console.error('Failed to setup notification listener:', error)
            }
        }

        setupEcho()

        return () => {
            if (echoInstance) {
                console.log('Disconnecting Echo instance');
                echoInstance.disconnect();
            }
        }
    }, [success, info, realTimeAlertsEnabled])

    return (
        <NotificationContext.Provider value={{ notifications }}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotifications = () => useContext(NotificationContext)
