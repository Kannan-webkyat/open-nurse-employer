import { apiRequest } from "./index"

export const suggestionApi = {
  // Get all suggestions
  getAll: async (params?: any) => {
    return apiRequest('/employer/suggestions', {
      method: 'GET',
      params
    })
  },

  // Create a new suggestion
  create: async (data: { content: string }) => {
    return apiRequest('/employer/suggestions', {
      method: 'POST',
      data
    })
  },
}
