
from django.contrib import admin
from .models import PropertyListing, Facility, PropertyImage

# --- Register your models here ---

# A simple registration will make the model appear in the admin site.
admin.site.register(Facility)
admin.site.register(PropertyListing)
admin.site.register(PropertyImage)