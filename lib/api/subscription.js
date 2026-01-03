// Subscription API endpoints
import { apiRequest } from './index'

export const subscriptionApi = {
    // Get all available subscription plans
    getPlans: async () => {
        return await apiRequest('/employer/subscriptions/plans', {
            method: 'GET',
        })
    },

    // Get current subscription
    getCurrentSubscription: async () => {
        return await apiRequest('/employer/subscriptions/current', {
            method: 'GET',
        })
    },

    // Upgrade/Create subscription with payment method
    upgradeSubscription: async (data) => {
        return await apiRequest('/employer/subscriptions/upgrade', {
            method: 'POST',
            data,
        })
    },

    // Cancel subscription
    cancelSubscription: async (data) => {
        return await apiRequest('/employer/subscriptions/cancel', {
            method: 'POST',
            data,
        })
    },
}
