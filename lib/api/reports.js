import { apiRequest } from './index';
import apiMiddleware from './index';

export const reportsApi = {
  /**
   * Get monthly job reports with filtering
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search query
   * @param {string} params.date_from - Start date (YYYY-MM-DD)
   * @param {string} params.date_to - End date (YYYY-MM-DD)
   * @param {string} params.status - Job status filter
   * @param {string} params.employment_type - Employment type filter
   * @param {number} params.page - Page number
   * @param {number} params.per_page - Items per page
   * @returns {Promise} API response
   */
  getMonthlyJobReports: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.status) queryParams.append('status', params.status);
    if (params.employment_type) queryParams.append('employment_type', params.employment_type);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);

    const queryString = queryParams.toString();
    const url = `/employer/reports/monthly-job-reports${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url, { method: 'GET' });
  },

  /**
   * Get billing summary report
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getBillingSummary: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.status) queryParams.append('status', params.status);
    if (params.payment_method) queryParams.append('payment_method', params.payment_method);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);

    const queryString = queryParams.toString();
    const url = `/employer/reports/billing-summary${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url, { method: 'GET' });
  },

  /**
   * Get candidates applications report
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getCandidatesApplications: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);

    const queryString = queryParams.toString();
    const url = `/employer/reports/candidates-applications${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url, { method: 'GET' });
  },

  /**
   * Export monthly job reports as CSV
   * @param {Object} params - Query parameters (same as getMonthlyJobReports)
   * @returns {Promise} Downloads the file
   */
  exportMonthlyJobReportsCSV: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.status) queryParams.append('status', params.status);
    if (params.employment_type) queryParams.append('employment_type', params.employment_type);

    const queryString = queryParams.toString();
    const url = `/employer/reports/monthly-job-reports/export/csv${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiMiddleware.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.setAttribute('download', `monthly_job_reports_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  },

  /**
   * Export monthly job reports as Excel
   * @param {Object} params - Query parameters (same as getMonthlyJobReports)
   * @returns {Promise} Downloads the file
   */
  exportMonthlyJobReportsExcel: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.status) queryParams.append('status', params.status);
    if (params.employment_type) queryParams.append('employment_type', params.employment_type);

    const queryString = queryParams.toString();
    const url = `/employer/reports/monthly-job-reports/export/excel${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiMiddleware.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.setAttribute('download', `monthly_job_reports_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      throw error;
    }
  },

  /**
   * Export monthly job reports as PDF
   * @param {Object} params - Query parameters (same as getMonthlyJobReports)
   * @returns {Promise} Downloads the file
   */
  exportMonthlyJobReportsPDF: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.status) queryParams.append('status', params.status);
    if (params.employment_type) queryParams.append('employment_type', params.employment_type);

    const queryString = queryParams.toString();
    const url = `/employer/reports/monthly-job-reports/export/pdf${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiMiddleware.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.setAttribute('download', `monthly_job_reports_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  },

  /**
   * Export billing summary as CSV
   * @param {Object} params - Query parameters
   * @returns {Promise} Downloads the file
   */
  exportBillingSummaryCSV: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.status) queryParams.append('status', params.status);
    if (params.payment_method) queryParams.append('payment_method', params.payment_method);

    const queryString = queryParams.toString();
    const url = `/employer/reports/billing-summary/export/csv${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiMiddleware.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.setAttribute('download', `billing_summary_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  },

  /**
   * Export billing summary as Excel
   * @param {Object} params - Query parameters
   * @returns {Promise} Downloads the file
   */
  exportBillingSummaryExcel: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.status) queryParams.append('status', params.status);
    if (params.payment_method) queryParams.append('payment_method', params.payment_method);

    const queryString = queryParams.toString();
    const url = `/employer/reports/billing-summary/export/excel${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiMiddleware.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.setAttribute('download', `billing_summary_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      throw error;
    }
  },

  /**
   * Export billing summary as PDF
   * @param {Object} params - Query parameters
   * @returns {Promise} Downloads the file
   */
  exportBillingSummaryPDF: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.status) queryParams.append('status', params.status);
    if (params.payment_method) queryParams.append('payment_method', params.payment_method);

    const queryString = queryParams.toString();
    const url = `/employer/reports/billing-summary/export/pdf${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiMiddleware.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.setAttribute('download', `billing_summary_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  },

  /**
   * Export candidates applications as CSV
   * @param {Object} params - Query parameters
   * @returns {Promise} Downloads the file
   */
  exportCandidatesApplicationsCSV: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = `/employer/reports/candidates-applications/export/csv${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiMiddleware.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.setAttribute('download', `candidates_applications_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  },

  /**
   * Export candidates applications as Excel
   * @param {Object} params - Query parameters
   * @returns {Promise} Downloads the file
   */
  exportCandidatesApplicationsExcel: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = `/employer/reports/candidates-applications/export/excel${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiMiddleware.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.setAttribute('download', `candidates_applications_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      throw error;
    }
  },

  /**
   * Export candidates applications as PDF
   * @param {Object} params - Query parameters
   * @returns {Promise} Downloads the file
   */
  exportCandidatesApplicationsPDF: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = `/employer/reports/candidates-applications/export/pdf${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiMiddleware.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.setAttribute('download', `candidates_applications_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  },
};
