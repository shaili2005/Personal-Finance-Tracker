from rest_framework import routers
from django.urls import path
from .views import TransactionViewSet, signup

router = routers.DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transactions')

urlpatterns = [
    path('signup/', signup),
] + router.urls