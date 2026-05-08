from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("users", "0006_pendingemailchange_send_count_and_more")]
    operations = [
        migrations.AddField(
            model_name="user",
            name="ec_role",
            field=models.CharField(
                blank=True,
                choices=[
                    ("president", "President"),
                    ("vice_president", "Vice President"),
                    ("treasurer", "Treasurer"),
                    ("quartermaster", "Quartermaster"),
                    ("historian", "Historian"),
                    ("secretary", "Secretary"),
                    ("first_year_rep", "First Year Rep"),
                ],
                default=None,
                max_length=20,
                null=True,
            ),
        ),
    ]
