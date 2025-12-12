# Generated migration to update roles and add account lockout fields

from django.db import migrations, models
import django.utils.timezone


def update_user_roles(apps, schema_editor):
    """Update existing user roles to new role names"""
    User = apps.get_model('api', 'User')
    
    # Map old roles to new roles
    role_mapping = {
        'technicien': 'service_maintenance',
        'ingenieur': 'service_integration',
        'chefdep': 'chef_departement',
        'superuser': 'superadmin',
    }
    
    for old_role, new_role in role_mapping.items():
        User.objects.filter(role=old_role).update(role=new_role)


def reverse_role_update(apps, schema_editor):
    """Reverse the role update"""
    User = apps.get_model('api', 'User')
    
    # Reverse mapping
    role_mapping = {
        'service_maintenance': 'technicien',
        'service_integration': 'ingenieur',
        'chef_departement': 'chefdep',
        'superadmin': 'superuser',
    }
    
    for new_role, old_role in role_mapping.items():
        User.objects.filter(role=new_role).update(role=old_role)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_update_incident_models'),
    ]

    operations = [
        # Add new fields for account lockout
        migrations.AddField(
            model_name='user',
            name='failed_login_attempts',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='user',
            name='locked_until',
            field=models.DateTimeField(blank=True, null=True),
        ),
        # Update role field choices and max_length
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('service_maintenance', 'Service Maintenance'),
                    ('service_integration', 'Service Integration et Développement'),
                    ('chef_departement', 'Chef de Département'),
                    ('superadmin', 'Super Admin'),
                ],
                default='service_maintenance',
                max_length=30
            ),
        ),
        # Data migration to update existing roles
        migrations.RunPython(update_user_roles, reverse_role_update),
    ]
