import { apiRequest } from './index'

const BASE_URL = '/employer/support-chat'

export const supportChatApi = {
  /**
   * Get or create support conversation
   */
  getConversation: async (subject = null) => {
    const params = subject ? { subject } : {}
    return apiRequest(`${BASE_URL}/conversation`, {
      params,
    })
  },

  /**
   * Get messages for a conversation
   */
  getMessages: async (conversationId) => {
    return apiRequest(`${BASE_URL}/conversation/${conversationId}/messages`)
  },

  /**
   * Send a message
   */
  sendMessage: async (conversationId, content, attachment = null) => {
    const formData = new FormData()
    formData.append('support_conversation_id', conversationId)
    if (content) {
      formData.append('content', content)
    }
    if (attachment) {
      formData.append('attachment', attachment)
    }
    return apiRequest(`${BASE_URL}/messages`, {
      method: 'POST',
      data: formData,
    })
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (conversationId) => {
    return apiRequest(`${BASE_URL}/conversation/${conversationId}/read`, {
      method: 'POST',
    })
  },

  /**
   * Get unread count
   */
  getUnreadCount: async () => {
    return apiRequest(`${BASE_URL}/unread-count`)
  },
}
