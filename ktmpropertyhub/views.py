# ktmpropertyhub/views.py

from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import PropertyListing
from .serializers import PropertyListingSerializer

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