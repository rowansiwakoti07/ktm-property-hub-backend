from django.contrib import admin
from django import forms
from .models import PropertyListing, Facility, PropertyImage
from multiupload.fields import MultiMediaField
from django.utils.text import slugify
from django.utils.html import format_html
import cloudinary.uploader
import time

@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ('name', 'id')
    search_fields = ('name',)

class PropertyListingAdminForm(forms.ModelForm):
    upload_new_images = MultiMediaField(
        min_num=0, max_num=20, max_file_size=1024*1024*8,
        required=False, help_text='Select and upload multiple new images for this property.'
    )
    class Meta:
        model = PropertyListing
        fields = '__all__'

@admin.register(PropertyListing)
class PropertyListingAdmin(admin.ModelAdmin):
    form = PropertyListingAdminForm
    list_display = ('title', 'listing_purpose', 'property_type', 'user', 'is_active', 'image_count')
    list_filter = ('listing_purpose', 'property_type', 'is_active', 'state', 'district')
    search_fields = ('title', 'local_area', 'user__username')
    list_per_page = 25
    readonly_fields = ('get_existing_images_preview')

    # --- THIS IS THE CORE OF THE FUNCTIONAL UI SOLUTION ---
    # We use fieldsets to group the fields logically and provide clear headers.
    fieldsets = (
        (None, {
            'fields': ('listing_purpose', 'property_type', 'user', 'title', 'description', 'is_active')
        }),
        ('Location', {
            'fields': ('state', 'district', 'local_area')
        }),
        ('Price', {
            'fields': ('price_min', 'price', 'price_negotiable')
        }),
        # We create a dedicated section for Land Size
        ('Land Size', {
            'description': 'Enter measurements for either Hilly or Terai area. Entering a value in one section will clear the other.',
            'fields': (
                # We can group them on the same line
                ('size_ropani', 'size_aana', 'size_paisa', 'size_dam'),
                ('size_bigha', 'size_katha', 'size_dhur'),
                'total_land_area_sqft', # Display the calculated result
            )
        }),
        ('Road Information', {
            'fields': ('road_size_min_ft', 'road_size_ft', 'road_condition', 'facing_direction')
        }),
        ('Property & Room Details', {
            'fields': ('land_type', 'property_condition', 'built_year_bs', 'built_year_ad', 'floors_min', 'floors', 'master_bedrooms_min', 'master_bedrooms', 'common_bedrooms_min', 'common_bedrooms', 'common_bathrooms_min', 'common_bathrooms', 'living_rooms_min', 'living_rooms', 'kitchens_min', 'kitchens')
        }),
        ('Features & Facilities', {
            'fields': ('has_laundry', 'has_store', 'has_puja_room', 'furnishing', 'facilities', 'other_facilities')
        }),
        ('Parking', {
            'fields': ('parking_car_min', 'parking_car', 'parking_bike_min', 'parking_bike')
        }),
        ('Rental Details', {
            'fields': ('rent_duration_value', 'rent_duration_unit', 'rent_period')
        }),
        ('Image Upload', {
            'fields': ('upload_new_images', 'get_existing_images_preview')
        })
    )

    def get_form(self, request, obj=None, **kwargs):
        """
        This is a hook to add CSS classes to our form fields for the JS to find.
        """
        form = super().get_form(request, obj, **kwargs)

        hilly_attrs = {'class': 'hilly-area-input'}
        terai_attrs = {'class': 'terai-area-input'}

        form.base_fields['size_ropani'].widget.attrs.update(hilly_attrs)
        form.base_fields['size_aana'].widget.attrs.update(hilly_attrs)
        form.base_fields['size_paisa'].widget.attrs.update(hilly_attrs)
        form.base_fields['size_dam'].widget.attrs.update(hilly_attrs)
        
        form.base_fields['size_bigha'].widget.attrs.update(terai_attrs)
        form.base_fields['size_katha'].widget.attrs.update(terai_attrs)
        form.base_fields['size_dhur'].widget.attrs.update(terai_attrs)

        return form
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
    
        files = request.FILES.getlist('upload_new_images')

        if files:
            prop_title_slug = slugify(obj.title)
            # 1. Define the target folder path cleanly.
            folder_path = f"property_images/{obj.id}-{prop_title_slug}"

            for image_file in files:
                # 2. Define the desired filename (without extension).
                original_filename = image_file.name.split('.')[0]
                timestamp = int(time.time())
                file_name = f"{original_filename}-{timestamp}"
                
                # 3. Call the uploader with the explicit 'folder' and 'public_id' parameters.
                upload_result = cloudinary.uploader.upload(
                    image_file,
                    folder=folder_path,
                    public_id=file_name,
                    overwrite=True,
                    resource_type="image"
                )
                
                # 4. Save the full public_id (folder/filename) that Cloudinary returns.
                # This remains the correct approach.
                PropertyImage.objects.create(
                    property_listing=obj,
                    image=upload_result['public_id'] 
                )

    def get_existing_images_preview(self, obj):
        if not obj.pk:
            return "(No images yet)"
        
        previews = []
        import cloudinary
        for img in obj.images.all():
            if img.image and hasattr(img.image, 'url'):
                thumbnail_url = cloudinary.CloudinaryImage(img.image.public_id).build_url(height=100, width=100, crop="fill")
                previews.append(f'<a href="{img.image.url}" target="_blank"><img src="{thumbnail_url}" style="margin-right: 10px;" /></a>')
        
        return format_html(''.join(previews)) if previews else "(No images yet)"
    
    get_existing_images_preview.short_description = "Image Previews"

    def image_count(self, obj):
        return obj.images.count()
    
    image_count.short_description = 'Images'

    # The Media class tells this admin page to load specific CSS or JS files.
    class Media:
        # The path is relative to your app's static directory
        js = (
            'ktmpropertyhub/js/admin_filters.js',         # For State/District dropdowns
            'ktmpropertyhub/js/admin_dynamic_forms.js',    # For ALL conditional fields
            'ktmpropertyhub/js/admin_land_size.js'
        )