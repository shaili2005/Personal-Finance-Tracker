from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.http import HttpResponse
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import Transaction
from .serializers import TransactionSerializer
import csv


# ========== TRANSACTION API ==========
class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only the logged-in user's transactions."""
        return Transaction.objects.filter(user=self.request.user).order_by('-date', '-created_at')

    def perform_create(self, serializer):
        """Assign the logged-in user automatically when creating."""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export user's transactions as a CSV file."""
        qs = self.get_queryset()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=transactions.csv'
        writer = csv.writer(response)
        writer.writerow(['Date', 'Description', 'Type', 'Category', 'Amount'])
        for t in qs:
            writer.writerow([t.date, t.description, t.type, t.category, t.amount])
        return response

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Delete all user's transactions."""
        qs = self.get_queryset()
        count = qs.count()
        qs.delete()
        return Response({'deleted': count})


# ========== SIGNUP API ==========
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    Handles user registration for the frontend.
    Expects: { "username": "", "email": "", "password": "" }
    """
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.save()
    return Response({'message': 'User created successfully!'}, status=status.HTTP_201_CREATED)