# Generated migration for updating incident models

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        # Add maintenance_type to HardwareIncident
        migrations.AddField(
            model_name='hardwareincident',
            name='maintenance_type',
            field=models.CharField(blank=True, choices=[('preventive', 'Préventive'), ('corrective', 'Corrective')], max_length=20, null=True),
        ),
        # Remove fields from SoftwareIncident
        migrations.RemoveField(
            model_name='softwareincident',
            name='game',
        ),
        migrations.RemoveField(
            model_name='softwareincident',
            name='group',
        ),
        migrations.RemoveField(
            model_name='softwareincident',
            name='exercice',
        ),
        migrations.RemoveField(
            model_name='softwareincident',
            name='secteur',
        ),
        migrations.RemoveField(
            model_name='softwareincident',
            name='position_logique',
        ),
        # Rename mode_radar to nom_radar in SoftwareIncident
        migrations.RenameField(
            model_name='softwareincident',
            old_name='mode_radar',
            new_name='nom_radar',
        ),
    ]

