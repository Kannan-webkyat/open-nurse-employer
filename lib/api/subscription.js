// Subscription API
import { apiRequest } from './index'

export const subscriptionApi = {
    /**
     * Get all available subscription plans
     */
    getPlans: async (type = null) => {
        const params = type !== null ? { type } : {}
        return apiRequest('/employer/subscriptions/plans', {
            method: 'GET',
            params
        })
    },

    /**
     * Get current subscription for the employer
     */
    getCurrentSubscription: async () => {
        return apiRequest('/employer/subscriptions/current', {
            method: 'GET',
        })
    },

    /**
     * Get subscription features and limits
     */
    getFeatures: async () => {
        return apiRequest('/employer/subscriptions/features', {
            method: 'GET',
        })
    },

    /**
     * Create a Stripe Checkout Session for subscription upgrade
     */
    createCheckoutSession: async (planId) => {
        return apiRequest('/employer/subscriptions/checkout-session', {
            method: 'POST',
            data: { plan_id: planId }
        })
    },

    /**
     * Verify a checkout session
     */
    verifyCheckoutSession: async (sessionId) => {
        return apiRequest('/employer/subscriptions/verify-checkout-session', {
            method: 'POST',
            data: { session_id: sessionId }
        })
    },

    /**
     * Upgrade or create a new subscription
     */
    upgradeSubscription: async (data) => {
        return apiRequest('/employer/subscriptions/upgrade', {
            method: 'POST',
            data
        })
    },

    /**
     * Cancel subscription
     */
    cancelSubscription: async (data) => {
        return apiRequest('/employer/subscriptions/cancel', {
            method: 'POST',
            data
        })
    },
}
