# your_app/models.py

from django.db import models
from django.conf import settings # To link to the User model
from cloudinary.models import CloudinaryField
from django.utils.text import slugify

class Facility(models.Model):
    """
    A model to store individual, admin-approved facilities. This populates
    the checklist on the frontend.
    """
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Facilities"


class PropertyListing(models.Model):
    """
    A single, comprehensive model to handle all property listings:
    - Land, House, or Apartment
    - For Buy, Sell, or Rent
    """

    # --- Core Discriminator Fields ---
    class ListingPurpose(models.TextChoices):
        BUY = 'BUY', 'Buy'
        SELL = 'SELL', 'Sell'
        RENT = 'RENT', 'Rent'

    class PropertyType(models.TextChoices):
        LAND = 'LAND', 'Land'
        HOUSE = 'HOUSE', 'House'
        APARTMENT = 'APARTMENT', 'Apartment'

    listing_purpose = models.CharField(max_length=4, choices=ListingPurpose.choices)
    property_type = models.CharField(max_length=10, choices=PropertyType.choices)

    # --- Basic Information (Common to All) ---
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=255, help_text="A brief title for the listing.")
    description = models.TextField(blank=True, null=True, help_text="Detailed description or other requirements.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, help_text="Is the listing currently active and visible?")
    
    # --- Location (Common to All) ---
    state = models.CharField(max_length=100, blank=True, null=True, help_text="State or Province")
    district = models.CharField(max_length=100, blank=True, null=True)
    local_area = models.CharField(max_length=255, blank=True, null=True, help_text="Specific local area, neighborhood, or municipality.")

    # --- Price ---
    # For 'Sell'/'Rent', we can use just 'price_max'. For 'Buy', use both.
    price_min = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True, help_text="For 'Buy' listings only.")
    price = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)
    
    class PriceNegotiability(models.TextChoices):
        FIXED = 'FIXED', 'Fixed'
        NEGOTIABLE = 'NEGOTIABLE', 'Negotiable'

    price_negotiable = models.CharField(max_length=10, choices=PriceNegotiability.choices, blank=True, null=True)

    # --- Land & House Size ---
    # Store all land sizes in a base unit like sq.ft internally for easy comparison.
    # The form can handle the conversion. For simplicity here, we store units.
    # Using two fields to capture composite sizes like "5 Ropani and 5 Aana".
    land_size_1_value = models.FloatField(blank=True, null=True)
    land_size_1_unit = models.CharField(max_length=20, blank=True, null=True)
    land_size_2_value = models.FloatField(blank=True, null=True)
    land_size_2_unit = models.CharField(max_length=20, blank=True, null=True)

    # --- Road Information ---
    road_size_min_ft = models.PositiveIntegerField(blank=True, null=True, help_text="For 'Buy' listings only.")
    road_size_ft = models.PositiveIntegerField(blank=True, null=True)
    
    class RoadCondition(models.TextChoices):
        ANY = 'ANY', 'Any'
        PITCHED = 'PITCHED', 'Pitched/Dhalan'
        GRAVELED = 'GRAVELED', 'Graveled'
        SOIL = 'SOIL', 'Kachchi/Soil'

    road_condition = models.CharField(max_length=10, choices=RoadCondition.choices, blank=True, null=True)

    # --- Facing Direction ---
    class FacingDirection(models.TextChoices):
        ANY = 'ANY', 'Any'
        EAST = 'E', 'East'
        WEST = 'W', 'West'
        NORTH = 'N', 'North'
        SOUTH = 'S', 'South'
        NORTHEAST = 'NE', 'Northeast'
        NORTHWEST = 'NW', 'Northwest'
        SOUTHEAST = 'SE', 'Southeast'
        SOUTHWEST = 'SW', 'Southwest'
    
    facing_direction = models.CharField(max_length=3, choices=FacingDirection.choices, blank=True, null=True)

    # --- Land Specific Fields ---
    class LandType(models.TextChoices):
        RESIDENTIAL = 'RESIDENTIAL', 'Residential Land'
        COMMERCIAL = 'COMMERCIAL', 'Commercial Land'
        AGRICULTURAL = 'AGRICULTURAL', 'Agricultural Land'
        INDUSTRIAL = 'INDUSTRIAL', 'Industrial Land'

    land_type = models.CharField(max_length=20, choices=LandType.choices, blank=True, null=True)

    # --- House & Apartment Specific Fields ---
    class PropertyCondition(models.TextChoices):
        ANY = 'ANY', 'Any'
        NEW = 'NEW', 'New (Not Used)'
        JUST_USED = 'JUST_USED', 'Just Used (Few Months)'
        USED_LESS_5 = 'USED_LESS_5', 'Used for less than 5 years'
        USED_MORE_5 = 'USED_MORE_5', 'Used for more than 5 years'
        
    property_condition = models.CharField(max_length=20, choices=PropertyCondition.choices, blank=True, null=True)

    built_year_bs = models.PositiveIntegerField(blank=True, null=True, help_text="Year of construction in Bikram Sambat.")
    built_year_ad = models.PositiveIntegerField(blank=True, null=True, help_text="Year of construction in AD.")
    
    floors_min = models.PositiveIntegerField(blank=True, null=True, help_text="For 'Buy' listings only.")
    floors = models.PositiveIntegerField(blank=True, null=True)

    # Room Details (using min/max for 'Buy' requests)
    master_bedrooms_min = models.PositiveIntegerField(blank=True, null=True, help_text="For 'Buy' listings only.")
    master_bedrooms = models.PositiveIntegerField(blank=True, null=True)
    common_bedrooms_min = models.PositiveIntegerField(blank=True, null=True, help_text="For 'Buy' listings only.")
    common_bedrooms = models.PositiveIntegerField(blank=True, null=True)
    common_bathrooms_min = models.PositiveIntegerField(blank=True, null=True, help_text="For 'Buy' listings only.")
    common_bathrooms = models.PositiveIntegerField(blank=True, null=True)
    living_rooms_min = models.PositiveIntegerField(blank=True, null=True, help_text="For 'Buy' listings only.")
    living_rooms = models.PositiveIntegerField(blank=True, null=True)
    kitchens_min = models.PositiveIntegerField(blank=True, null=True, help_text="For 'Buy' listings only.")
    kitchens = models.PositiveIntegerField(blank=True, null=True)
    
    has_laundry = models.BooleanField(default=False)
    has_store = models.BooleanField(default=False)
    has_puja_room = models.BooleanField(default=False)

    class Furnishing(models.TextChoices):
        FULL = 'FULL', 'Full'
        SEMI = 'SEMI', 'Semi'
        NONE = 'NONE', 'None'

    furnishing = models.CharField(max_length=10, choices=Furnishing.choices, blank=True, null=True)
    
    parking_car_min = models.PositiveIntegerField(blank=True, null=True, help_text="For 'Buy' listings only.")
    parking_car = models.PositiveIntegerField(blank=True, null=True)
    parking_bike_min = models.PositiveIntegerField(blank=True, null=True, help_text="For 'Buy' listings only.")
    parking_bike = models.PositiveIntegerField(blank=True, null=True)
    
    # --- Rental Specific Fields ---
    rent_duration_value = models.PositiveIntegerField(blank=True, null=True)
    rent_duration_unit = models.CharField(max_length=10, choices=[('MONTHS', 'Months'), ('YEARS', 'Years')], blank=True, null=True)
    rent_period = models.CharField(max_length=10, choices=[('MONTHLY', 'Monthly'), ('YEARLY', 'Yearly')], blank=True, null=True)

    # --- THE HYBRID MODEL FOR FACILITIES (Structured + Flexible) ---
    
    # 1. FOR PREDEFINED FACILITIES (The Checklist/Dropdown)
    facilities = models.ManyToManyField(
        Facility, 
        blank=True,
        help_text="Select the available facilities from the predefined list."
    )

    # 2. FOR CUSTOM FACILITIES (The 'Other' Text Box)
    other_facilities = models.TextField(
        blank=True, 
        null=True, 
        help_text="Enter any additional facilities that are not in the list, separated by commas (e.g. Rooftop Garden, Servant Quarters)."
    )


    def __str__(self):
        return f"{self.get_property_type_display()} for {self.get_listing_purpose_display()} - {self.title}"

    class Meta:
        ordering = ['-created_at']


# ==============================================================================
# NEW MODEL FOR HANDLING PROPERTY IMAGES
# ==============================================================================
class PropertyImage(models.Model):
    """
    A model to store images associated with a single property listing.
    This allows for multiple images per property.
    """
    property_listing = models.ForeignKey(
        'PropertyListing', 
        on_delete=models.CASCADE, 
        related_name='images',
        help_text="The property this image belongs to."
    )
    
    # This is the magic field from the cloudinary-django library.
    # It will handle uploading to Cloudinary and store the image URL.
    image = CloudinaryField('image')

    caption = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="An optional caption for the image."
    )
    
    is_thumbnail = models.BooleanField(
        default=False,
        help_text="Is this the main display image for the property?"
    )

    def __str__(self):
        return f"Image for property: {self.property_listing.title}"