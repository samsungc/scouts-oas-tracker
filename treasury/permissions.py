from rest_framework import permissions

EDIT_EC_ROLES = {"treasurer", "president", "vice_president"}


class CanViewTreasury(permissions.BasePermission):
    """Scouters, admins, or any EC member (ec_role is not None)."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return bool(user.ec_role) or user.role in ("scouter", "admin")


class CanEditTreasury(permissions.BasePermission):
    """Scouters, admins, or EC members with treasurer/president/vice_president role."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.role in ("scouter", "admin"):
            return True
        return user.ec_role in EDIT_EC_ROLES
