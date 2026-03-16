from django.db import migrations


def set_pp_intro_level(apps, schema_editor):
    Badge = apps.get_model('badges', 'Badge')
    Badge.objects.filter(category='personal_progression', name='Personal Progression Intro').update(level=0)


def reverse_pp_intro_level(apps, schema_editor):
    Badge = apps.get_model('badges', 'Badge')
    Badge.objects.filter(category='personal_progression', name='Personal Progression Intro').update(level=None)


class Migration(migrations.Migration):

    dependencies = [
        ('badges', '0007_populate_pp_badge_levels'),
    ]

    operations = [
        migrations.RunPython(set_pp_intro_level, reverse_pp_intro_level),
    ]
