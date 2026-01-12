// Payment Methods API
import { apiRequest } from './index'

export const paymentMethodApi = {
    /**
     * Get all payment methods for the employer
     */
    getAll: async () => {
        return apiRequest('/employer/payment-methods', {
            method: 'GET',
        })
    },

    /**
     * Create a setup intent for adding payment methods
     */
    createSetupIntent: async () => {
        return apiRequest('/employer/payment-methods/setup-intent', {
            method: 'POST',
        })
    },

    /**
     * Add a new payment method
     */
    add: async (paymentMethodData) => {
        return apiRequest('/employer/payment-methods', {
            method: 'POST',
            data: paymentMethodData,
        })
    },

    /**
     * Add a bank account
     */
    addBankAccount: async (data) => {
        return apiRequest('/employer/bank-accounts', {
            method: 'POST',
            data: data,
        })
    },

    /**
     * Get all bank accounts
     */
    getBankAccounts: async () => {
        return apiRequest('/employer/bank-accounts', {
            method: 'GET',
        })
    },

    /**
     * Delete a bank account
     */
    deleteBankAccount: async (id) => {
        return apiRequest(`/employer/bank-accounts/${id}`, {
            method: 'DELETE',
        })
    },

    /**
     * Set a bank account as default
     */
    setDefaultBankAccount: async (id) => {
        return apiRequest(`/employer/bank-accounts/${id}/default`, {
            method: 'PUT',
        })
    },

    /**
     * Set a payment method as default
     */
    setDefault: async (id) => {
        return apiRequest(`/employer/payment-methods/${id}/default`, {
            method: 'PUT',
        })
    },

    /**
     * Delete a payment method
     */
    delete: async (id) => {
        return apiRequest(`/employer/payment-methods/${id}`, {
            method: 'DELETE',
        })
    },
}

/**
 * Online Payments API
 */
export const paymentApi = {
    /**
     * Create a payment intent for online payment
     */
    createIntent: async (paymentData) => {
        return apiRequest('/employer/payments/intent', {
            method: 'POST',
            data: paymentData,
        })
    },

    /**
     * Get payment status
     */
    getStatus: async (paymentId) => {
        return apiRequest(`/employer/payments/${paymentId}/status`, {
            method: 'GET',
        })
    },

    /**
     * Get all payments
     */
    getAll: async () => {
        return apiRequest('/employer/payments', {
            method: 'GET',
        })
    },

    /**
     * Verify payment session
     */
    verify: async (sessionId) => {
        return apiRequest('/employer/payments/verify', {
            method: 'POST',
            data: { session_id: sessionId },
        })
    },
}
