// Employer Profile API functions
import { apiRequest } from './index.js'

export const employerProfileApi = {
  /**
   * Get current employer profile
   */
  getProfile: async () => {
    return apiRequest('/employer/auth/me')
  },

  /**
   * Update employer profile
   */
  updateProfile: async (data) => {
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

    return apiRequest('/employer/auth/profile', {
      method: 'PUT',
      data: formData,
    })
  },
}

