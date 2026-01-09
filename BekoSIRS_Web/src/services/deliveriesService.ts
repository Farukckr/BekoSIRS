import api from './api';
import type { Delivery, OptimizedRoute } from '../types/delivery';

export const deliveriesService = {
    getAll: async (date: string) => {
        const response = await api.get(`/deliveries/?date=${date}`);
        return response.data as Delivery[];
    },

    create: async (data: any) => {
        const response = await api.post('/deliveries/', data);
        return response.data;
    },

    optimizeRoute: async (date: string) => {
        const response = await api.post('/delivery-routes/optimize/', { date });
        return response.data as OptimizedRoute;
    },

    getStats: async () => {
        const response = await api.get('/deliveries/stats/');
        return response.data;
    }
};
