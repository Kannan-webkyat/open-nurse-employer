// Main API export file - re-export all APIs for convenience
export { default as apiMiddleware, apiRequest, transformResponse, handleError } from './api/index'

// Export all API modules
export { jobPostApi } from './api/jobs'
export { jobApplicationApi } from './api/applications'
export { employerProfileApi } from './api/profile'
export { accountSecurityApi } from './api/account'

// Default export for backward compatibility
import apiMiddleware from './api/index'
export default apiMiddleware

