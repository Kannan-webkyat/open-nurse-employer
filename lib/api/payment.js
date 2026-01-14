// Payment Methods API
import apiMiddleware, { apiRequest } from './index'

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
    downloadInvoice: async (id) => {
    try {
      const response = await apiMiddleware.get(`/employer/payments/${id}/invoice`, {
        responseType: 'blob',
      });

      // Get filename from header or default
      const disposition = response.headers['content-disposition'];
      let filename = 'invoice.pdf';
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (error) {
      console.error('Invoice download error:', error);
      let errorMessage = error.message;

      if (error.response && error.response.data instanceof Blob) {
          try {
              const text = await error.response.data.text();
              const json = JSON.parse(text);
              if (json.message) {
                  errorMessage = json.message;
              }
          } catch (e) {
              // Failed to parse blob as JSON, stick to default message
          }
      } else if (error.response && error.response.data && error.response.data.message) {
           errorMessage = error.response.data.message;
      }

      return { success: false, error: errorMessage };
    }
  },

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
