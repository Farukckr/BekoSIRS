// Location Service - KKTC Districts and Areas API
import api from './api';
import type { District, Area } from '../types/customer';

export const locationService = {
    /**
     * Get all KKTC districts
     */
    getDistricts: async (): Promise<District[]> => {
        const response = await api.get('/locations/districts/');
        if (response.data && response.data.results) {
            return response.data.results;
        }
        return Array.isArray(response.data) ? response.data : [];
    },

    /**
     * Get areas for a specific district or all areas
     * @param districtId - Optional district ID to filter areas
     */
    getAreas: async (districtId?: number): Promise<Area[]> => {
        const params = districtId ? { district_id: districtId } : {};
        const response = await api.get('/locations/areas/', { params });
        if (response.data && response.data.results) {
            return response.data.results;
        }
        return Array.isArray(response.data) ? response.data : [];
    },
};
