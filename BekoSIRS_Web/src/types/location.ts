// Location and Depot types for KKTC delivery system

export interface District {
    id: number;
    name: string;
    center_lat: string | null;
    center_lng: string | null;
}

export interface Area {
    id: number;
    name: string;
    district: number;
    district_name?: string;
}

export interface DepotLocation {
    id: number;
    name: string;
    latitude: string;
    longitude: string;
    is_default: boolean;
    created_by?: number;
    created_by_name?: string;
    created_at: string;
    updated_at: string;
}

export interface DepotCreateRequest {
    name: string;
    latitude: number;
    longitude: number;
    is_default?: boolean;
}
