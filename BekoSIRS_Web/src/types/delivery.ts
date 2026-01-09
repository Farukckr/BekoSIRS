export interface Delivery {
    id: number;
    customer_name: string;
    product_name: string;
    scheduled_date: string;
    status: 'WAITING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
    status_display: string;
    address: string;
    address_lat?: number;
    address_lng?: number;
    notes: string;
    delivery_order?: number;
    eta_minutes?: number;
    route_batch_id?: string;
    customer_phone_snapshot?: string;
}

export interface ProductAssignment {
    id: number;
    product: { id: number; name: string };
    customer: {
        id: number; full_name: string;
        district_name?: string; area_name?: string; phone_number?: string;
    };
    assigned_at: string;
    status: 'PLANNED' | 'SCHEDULED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
    notes?: string;
}

export interface RouteStop {
    order: number;
    delivery_id: number;
    customer: string;
    address: string;
    lat?: number;
    lng?: number;
    distance_km?: number;
    duration_min?: number;
}

export interface OptimizedRoute {
    route_id: number;
    stop_count: number;
    total_distance_km: number;
    total_duration_min: number;
    stops: RouteStop[];
    store?: { lat: number; lng: number; address: string };
}

export interface DeliveryStats {
    waiting_count: number;
    delivered_last_10_days_count: number;
    scheduled_for_selected_date_count: number;
}
