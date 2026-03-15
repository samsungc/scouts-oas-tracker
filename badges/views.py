from rest_framework import generics, permissions
from .models import Badge, BadgeRequirement
from .serializers import BadgeListSerializer, BadgeDetailSerializer, BadgeRequirementDetailSerializer

class BadgeListView(generics.ListAPIView):
    queryset = Badge.objects.filter(is_active=True).prefetch_related('requirements')
    serializer_class = BadgeDetailSerializer
    permission_classes = [permissions.AllowAny]

class BadgeDetailView(generics.RetrieveAPIView):
    queryset = Badge.objects.filter(is_active=True)
    serializer_class = BadgeDetailSerializer
    permission_classes = [permissions.AllowAny]

class RequirementDetailView(generics.RetrieveAPIView):
    queryset = BadgeRequirement.objects.select_related('badge')
    serializer_class = BadgeRequirementDetailSerializer
    permission_classes = [permissions.AllowAny]