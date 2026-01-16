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
      data: credentials,
    })
  },

  /**
   * Register employer
   * @param {Object} data - The registration data
   */
  registerEmployer: async (data) => {
    return apiRequest('/employer/auth/register', {
      method: 'POST',
      data: data,
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

