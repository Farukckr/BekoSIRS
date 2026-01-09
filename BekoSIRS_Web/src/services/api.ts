import axios from 'axios';
import type { District, Area, DepotLocation, DepotCreateRequest } from '../types/location';

// Get the base URL from environment variables or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't already tried to refresh the token
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh');
                if (refreshToken) {
                    // Attempt to refresh the token
                    const response = await axios.post(`${API_URL}/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    if (response.status === 200) {
                        localStorage.setItem('access', response.data.access);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                // If refresh fails, logout
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                localStorage.removeItem('user_role');
                window.location.href = '/'; // Redirect to login
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// ===========================================
// Location APIs
// ===========================================
export const locationAPI = {
    // Get all districts
    getDistricts: () => api.get<District[]>('/locations/districts/'),

    // Get areas for a district
    getAreas: (districtId?: number) =>
        api.get<Area[]>('/locations/areas/', {
            params: districtId ? { district_id: districtId } : {}
        }),
};

// ===========================================
// Depot APIs
// ===========================================
export const depotAPI = {
    // List all depots
    list: () => api.get<DepotLocation[]>('/depots/'),

    // Get single depot
    get: (id: number) => api.get<DepotLocation>(`/depots/${id}/`),

    // Create new depot
    create: (data: DepotCreateRequest) => api.post<DepotLocation>('/depots/', data),

    // Update depot
    update: (id: number, data: Partial<DepotCreateRequest>) =>
        api.patch<DepotLocation>(`/depots/${id}/`, data),

    // Delete depot
    delete: (id: number) => api.delete(`/depots/${id}/`),

    // Set as default
    setDefault: (id: number) => api.post<DepotLocation>(`/depots/${id}/set-default/`),

    // Get default depot
    getDefault: () => api.get<DepotLocation>('/depots/default/'),
};

// ===========================================
// Delivery APIs
// ===========================================
export const deliveryAPI = {
    // List deliveries with filters
    list: (params?: any) => api.get('/deliveries/', { params }),

    // Get delivery stats
    stats: (params?: any) => api.get('/deliveries/stats/', { params }),

    // Update delivery
    update: (id: number, data: any) => api.patch(`/deliveries/${id}/`, data),

    // Delete delivery
    delete: (id: number) => api.delete(`/deliveries/${id}/`),

    // Route Optimization
    optimize: (data: { date: string; delivery_ids?: number[]; depot_id?: number; algorithm?: string }) =>
        api.post('/delivery-routes/optimize/', data),
};
