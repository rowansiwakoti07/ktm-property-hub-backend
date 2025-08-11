from django.contrib import admin
from django import forms
from .models import PropertyListing, Facility, PropertyImage
from multiupload.fields import MultiImageField
from django.utils.text import slugify
from django.utils.html import format_html
import cloudinary.uploader
import time

# --- Admin for Supporting Models ---

@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ('name', 'id')
    search_fields = ('name',)

# --- The Definitive PropertyListing Admin with Multi-Image Upload ---

# 1. We create our custom form.
class PropertyListingAdminForm(forms.ModelForm):
    # 2. We give our upload field a unique, non-conflicting name.
    upload_new_images = MultiImageField(
        min_num=0, max_num=20, max_file_size=1024*1024*8,
        required=False,
        help_text='Select and upload multiple new images for this property.'
    )

    class Meta:
        model = PropertyListing
        fields = '__all__'

@admin.register(PropertyListing)
class PropertyListingAdmin(admin.ModelAdmin):
    # 3. We tell the admin to use our custom form.
    form = PropertyListingAdminForm
    
    list_display = ('title', 'listing_purpose', 'property_type', 'user', 'is_active', 'image_count')
    list_filter = ('listing_purpose', 'property_type', 'is_active', 'state', 'district')
    search_fields = ('title', 'local_area', 'user__username')
    list_per_page = 25
    readonly_fields = ('get_existing_images_preview',)

    # 4. We override save_model to handle the files from our uniquely named field.
    def save_model(self, request, obj, form, change):
        # First, save the main PropertyListing object to ensure it has an ID.
        super().save_model(request, obj, form, change)

        # Access the files from the 'upload_new_images' field.
        image_files = form.cleaned_data.get('upload_new_images', [])
        
        if image_files:
            prop_title_slug = slugify(obj.title)
            folder_path = f"property_images/{obj.id}-{prop_title_slug}"

            for image_file in image_files:
                original_filename = image_file.name.split('.')[0]
                timestamp = int(time.time())
                public_id = f"{folder_path}/{original_filename}-{timestamp}"
                
                # Manually upload the file to Cloudinary
                upload_result = cloudinary.uploader.upload(
                    image_file,
                    public_id=public_id,
                    overwrite=True,
                    resource_type="image"
                )
                
                # Create the PropertyImage record in our database
                PropertyImage.objects.create(
                    property_listing=obj,
                    image=upload_result['secure_url']
                )

    # --- User Experience Refinements ---
    def get_existing_images_preview(self, obj):
        if not obj.pk:
            return "(No images yet)"
        
        previews = []
        # We access the images via the correct related_name 'images'
        for img in obj.images.all(): 
            thumbnail_url = cloudinary.CloudinaryImage(img.image).build_url(height=100, width=100, crop="fill")
            previews.append(f'<a href="{img.image}" target="_blank"><img src="{thumbnail_url}" style="margin-right: 10px;" /></a>')
        
        return format_html(''.join(previews)) if previews else "(No images yet)"
    
    get_existing_images_preview.short_description = "Image Previews"

    def image_count(self, obj):
        # We count the images via the correct related_name 'images'
        return obj.images.count()
    
    image_count.short_description = 'Images'