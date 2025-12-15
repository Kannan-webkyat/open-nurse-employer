// API utility for making authenticated requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

// API response types
interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        errors: data.errors,
      }
    }

    return {
      success: true,
      message: data.message || 'Success',
      data: data.data || data,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}

// Job Post API functions
export const jobPostApi = {
  // Get all job posts
  getAll: async (params?: {
    page?: number
    per_page?: number
    status?: string
    search?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)

    const queryString = queryParams.toString()
    return apiRequest(`/employer/job-posts${queryString ? `?${queryString}` : ''}`)
  },

  // Get single job post
  getById: async (id: string | number) => {
    return apiRequest(`/employer/job-posts/${id}`)
  },

  // Create job post
  create: async (data: {
    title: string
    specialization: string
    employment_type: string
    years_of_experience?: number
    posted_date: string
    closed_date: string
    number_of_openings: number
    status: 'active' | 'paused' | 'draft' | 'closed'
    payment_type: 'starting_amount' | 'range'
    amount?: number
    minimum_amount?: number
    maximum_amount?: number
    rate: string
    overview?: string
    qualifications?: string
    application_process?: string
    description?: string
    location?: string
    category?: string
  }) => {
    return apiRequest('/employer/job-posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update job post
  update: async (id: string | number, data: Partial<{
    title: string
    specialization: string
    employment_type: string
    years_of_experience?: number
    posted_date: string
    closed_date: string
    number_of_openings: number
    status: 'active' | 'paused' | 'draft' | 'closed'
    payment_type: 'starting_amount' | 'range'
    amount?: number
    minimum_amount?: number
    maximum_amount?: number
    rate: string
    overview?: string
    qualifications?: string
    application_process?: string
    description?: string
    location?: string
    category?: string
  }>) => {
    return apiRequest(`/employer/job-posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete job post
  delete: async (id: string | number) => {
    return apiRequest(`/employer/job-posts/${id}`, {
      method: 'DELETE',
    })
  },
}

export default apiRequest

