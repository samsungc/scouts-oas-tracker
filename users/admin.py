from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, EmailSuppression, SiteSettings, PendingEmailChange


class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Role & Notifications", {"fields": ("role", "email_notifications")}),
        ("Email Change", {"fields": ("email_change_locked",)}),
    )

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        # When an admin clears the lock, also reset the send counter.
        if change and "email_change_locked" in form.changed_data and not obj.email_change_locked:
            PendingEmailChange.objects.filter(user=obj).update(send_count=0)


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


@admin.register(PendingEmailChange)
class PendingEmailChangeAdmin(admin.ModelAdmin):
    list_display = ("user", "new_email", "send_count", "created_at")
    readonly_fields = ("user", "new_email", "token", "send_count", "created_at")
    search_fields = ("user__username", "new_email")
