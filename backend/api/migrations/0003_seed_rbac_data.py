from django.db import migrations


def seed_rbac(apps, schema_editor):
    PermissionCategory = apps.get_model('api', 'PermissionCategory')
    AppPermission = apps.get_model('api', 'AppPermission')
    Role = apps.get_model('api', 'Role')
    User = apps.get_model('api', 'User')

    # Import central registry (constants only, no model imports)
    from api.permission_registry import PERMISSION_SEED, BASE_ROLE_PERMISSIONS

    # 1. Create Categories + Permissions from the central registry
    for category_name, perms in PERMISSION_SEED:
        cat, _ = PermissionCategory.objects.get_or_create(name=category_name)
        for display_name, codename in perms:
            AppPermission.objects.get_or_create(
                codename=codename,
                defaults={'name': display_name, 'category': cat}
            )

    # 2. Create Roles
    super_admin, _ = Role.objects.get_or_create(
        name='Super Admin',
        defaults={'description': 'Accesso completo a tutto il sistema', 'is_deletable': False}
    )
    all_permissions = AppPermission.objects.all()
    super_admin.permissions.set(all_permissions)

    base_role, _ = Role.objects.get_or_create(
        name='Base',
        defaults={'description': 'Permessi base per nuovi utenti', 'is_deletable': False}
    )
    base_permissions = AppPermission.objects.filter(codename__in=BASE_ROLE_PERMISSIONS)
    base_role.permissions.set(base_permissions)

    # 3. Link Marco if exists
    marco = User.objects.filter(email='Marco.def4lt@gmail.com').first()
    if marco:
        marco.roles.add(super_admin)


def remove_rbac(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_permissioncategory_apppermission_role_user_roles'),
    ]

    operations = [
        migrations.RunPython(seed_rbac, remove_rbac),
    ]
