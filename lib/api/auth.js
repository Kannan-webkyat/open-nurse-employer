// Authentication API functions
import { apiRequest } from './index'

export const authApi = {
  /**
   * Logout employer
   */
  logout: async () => {
    return apiRequest('/employer/auth/logout', {
      method: 'POST',
    })
  },
}

