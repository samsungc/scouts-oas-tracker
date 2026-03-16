from django.db import migrations


def populate_pp_levels(apps, schema_editor):
    Badge = apps.get_model('badges', 'Badge')
    name_to_level = {
        'Trailhead': 1,
        'Tree Line': 2,
        'Snow Line': 3,
        'Summit': 4,
    }
    for name, level in name_to_level.items():
        Badge.objects.filter(category='personal_progression', name=name).update(level=level)


def reverse_pp_levels(apps, schema_editor):
    Badge = apps.get_model('badges', 'Badge')
    Badge.objects.filter(
        category='personal_progression',
        name__in=['Trailhead', 'Tree Line', 'Snow Line', 'Summit'],
    ).update(level=None)


class Migration(migrations.Migration):

    dependencies = [
        ('badges', '0006_populate_badge_levels'),
    ]

    operations = [
        migrations.RunPython(populate_pp_levels, reverse_pp_levels),
    ]
