// Customer Service - Customer Management API
import api from './api';
import type { Customer, CustomerDetail, CustomerFormData, CustomerFilters } from '../types/customer';

export const customerService = {
    /**
     * Get list of customers with optional filters
     */
    getCustomers: async (filters?: CustomerFilters): Promise<Customer[]> => {
        const params: any = {};

        if (filters?.search) {
            params.search = filters.search;
        }

        if (filters?.ordering) {
            params.ordering = filters.ordering;
        }

        const response = await api.get('/customers/', { params });
        // Handle pagination response (DRF returns { count, next, previous, results: [] })
        if (response.data && response.data.results) {
            return response.data.results;
        }
        // Fallback for non-paginated response (if any)
        return Array.isArray(response.data) ? response.data : [];
    },

    /**
     * Get detailed information for a single customer
     */
    getCustomer: async (id: number): Promise<CustomerDetail> => {
        const response = await api.get(`/customers/${id}/`);
        return response.data;
    },

    /**
     * Update customer information
     */
    updateCustomer: async (
        id: number,
        data: Partial<CustomerFormData>
    ): Promise<CustomerDetail> => {
        const response = await api.patch(`/customers/${id}/`, data);
        return response.data;
    },
};
