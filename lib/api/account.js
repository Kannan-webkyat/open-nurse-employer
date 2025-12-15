// Account Security API functions
import { apiRequest } from './index'

export const accountSecurityApi = {
  /**
   * Get active sessions (tokens)
   */
  getActiveSessions: async () => {
    return apiRequest('/employer/auth/active-sessions')
  },

  /**
   * Update account information (email, phone)
   */
  updateAccountInfo: async (data) => {
    return apiRequest('/employer/auth/account-info', {
      method: 'PUT',
      data,
    })
  },

  /**
   * Change password
   */
  changePassword: async (data) => {
    return apiRequest('/employer/auth/change-password', {
      method: 'PUT',
      data,
    })
  },

  /**
   * Logout from other devices (revoke all other tokens)
   */
  logoutOtherDevices: async () => {
    return apiRequest('/employer/auth/logout-other-devices', {
      method: 'POST',
    })
  },
}

