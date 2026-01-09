"""
Depot Location API endpoints.
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from products.models import DepotLocation
from products.serializers import DepotLocationSerializer, DepotLocationCreateSerializer


class DepotLocationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Depot Location management.
    
    Endpoints:
    - GET /api/v1/depots/ - List all depots
    - POST /api/v1/depots/ - Create new depot
    - GET /api/v1/depots/{id}/ - Retrieve depot details
    - PATCH /api/v1/depots/{id}/ - Update depot
    - DELETE /api/v1/depots/{id}/ - Delete depot
    - POST /api/v1/depots/{id}/set_default/ - Set as default depot
    """
    queryset = DepotLocation.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DepotLocationCreateSerializer
        return DepotLocationSerializer
    
    def perform_create(self, serializer):
        # Set created_by to current user
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'], url_path='set-default')
    def set_default(self, request, pk=None):
        """Set this depot as the default depot."""
        depot = self.get_object()
        
        # Unset all other defaults
        DepotLocation.objects.filter(is_default=True).update(is_default=False)
        
        # Set this as default
        depot.is_default = True
        depot.save()
        
        serializer = self.get_serializer(depot)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='default')
    def get_default(self, request):
        """Get the default depot."""
        try:
            depot = DepotLocation.objects.get(is_default=True)
            serializer = self.get_serializer(depot)
            return Response(serializer.data)
        except DepotLocation.DoesNotExist:
            return Response(
                {'detail': 'Varsayılan depo bulunamadı.'},
                status=status.HTTP_404_NOT_FOUND
            )
