"""
Route Optimization Service for Delivery Management.

Implements:
- Haversine distance calculation (great-circle distance)
- Nearest Neighbor algorithm for TSP (Traveling Salesman Problem)
- Route optimization for delivery scheduling
"""
import math
import uuid
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth.
    
    Args:
        lat1, lon1: Coordinates of first point (degrees)
        lat2, lon2: Coordinates of second point (degrees)
    
    Returns:
        Distance in kilometers
    """
    # Earth's radius in kilometers
    R = 6371.0
    
    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Differences
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Haversine formula
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return round(distance, 2)


class RouteOptimizer:
    """
    Route optimizer using Nearest Neighbor algorithm.
    """
    
    def __init__(self, depot_lat: float, depot_lng: float):
        """
        Initialize optimizer with depot coordinates.
        
        Args:
            depot_lat: Depot latitude
            depot_lng: Depot longitude
        """
        self.depot_lat = depot_lat
        self.depot_lng = depot_lng
    
    def nearest_neighbor_route(
        self, 
        deliveries: List[Dict]
    ) -> Tuple[List[Dict], float]:
        """
        Optimize delivery route using Nearest Neighbor algorithm.
        
        Args:
            deliveries: List of delivery dicts with 'id', 'lat', 'lng' keys
        
        Returns:
            Tuple of (optimized_deliveries, total_distance_km)
        """
        if not deliveries:
            return [], 0.0
        
        # Start from depot
        current_lat = self.depot_lat
        current_lng = self.depot_lng
        
        unvisited = deliveries.copy()
        route = []
        total_distance = 0.0
        
        # Greedy nearest neighbor
        while unvisited:
            # Find nearest unvisited delivery
            nearest = None
            min_distance = float('inf')
            
            for delivery in unvisited:
                distance = haversine_distance(
                    current_lat, current_lng,
                    delivery['lat'], delivery['lng']
                )
                
                if distance < min_distance:
                    min_distance = distance
                    nearest = delivery
            
            # Move to nearest
            if nearest:
                nearest['distance_from_previous'] = round(min_distance, 2)
                nearest['order'] = len(route) + 1
                route.append(nearest)
                unvisited.remove(nearest)
                total_distance += min_distance
                current_lat = nearest['lat']
                current_lng = nearest['lng']
        
        return route, round(total_distance, 2)
    
    def optimize_deliveries(
        self,
        deliveries_data: List[Dict],
        algorithm: str = 'nearest_neighbor'
    ) -> Dict:
        """
        Main optimization method.
        
        Args:
            deliveries_data: List of deliveries with coordinates
            algorithm: Optimization algorithm ('nearest_neighbor')
        
        Returns:
            Dict with optimized route info
        """
        if algorithm == 'nearest_neighbor':
            optimized_route, total_km = self.nearest_neighbor_route(deliveries_data)
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")
        
        # Generate batch ID
        batch_id = f"ROUTE-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}"
        
        return {
            'optimized_deliveries': optimized_route,
            'total_km': total_km,
            'batch_id': batch_id,
            'algorithm': algorithm,
            'depot_coords': {
                'lat': self.depot_lat,
                'lng': self.depot_lng
            }
        }


def calculate_eta(
    current_time: datetime,
    distance_km: float,
    avg_speed_kmh: float = 40.0,
    service_time_minutes: int = 10
) -> datetime:
    """
    Calculate estimated time of arrival.
    
    Args:
        current_time: Starting time
        distance_km: Distance to travel
        avg_speed_kmh: Average speed in km/h
        service_time_minutes: Time spent at each stop
    
    Returns:
        Estimated arrival datetime
    """
    travel_hours = distance_km / avg_speed_kmh
    travel_minutes = travel_hours * 60
    total_minutes = travel_minutes + service_time_minutes
    
    eta = current_time + timedelta(minutes=total_minutes)
    return eta
