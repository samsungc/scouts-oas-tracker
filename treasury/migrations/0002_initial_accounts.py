from django.db import migrations


def create_initial_accounts(apps, schema_editor):
    Account = apps.get_model("treasury", "Account")
    Account.objects.get_or_create(name="Regular Account")
    Account.objects.get_or_create(name="Anniversary Savings")


def reverse_initial_accounts(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("treasury", "0001_initial"),
    ]
    operations = [
        migrations.RunPython(create_initial_accounts, reverse_initial_accounts),
    ]
