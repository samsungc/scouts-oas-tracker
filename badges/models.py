from django.db import models

# Create your models here.
class Badge(models.Model):
    CATEGORY_CHOICES = [
        ('vertical_skills', "Vertical Skills"),
        ('sailing_skills', "Sailing Skills"),
        ('scoutcraft_skills', "Scoutcraft Skills"),
        ('camping_skills', "Camping Skills"),
        ('trail_skills', "Trail Skills"),
        ('winter_skills', "Winter Skills"),
        ('paddling_skills', "Paddling Skills"),
        ('aquatic_skills', "Aquatic Skills"),
        ('emergency_skills', "Emergency Skills"),
        ('personal_progression', "Personal Progression"),

    ]

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class BadgeRequirement(models.Model):
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name="requirements",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    hint = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.badge.name} - {self.title}"