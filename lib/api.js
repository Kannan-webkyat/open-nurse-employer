// Main API export file - re-export all APIs for convenience
export { default as apiMiddleware, apiRequest, transformResponse, handleError } from './api/index'

// Export all API modules
export { jobPostApi } from './api/jobs'
export { jobApplicationApi } from './api/applications'
export { employerProfileApi } from './api/profile'
export { accountSecurityApi } from './api/account'
export { authApi } from './api/auth'
export { dashboardApi } from './api/dashboard'
export { chatApi } from './api/chat'
export { supportChatApi } from './api/support-chat'
export { paymentMethodApi, paymentApi } from './api/payment'
export { subscriptionApi } from './api/subscription'

// Default export for backward compatibility
import apiMiddleware from './api/index'
export default apiMiddleware

