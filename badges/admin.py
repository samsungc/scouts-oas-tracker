from django.contrib import admin
from .models import Badge, BadgeRequirement

# Register your models here.
@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "is_active", "created_at")
    list_filter = ("category", "is_active")
    search_fields = ("name",)

@admin.register(BadgeRequirement)
class BadgeRequirementAdmin(admin.ModelAdmin):
    list_display = ("title", "badge", "order")
    list_filter = ("badge",)
    search_fields = ("title", "description", "badge__name")