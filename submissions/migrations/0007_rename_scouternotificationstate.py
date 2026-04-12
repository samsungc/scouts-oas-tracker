from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('submissions', '0006_notification_state_pending'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='ScouerNotificationState',
            new_name='ScouterNotificationState',
        ),
    ]
