// Chat API functions
import { apiRequest } from './index'

export const chatApi = {
    /**
     * Get all conversations
     */
    getConversations: async () => {
        return apiRequest('/conversations')
    },

    /**
     * Get messages for a conversation
     */
    getMessages: async (conversationId) => {
        return apiRequest(`/conversations/${conversationId}/messages`)
    },

    /**
     * Send a message
     */
    sendMessage: async (data) => {
        return apiRequest('/messages', {
            method: 'POST',
            data,
            // If we are sending files (FormData), we need to let the browser set the Content-Type
            headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
        })
    },

    /**
   * Mark all messages in a conversation as read
   */
    markAsRead: async (conversationId) => {
        return apiRequest(`/conversations/${conversationId}/read`, {
            method: 'POST'
        })
    }
}
