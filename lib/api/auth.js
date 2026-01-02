// Authentication API functions
import { apiRequest } from './index'

export const authApi = {
  /**
   * Login employer
   * @param {Object} credentials - The login credentials (email, password)
   */
  loginEmployer: async (credentials) => {
    return apiRequest('/employer/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  /**
   * Logout employer
   */
  logout: async () => {
    return apiRequest('/employer/auth/logout', {
      method: 'POST',
    })
  },
}

