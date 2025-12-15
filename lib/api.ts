// API utility for making authenticated requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Get auth token from localStorage
// TODO: Remove hardcoded token and use localStorage after testing
const getAuthToken = (): string | null => {
  // Temporary hardcoded token for testing
  return '5|rx5wS8208Eo2ypNdACXaC6ELeLLa1RqC3UfV3UDff296313d'
  
  // Original code (uncomment after testing):
  // if (typeof window === 'undefined') return null
  // return localStorage.getItem('auth_token')
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

// API request function for file uploads (FormData)
async function apiRequestFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const token = getAuthToken()
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: formData,
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

// Employer Profile API functions
export const employerProfileApi = {
  // Get current employer profile
  getProfile: async () => {
    return apiRequest('/employer/auth/me')
  },

  // Update employer profile
  updateProfile: async (data: {
    company_name?: string
    hiring_person_name?: string
    company_website?: string
    company_address?: string
    about_company?: string
    company_registration_number?: string
    vat_tax_id?: string
    number_of_employees?: string
    year_established?: number
    average_monthly_hiring_volume?: string
    job_visibility?: 'public' | 'limited'
    linkedin_url?: string
    twitter_url?: string
    facebook_url?: string
    instagram_url?: string
    preferred_job_categories?: number[]
    company_logo?: File
    kyc_document?: File
  }) => {
    const formData = new FormData()

    // Add text fields
    if (data.company_name !== undefined) formData.append('company_name', data.company_name)
    if (data.hiring_person_name !== undefined) formData.append('hiring_person_name', data.hiring_person_name)
    if (data.company_website !== undefined) formData.append('company_website', data.company_website)
    if (data.company_address !== undefined) formData.append('company_address', data.company_address)
    if (data.about_company !== undefined) formData.append('about_company', data.about_company)
    if (data.company_registration_number !== undefined) formData.append('company_registration_number', data.company_registration_number)
    if (data.vat_tax_id !== undefined) formData.append('vat_tax_id', data.vat_tax_id)
    if (data.number_of_employees !== undefined) formData.append('number_of_employees', data.number_of_employees)
    if (data.year_established !== undefined) formData.append('year_established', data.year_established.toString())
    if (data.average_monthly_hiring_volume !== undefined) formData.append('average_monthly_hiring_volume', data.average_monthly_hiring_volume)
    if (data.job_visibility !== undefined) formData.append('job_visibility', data.job_visibility)
    if (data.linkedin_url !== undefined) formData.append('linkedin_url', data.linkedin_url)
    if (data.twitter_url !== undefined) formData.append('twitter_url', data.twitter_url)
    if (data.facebook_url !== undefined) formData.append('facebook_url', data.facebook_url)
    if (data.instagram_url !== undefined) formData.append('instagram_url', data.instagram_url)

    // Add file uploads
    if (data.company_logo) {
      formData.append('company_logo', data.company_logo)
    }
    if (data.kyc_document) {
      formData.append('kyc_document', data.kyc_document)
    }

    // Add job categories array
    if (data.preferred_job_categories && data.preferred_job_categories.length > 0) {
      data.preferred_job_categories.forEach((categoryId) => {
        formData.append('preferred_job_categories[]', categoryId.toString())
      })
    }

    return apiRequestFormData('/employer/auth/profile', formData)
  },
}

// Account Security API functions
export const accountSecurityApi = {
  // Get active sessions
  getActiveSessions: async () => {
    return apiRequest('/employer/auth/active-sessions')
  },

  // Update account information (email, phone)
  updateAccountInfo: async (data: {
    email?: string
    phone?: string
  }) => {
    return apiRequest('/employer/auth/account-info', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Change password
  changePassword: async (data: {
    current_password: string
    password: string
    password_confirmation: string
  }) => {
    return apiRequest('/employer/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Logout from other devices
  logoutOtherDevices: async () => {
    return apiRequest('/employer/auth/logout-other-devices', {
      method: 'POST',
    })
  },
}

// Job Application API functions
export const jobApplicationApi = {
  // Get all applications
  getAll: async (params?: {
    page?: number
    per_page?: number
    status?: string
    search?: string
    location?: string
    apply_date?: string
    job_post_id?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.location) queryParams.append('location', params.location)
    if (params?.apply_date) queryParams.append('apply_date', params.apply_date)
    if (params?.job_post_id) queryParams.append('job_post_id', params.job_post_id.toString())
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order)

    const queryString = queryParams.toString()
    return apiRequest(`/employer/applications${queryString ? `?${queryString}` : ''}`)
  },

  // Get filter options
  getFilters: async () => {
    return apiRequest('/employer/applications/filters')
  },

  // Get single application
  getById: async (id: string | number) => {
    return apiRequest(`/employer/applications/${id}`)
  },

  // Update application status
  updateStatus: async (id: string | number, status: 'new' | 'reviewed' | 'shortlisted' | 'contacting' | 'interviewing' | 'rejected' | 'accepted') => {
    return apiRequest(`/employer/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  },

  // Delete application
  delete: async (id: string | number) => {
    return apiRequest(`/employer/applications/${id}`, {
      method: 'DELETE',
    })
  },
}

export default apiRequest

