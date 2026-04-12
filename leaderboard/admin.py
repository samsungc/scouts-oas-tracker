from django import forms
from django.contrib import admin
from .models import UserSpecialAchievement, PasswordResetLog
from .views import ACHIEVEMENTS


class UserSpecialAchievementForm(forms.ModelForm):
    achievement_id = forms.ChoiceField(
        choices=[(a['id'], f"{a['id']}  —  {a['name']}") for a in ACHIEVEMENTS],
    )

    class Meta:
        model = UserSpecialAchievement
        fields = '__all__'


@admin.register(UserSpecialAchievement)
class UserSpecialAchievementAdmin(admin.ModelAdmin):
    form = UserSpecialAchievementForm
    list_display = ('user', 'achievement_id', 'awarded_at')
    list_filter = ('achievement_id',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name')


@admin.register(PasswordResetLog)
class PasswordResetLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'date')
    search_fields = ('user__username',)
