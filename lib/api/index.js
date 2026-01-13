// API middleware - axios instance with interceptors
import axios from 'axios'

// Create axios instance with base config
const apiMiddleware = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes timeout
})

// Request interceptor to add auth token if exists
apiMiddleware.interceptors.request.use(
  (config) => {
    // Get auth token from localStorage
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('auth_token')
      : null

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Browser will automatically set it with the correct boundary for multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for global error handling
apiMiddleware.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error statuses globally
    if (error.response) {
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          // Redirect to login page
          const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || 'http://localhost:3001/signin'
          const returnUrl = encodeURIComponent(window.location.href)
          window.location.href = `${loginUrl}?redirect=${returnUrl}&role=employer`
        }
      }
    }
    return Promise.reject(error)
  }
)

// Helper function to transform axios response to ApiResponse format
export const transformResponse = (response) => {
  const responseData = response.data

  // Handle Laravel API response format
  if (responseData.success !== undefined) {
    return {
      success: responseData.success,
      message: responseData.message || 'Success',
      data: responseData.data,
      errors: responseData.errors,
    }
  }

  // Handle direct data response
  return {
    success: true,
    message: responseData.message || 'Success',
    data: responseData.data || responseData,
  }
}

// Helper function to handle errors
export const handleError = (error) => {
  if (error.response) {
    const responseData = error.response.data
    return {
      success: false,
      message: responseData.message || 'An error occurred',
      data: null,
      errors: responseData.errors,
    }
  }

  return {
    success: false,
    message: error.message || 'Network error occurred',
    data: null,
  }
}

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await apiMiddleware.request({
      url: endpoint,
      ...options,
    })
    return transformResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export * from './auth'
export * from './profile'
export * from './jobs'
export * from './applications'
export * from './chat'
export * from './support-chat'
export * from './notifications'
export * from './dashboard'
export * from './account'
export * from './reports'

export default apiMiddleware

