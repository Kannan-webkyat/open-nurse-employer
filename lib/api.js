// Main API export file - re-export all APIs for convenience
export { default as apiMiddleware, apiRequest, transformResponse, handleError } from './api/index.js'

// Export all API modules
export { jobPostApi } from './api/jobs.js'
export { jobApplicationApi } from './api/applications.js'
export { employerProfileApi } from './api/profile.js'
export { accountSecurityApi } from './api/account.js'

// Default export for backward compatibility
import apiMiddleware from './api/index.js'
export default apiMiddleware

