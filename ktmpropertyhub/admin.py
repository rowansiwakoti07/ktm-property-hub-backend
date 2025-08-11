from django.contrib import admin
from django import forms
from .models import PropertyListing, Facility, PropertyImage
from multiupload.fields import MultiMediaField
from django.utils.html import format_html

@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ('name', 'id')
    search_fields = ('name',)

class PropertyListingAdminForm(forms.ModelForm):
    # This field just renders the widget.
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
    readonly_fields = ('get_existing_images_preview',)
    
    def save_model(self, request, obj, form, change):
        # First, save the main PropertyListing object to ensure it has an ID.
        super().save_model(request, obj, form, change)
    
        # Get the files directly from the request.
        files = request.FILES.getlist('upload_new_images')

        if files:
            for image_file in files:
                # The logic is now extremely simple: just create the object.
                # The 'upload_to' function in the model will handle the rest.
                PropertyImage.objects.create(
                    property_listing=obj,
                    image=image_file
                )

    # --- UX Refinements (Remain the same and will now work correctly) ---
    def get_existing_images_preview(self, obj):
        if not obj.pk:
            return "(No images yet)"
        
        previews = []
        for img in obj.images.all():
            if img.image and hasattr(img.image, 'url'):
                import cloudinary
                thumbnail_url = cloudinary.CloudinaryImage(img.image.public_id).build_url(height=100, width=100, crop="fill")
                previews.append(f'<a href="{img.image.url}" target="_blank"><img src="{thumbnail_url}" style="margin-right: 10px;" /></a>')
        
        return format_html(''.join(previews)) if previews else "(No images yet)"
    
    get_existing_images_preview.short_description = "Image Previews"

    def image_count(self, obj):
        return obj.images.count()
    
    image_count.short_description = 'Images'