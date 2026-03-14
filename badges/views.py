from rest_framework import generics, permissions
from .models import Badge
from .serializers import BadgeListSerializer, BadgeDetailSerializer

class BadgeListView(generics.ListAPIView):
    queryset = Badge.objects.filter(is_active=True)
    serializer_class = BadgeListSerializer
    permission_classes = [permissions.AllowAny]

class BadgeDetailView(generics.RetrieveAPIView):
    queryset = Badge.objects.filter(is_active=True)
    serializer_class = BadgeDetailSerializer
    permission_classes = [permissions.AllowAny]