from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyListingViewSet, StateViewSet, DistrictViewSet, AddPropertyViewSet

# --- API ROUTER CONFIGURATION ---
# Create a router to automatically generate the API URLs.
router = DefaultRouter()
router.register(r'properties', PropertyListingViewSet, basename='propertylisting')
router.register(r'states', StateViewSet, basename='state')
router.register(r'districts', DistrictViewSet, basename='district')

# --- THIS IS THE NEW, SECURE ENDPOINT ---
# It's for logged-in users to manage their own properties
router.register(r'add-property', AddPropertyViewSet, basename='add-new-property')

# --- MAIN URL PATTERNS ---
# This is the master list of URL patterns for your project.
urlpatterns = [
    # 1. The URL for the Django Admin Panel
    path('admin/', admin.site.urls),

    # 2. The URLs for your API, nested under the '/api/' path
    # This will include '/api/properties/', '/api/properties/<id>/', etc.
    path('api/', include(router.urls)),

    # --- SECURE AUTHENTICATION ENDPOINTS ---
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
]