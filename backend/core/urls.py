from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

def home(request):
    return HttpResponse("<h2>✅ Finance Tracker Backend Running Successfully!</h2><p>Try visiting /admin or /api/transactions/</p>")

urlpatterns = [
    path('', home),  # 👈 Root route to fix 404
    path('admin/', admin.site.urls),
    path('api/', include('tracker.urls')),  # Your app routes
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
