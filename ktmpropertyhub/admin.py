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
    readonly_fields = ('get_existing_images_preview',)
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
    
        files = request.FILES.getlist('upload_new_images')

        if files:
            prop_title_slug = slugify(obj.title)
            folder_path = f"property_images/{obj.id}-{prop_title_slug}"

            for image_file in files:
                original_filename = image_file.name.split('.')[0]
                timestamp = int(time.time())
                public_id = f"{folder_path}/{original_filename}-{timestamp}"
                
                upload_result = cloudinary.uploader.upload(
                    image_file,
                    public_id=public_id,
                    overwrite=True,
                    resource_type="image"
                )
                
                # --- THIS IS THE DEFINITIVE FIX ---
                # We save the 'public_id' from the result, NOT the 'secure_url'.
                # The CloudinaryField will store this reference and can generate
                # the full URL from it whenever needed.
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