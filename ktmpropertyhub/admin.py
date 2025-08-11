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

# --- The Main, Refined Admin for Property Listings ---

class PropertyListingAdminForm(forms.ModelForm):
    """
    Custom admin form to include the multi-image upload field.
    """
    images = MultiImageField(
        min_num=0, max_num=20, max_file_size=1024*1024*8,
        required=False, help_text='Select and upload multiple images for this property.'
    )

    class Meta:
        model = PropertyListing
        fields = '__all__'

@admin.register(PropertyListing)
class PropertyListingAdmin(admin.ModelAdmin):
    """
    The definitive, user-friendly admin configuration for PropertyListings.
    """
    # Use our custom form with the multi-upload widget
    form = PropertyListingAdminForm
    
    # Define which fields are displayed in the main list view
    list_display = ('title', 'listing_purpose', 'property_type', 'user', 'is_active', 'image_count')
    list_filter = ('listing_purpose', 'property_type', 'is_active', 'state', 'district')
    search_fields = ('title', 'local_area', 'user__username')
    list_per_page = 25

    # --- REFINEMENT #1: Display Existing Images as Previews ---
    # We define a set of fields that are only for display ("readonly")
    readonly_fields = ('get_existing_images_preview',)

    def get_existing_images_preview(self, obj):
        """
        A custom method to display HTML previews of already uploaded images.
        """
        if not obj.pk:  # Don't show anything for a new, unsaved listing
            return "(No images yet)"
        
        previews = []
        for img in obj.images.all():
            # Cloudinary's 'image' is now just a URL string, so we use it directly
            # We also create a small thumbnail version on-the-fly for the admin preview
            thumbnail_url = cloudinary.CloudinaryImage(img.image).build_url(height=100, width=100, crop="fill")
            previews.append(f'<a href="{img.image}" target="_blank"><img src="{thumbnail_url}" style="margin-right: 10px;" /></a>')
        
        return format_html(''.join(previews)) if previews else "(No images yet)"
    
    get_existing_images_preview.short_description = "Image Previews"


    # --- REFINEMENT #2: Abstracting the upload logic ---
    def _upload_and_create_images(self, property_listing, image_files):
        """
        A helper function to handle the Cloudinary upload and DB creation.
        Keeps the save_model method clean.
        """
        prop_title_slug = slugify(property_listing.title)
        folder_path = f"property_images/{property_listing.id}-{prop_title_slug}"

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
                property_listing=property_listing,
                image=upload_result['secure_url']
            )

    # Override the save_model method to handle the uploaded files
    def save_model(self, request, obj, form, change):
        # First, save the main PropertyListing object
        super().save_model(request, obj, form, change)
        
        # Get the uploaded files from the form
        uploaded_images = form.cleaned_data.get('images', [])
        
        # If there are any files, process them using our helper function
        if uploaded_images:
            self._upload_and_create_images(obj, uploaded_images)


    # --- REFINEMENT #3: Custom column in the list view ---
    def image_count(self, obj):
        """
        A custom method to display the number of associated images in the list view.
        """
        return obj.images.count()
    
    image_count.short_description = 'Images' # Sets the column header text