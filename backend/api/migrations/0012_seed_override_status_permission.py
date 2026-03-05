from django.db import migrations


def seed_override_permission(apps, schema_editor):
    PermissionCategory = apps.get_model('api', 'PermissionCategory')
    AppPermission = apps.get_model('api', 'AppPermission')
    Role = apps.get_model('api', 'Role')

    event_cat = PermissionCategory.objects.get(name='Eventi')

    perm, _ = AppPermission.objects.get_or_create(
        codename='events.override_status',
        defaults={'name': 'Cambio Stato Admin', 'category': event_cat}
    )

    # Add to Super Admin role
    super_admin = Role.objects.filter(name='Super Admin').first()
    if super_admin:
        super_admin.permissions.add(perm)


def remove_override_permission(apps, schema_editor):
    AppPermission = apps.get_model('api', 'AppPermission')
    AppPermission.objects.filter(codename='events.override_status').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_event_status'),
    ]

    operations = [
        migrations.RunPython(seed_override_permission, remove_override_permission),
    ]
