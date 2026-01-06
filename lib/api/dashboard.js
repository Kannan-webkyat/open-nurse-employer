import { apiRequest } from './index';

export const dashboardApi = {
    /**
     * Get dashboard statistics and data
     * @returns {Promise} API response
     */
    getDashboardStats: () => {
        return apiRequest('/employer/dashboard', { method: 'GET' });
    },
};
