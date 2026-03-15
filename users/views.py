from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import MeSerializer, ChangePasswordSerializer, CreateUserSerializer


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = MeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response(
            {"detail": "Password changed successfully."},
            status=status.HTTP_200_OK
        )

class ScoutListView(generics.ListAPIView):
    """Returns all users with role='scout'. Scouters and admins only."""
    from .serializers import ScoutListSerializer
    serializer_class = ScoutListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        from submissions.permissions import IsScouterOrAdmin
        return [permissions.IsAuthenticated(), IsScouterOrAdmin()]

    def get_queryset(self):
        from .models import User
        return User.objects.filter(role="scout").order_by("username")


ROLE_HIERARCHY = {"scout": 0, "scouter": 1, "admin": 2}


class CreateUserView(generics.CreateAPIView):
    """Create a new user. Scouters and admins only; can only assign roles <= their own."""
    serializer_class = CreateUserSerializer

    def get_permissions(self):
        from submissions.permissions import IsScouterOrAdmin
        return [permissions.IsAuthenticated(), IsScouterOrAdmin()]

    def perform_create(self, serializer):
        requested_role = serializer.validated_data.get("role", "scout")
        creator_role = self.request.user.role
        if ROLE_HIERARCHY.get(requested_role, 0) > ROLE_HIERARCHY.get(creator_role, 0):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You cannot create a user with a higher role than your own.")
        serializer.save()
