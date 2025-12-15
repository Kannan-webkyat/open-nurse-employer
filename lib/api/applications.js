// Job Application API functions
import { apiRequest } from './index'

export const jobApplicationApi = {
  /**
   * Get all job applications with pagination and filters
   */
  getAll: async (params) => {
    return apiRequest('/employer/applications', {
      method: 'GET',
      params,
    })
  },

  /**
   * Get filter options (locations, job posts)
   */
  getFilters: async () => {
    return apiRequest('/employer/applications/filters')
  },

  /**
   * Get single application by ID
   */
  getById: async (id) => {
    return apiRequest(`/employer/applications/${id}`)
  },

  /**
   * Update application status
   */
  updateStatus: async (id, status) => {
    return apiRequest(`/employer/applications/${id}/status`, {
      method: 'PUT',
      data: { status },
    })
  },

  /**
   * Delete an application
   */
  delete: async (id) => {
    return apiRequest(`/employer/applications/${id}`, {
      method: 'DELETE',
    })
  },
}

