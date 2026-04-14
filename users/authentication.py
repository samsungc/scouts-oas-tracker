from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTCookieAuthentication(JWTAuthentication):
    """Read JWT access token from an httpOnly cookie instead of the Authorization header."""

    def authenticate(self, request):
        raw_token = request.COOKIES.get('access')
        if raw_token is None:
            return None  # No cookie → unauthenticated, not an error
        validated_token = self.get_validated_token(raw_token)  # raises AuthenticationFailed if invalid/expired
        return self.get_user(validated_token), validated_token
