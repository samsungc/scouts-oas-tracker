from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Badge, BadgeRequirement
from .serializers import BadgeListSerializer, BadgeDetailSerializer, BadgeRequirementDetailSerializer
from .permissions import IsAdminOnly
from .import_utils import run_import

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


class ImportBadgeRecordsView(APIView):
    permission_classes = [IsAdminOnly]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file")
        if file is None:
            return Response({"error": "No file provided."}, status=400)

        if not file.name.endswith(".xlsx"):
            return Response({"error": "File must be an .xlsx spreadsheet."}, status=400)

        dry_run = request.data.get("dry_run", "false").lower() == "true"

        result = run_import(file, dry_run=dry_run)

        if "error" in result:
            return Response(result, status=400)

        return Response(result, status=200)