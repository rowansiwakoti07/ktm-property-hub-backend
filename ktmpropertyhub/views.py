from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import PropertyListing, State, District
from .serializers import PropertyListingSerializer, StateSerializer, DistrictSerializer
from django_filters import rest_framework as filters

class StateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows states to be viewed.
    """
    queryset = State.objects.all().order_by('name')
    serializer_class = StateSerializer

class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows districts to be viewed.
    Can be filtered by state_id, e.g., /api/districts/?state=1
    """
    queryset = District.objects.all().order_by('name')
    serializer_class = DistrictSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['state'] # Enable filtering by the 'state' foreign key

class PropertyFilter(filters.FilterSet):
    min_sqft = filters.NumberFilter(field_name="total_land_area_sqft", lookup_expr='gte')
    max_sqft = filters.NumberFilter(field_name="total_land_area_sqft", lookup_expr='lte')

    class Meta:
        model = PropertyListing
        fields = ['listing_purpose', 'property_type', 'state', 'district', 'min_sqft', 'max_sqft']

class PropertyListingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for viewing property listings.
    
    This provides `list` and `retrieve` actions. We use ReadOnlyModelViewSet
    to prevent creating/updating/deleting via this public API endpoint.
    
    You can filter the results by adding query parameters to the URL, e.g.:
    /api/properties/?purpose=SELL
    /api/properties/?purpose=RENT
    /api/properties/?property_type=HOUSE
    """
    queryset = PropertyListing.objects.filter(is_active=True).prefetch_related('facilities', 'images')
    serializer_class = PropertyListingSerializer
    
    # --- Filtering Configuration ---
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['listing_purpose', 'property_type', 'state', 'district']

    # Use our new custom filter class
    filterset_class = PropertyFilter # GET /api/properties/?min_sqft=1000&max_sqft=2000