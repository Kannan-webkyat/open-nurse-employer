import { apiRequest } from './index';

export const dashboardApi = {
    /**
     * Get dashboard statistics and data
     * @returns {Promise} API response
     */
    getDashboardStats: (range = '7_days') => {
        return apiRequest(`/employer/dashboard?range=${range}`, { method: 'GET' });
    },
};
