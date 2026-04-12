from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, EmailSuppression, SiteSettings


class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Role & Notifications", {"fields": ("role", "email_notifications")}),
    )


@admin.register(EmailSuppression)
class EmailSuppressionAdmin(admin.ModelAdmin):
    list_display = ("email", "reason", "added_at")
    list_filter = ("reason",)
    search_fields = ("email",)
    readonly_fields = ("added_at",)


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ("pk", "emails_paused")

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


admin.site.register(User, CustomUserAdmin)
