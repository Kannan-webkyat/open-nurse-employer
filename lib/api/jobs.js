// Job Post API functions
import { apiRequest } from './index'

export const jobPostApi = {
  /**
   * Get all job posts with pagination and filters
   */
  getAll: async (params) => {
    return apiRequest('/employer/job-posts', {
      method: 'GET',
      params,
    })
  },

  /**
   * Get single job post by ID
   */
  getById: async (id) => {
    return apiRequest(`/employer/job-posts/${id}`)
  },

  /**
   * Create a new job post
   */
  create: async (data) => {
    return apiRequest('/employer/job-posts', {
      method: 'POST',
      data,
    })
  },

  /**
   * Update an existing job post
   */
  update: async (id, data) => {
    return apiRequest(`/employer/job-posts/${id}`, {
      method: 'PUT',
      data,
    })
  },

  /**
   * Delete a job post
   */
  delete: async (id) => {
    return apiRequest(`/employer/job-posts/${id}`, {
      method: 'DELETE',
    })
  },
}

