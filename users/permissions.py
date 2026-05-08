from rest_framework import permissions


class IsECOrScouterOrAdmin(permissions.BasePermission):
    """EC members (any ec_role), scouters, and admins. Blocks plain scouts."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return bool(user.ec_role) or user.role in ("scouter", "admin")
