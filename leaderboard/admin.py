from django.contrib import admin
from .models import UserSpecialAchievement, PasswordResetLog


@admin.register(UserSpecialAchievement)
class UserSpecialAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement_id', 'awarded_at')
    list_filter = ('achievement_id',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name')


@admin.register(PasswordResetLog)
class PasswordResetLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'date')
    search_fields = ('user__username',)
