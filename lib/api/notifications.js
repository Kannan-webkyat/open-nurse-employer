// Notification API functions
import { apiRequest } from './index'

export const notificationApi = {
    /**
     * Get all notifications
     * @param {Object} params - Query parameters (page, etc.)
     */
    getNotifications: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        return apiRequest(`/employer/notifications?${queryString}`)
    },

    /**
     * Mark notification as read
     * @param {string|number} id - Notification ID or 'all'
     */
    markAsRead: async (id) => {
        return apiRequest(`/employer/notifications/${id}/read`, {
            method: 'PUT',
        })
    },

    /**
     * Delete all read notifications
     */
    deleteRead: async () => {
        return apiRequest(`/employer/notifications/read`, {
            method: 'DELETE',
        })
    },

    /**
     * Get notification settings
     */
    getSettings: async () => {
        return apiRequest('/employer/notifications/settings')
    },

    /**
     * Update notification settings
     */
    updateSettings: async (settings) => {
        return apiRequest('/employer/notifications/settings', {
            method: 'PUT',
            data: settings,
        })
    },
}
