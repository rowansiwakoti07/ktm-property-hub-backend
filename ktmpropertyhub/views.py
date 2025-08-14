from rest_framework import viewsets, permissions, mixins
from django_filters.rest_framework import DjangoFilterBackend
from .models import PropertyListing, State, District
from .serializers import PropertyListingSerializer, StateSerializer, DistrictSerializer, PropertyListingCreateSerializer
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


class AddPropertyViewSet(
    mixins.CreateModelMixin,   # Provides the .create() action
    mixins.ListModelMixin,     # Provides .list() to see your own properties
    mixins.RetrieveModelMixin, # Provides .retrieve() to see one of your properties
    mixins.UpdateModelMixin,   # Provides .update() and .partial_update()
    mixins.DestroyModelMixin,  # Provides .destroy()
    viewsets.GenericViewSet
):
    """
    A secure ViewSet for allowing authenticated users to manage their OWN
    property listings.
    """
    # Use the new serializer for creating/writing data
    serializer_class = PropertyListingCreateSerializer
    
    # --- THIS IS THE CRITICAL SECURITY RULE ---
    # This ensures that only logged-in users can access this endpoint.
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This is the magic. This view will ONLY ever show the listings
        that belong to the currently logged-in user.
        """
        return PropertyListing.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        """

        Pass the request object to the serializer's context. This is crucial
        for the serializer to be able to access the logged-in user.
        """
        return {'request': self.request}