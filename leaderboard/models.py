from django.db import models
from users.models import User


class UserSpecialAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='special_achievements')
    achievement_id = models.CharField(max_length=100)
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement_id')

    def __str__(self):
        return f"{self.user.username} — {self.achievement_id}"


class PasswordResetLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_logs')
    date = models.DateField()

    class Meta:
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.username} — {self.date}"
