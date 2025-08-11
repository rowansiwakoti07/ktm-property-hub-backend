from rest_framework import serializers
from .models import PropertyListing, Facility, PropertyImage

class FacilitySerializer(serializers.ModelSerializer):
    """
    Serializer for the Facility model.
    """
    class Meta:
        model = Facility
        fields = ['id', 'name']

class PropertyImageSerializer(serializers.ModelSerializer):
    """
    Serializer for the PropertyImage model.
    """
    class Meta:
        model = PropertyImage
        # The 'image' field from CloudinaryField automatically provides the URL
        fields = ['id', 'image', 'caption', 'is_thumbnail']

class PropertyListingSerializer(serializers.ModelSerializer):
    """
    The main serializer for the PropertyListing model. This will be used
    for the list and detail views.
    """
    # To show the username instead of the user ID
    user = serializers.StringRelatedField(read_only=True)
    
    # Nest the serializers for related models to show their full data
    facilities = FacilitySerializer(many=True, read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta:
        model = PropertyListing
        # We list all fields to be explicit about what our API exposes
        fields = [
            'id', 'listing_purpose', 'property_type', 'user', 'title', 
            'description', 'created_at', 'updated_at', 'is_active', 'state', 
            'district', 'local_area', 'price_min', 'price', 'price_negotiable',
            'land_size_1_value', 'land_size_1_unit', 'land_size_2_value', 'land_size_2_unit',
            'road_size_min_ft', 'road_size_ft', 'road_condition', 'facing_direction',
            'land_type', 'property_condition', 'built_year_bs', 'built_year_ad',
            'floors_min', 'floors', 'master_bedrooms_min', 'master_bedrooms',
            'common_bedrooms_min', 'common_bedrooms', 'common_bathrooms_min',
            'common_bathrooms', 'living_rooms_min', 'living_rooms',
            'kitchens_min', 'kitchens', 'has_laundry', 'has_store',
            'has_puja_room', 'furnishing', 'parking_car_min', 'parking_car',
            'parking_bike_min', 'parking_bike', 'rent_duration_value',
            'rent_duration_unit', 'rent_period', 'other_facilities',
            'facilities', 'images' # Our nested relationships
        ]