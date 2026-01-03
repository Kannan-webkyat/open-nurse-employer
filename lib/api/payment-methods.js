// Payment Method API endpoints
import { apiRequest } from './index'

export const paymentMethodApi = {
    // Get all payment methods
    getAll: async () => {
        return await apiRequest('/employer/payment-methods', {
            method: 'GET',
        })
    },

    // Add new payment method
    add: async (data) => {
        return await apiRequest('/employer/payment-methods', {
            method: 'POST',
            data,
        })
    },

    // Set default payment method
    setDefault: async (id) => {
        return await apiRequest(`/employer/payment-methods/${id}/default`, {
            method: 'PUT',
        })
    },

    // Delete payment method
    delete: async (id) => {
        return await apiRequest(`/employer/payment-methods/${id}`, {
            method: 'DELETE',
        })
    },
}
