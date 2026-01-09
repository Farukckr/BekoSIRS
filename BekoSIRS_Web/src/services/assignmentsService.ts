import api from './api';
import type { ProductAssignment } from '../types/delivery';

export const assignmentsService = {
    getAll: async (params?: { search?: string; status?: string }) => {
        const response = await api.get('/assignments/', { params });
        return response.data;
    },

    updateStatus: async (id: number, status: string) => {
        const response = await api.patch(`/assignments/${id}/`, { status });
        return response.data;
    }
};
