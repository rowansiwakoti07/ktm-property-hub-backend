from django.contrib import admin
from .models import PropertyListing, Facility, PropertyImage

# --- Enhanced Admin Registration ---

@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ('name', 'id')
    search_fields = ('name',)

# 1. Define the Inline class for PropertyImage
class PropertyImageInline(admin.TabularInline):
    """
    Defines the inline editor for PropertyImage models.
    This allows adding/editing images directly within the PropertyListing admin page.
    """
    model = PropertyImage
    extra = 1  # How many extra empty forms to show
    fields = ('image', 'caption', 'is_thumbnail') # Fields to show in the inline form
    # readonly_fields = ('image_preview',)  # Optional: for showing an image preview

@admin.register(PropertyListing)
class PropertyListingAdmin(admin.ModelAdmin):
    """
    Customizes the admin interface for the PropertyListing model.
    """
    list_display = ('title', 'listing_purpose', 'property_type', 'user', 'is_active', 'created_at')
    list_filter = ('listing_purpose', 'property_type', 'is_active', 'state', 'district')
    search_fields = ('title', 'local_area', 'user__username')
    list_per_page = 25
    
    # 2. Add the inline to the PropertyListing admin
    inlines = [PropertyImageInline]

# 3. (Optional but Recommended) Remove the separate PropertyImage admin
# You can comment out or delete this section, as you'll now manage images
# through the PropertyListing page.
#
# @admin.register(PropertyImage)
# class PropertyImageAdmin(admin.ModelAdmin):
#     list_display = ('property_listing_title', 'is_thumbnail', 'image')
#     list_filter = ('is_thumbnail',)
#     search_fields = ('property_listing__title',)
# 
#     def property_listing_title(self, obj):
#         return obj.property_listing.title
#     property_listing_title.short_description = 'Property Title'