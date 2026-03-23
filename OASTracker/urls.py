"""
URL configuration for OASTracker project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import CaseInsensitiveTokenView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", CaseInsensitiveTokenView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/users/", include("users.urls")),
    path("api/badges/", include("badges.urls")),
    path("api/", include("submissions.urls")),
    path("api/leaderboard/", include("leaderboard.urls")),
]

if not getattr(settings, "USE_S3", False):
    from django.views.static import serve
    urlpatterns += [
        re_path(r"^media/(?P<path>.+)$", serve, {"document_root": settings.MEDIA_ROOT}),
    ]
