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

  /**
   * Verify Two-Factor Authentication
   * @param {Object} data - email and code
   */
  verifyTwoFactor: async (data) => {
    return apiRequest('/employer/auth/verify-2fa', {
      method: 'POST',
      data,
    })
  },

  /**
   * Resend Two-Factor Authentication Code
   * @param {Object} data - email
   */
  resendTwoFactor: async (data) => {
    return apiRequest('/employer/auth/resend-2fa', {
      method: 'POST',
      data,
    })
  },

  /**
   * Forgot Password
   * @param {string} email
   */
  forgotPassword: async (email) => {
    return apiRequest('/employer/auth/forgot-password', {
      method: 'POST',
      data: { email },
    })
  },

  /**
   * Reset Password
   * @param {Object} data - email, token, password, password_confirmation
   */
  resetPassword: async (data) => {
    return apiRequest('/employer/auth/reset-password', {
      method: 'POST',
      data,
    })
  },
}

