# ktmpropertyhub/ktmpropertyhub/urls.py
# This is now the single, main URL configuration for your entire project.

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyListingViewSet

# --- API ROUTER CONFIGURATION ---
# Create a router to automatically generate the API URLs.
router = DefaultRouter()
router.register(r'properties', PropertyListingViewSet, basename='propertylisting')

# --- MAIN URL PATTERNS ---
# This is the master list of URL patterns for your project.
urlpatterns = [
    # 1. The URL for the Django Admin Panel
    path('admin/', admin.site.urls),

    # 2. The URLs for your API, nested under the '/api/' path
    # This will include '/api/properties/', '/api/properties/<id>/', etc.
    path('api/', include(router.urls)),
]