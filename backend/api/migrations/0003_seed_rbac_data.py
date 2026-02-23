from django.db import migrations

def seed_rbac(apps, schema_editor):
    PermissionCategory = apps.get_model('api', 'PermissionCategory')
    AppPermission = apps.get_model('api', 'AppPermission')
    Role = apps.get_model('api', 'Role')
    User = apps.get_model('api', 'User')

    # 1. Create Categories
    event_cat, _ = PermissionCategory.objects.get_or_create(name='Eventi')
    role_cat, _ = PermissionCategory.objects.get_or_create(name='Ruoli')
    user_cat, _ = PermissionCategory.objects.get_or_create(name='Utenti')

    # 2. Create Permissions
    permissions_data = [
        # Eventi
        {'name': 'Visualizza propri', 'codename': 'events.view_own', 'category': event_cat},
        {'name': 'Visualizza tutti', 'codename': 'events.view_all', 'category': event_cat},
        {'name': 'Crea', 'codename': 'events.create', 'category': event_cat},
        {'name': 'Modifica propri', 'codename': 'events.edit_own', 'category': event_cat},
        {'name': 'Modifica tutti', 'codename': 'events.edit_all', 'category': event_cat},
        {'name': 'Elimina propri', 'codename': 'events.delete_own', 'category': event_cat},
        {'name': 'Elimina tutti', 'codename': 'events.delete_all', 'category': event_cat},
        # Ruoli
        {'name': 'Visualizza', 'codename': 'roles.view', 'category': role_cat},
        {'name': 'Crea', 'codename': 'roles.create', 'category': role_cat},
        {'name': 'Modifica', 'codename': 'roles.edit', 'category': role_cat},
        {'name': 'Elimina', 'codename': 'roles.delete', 'category': role_cat},
        # Utenti
        {'name': 'Visualizza', 'codename': 'users.view', 'category': user_cat},
        {'name': 'Assegna Ruoli', 'codename': 'users.assign_roles', 'category': user_cat},
    ]

    for p_data in permissions_data:
        AppPermission.objects.get_or_create(
            codename=p_data['codename'],
            defaults={'name': p_data['name'], 'category': p_data['category']}
        )

    # 3. Create Roles
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
    base_permissions = AppPermission.objects.filter(codename__in=[
        'events.view_own', 'events.create', 'events.edit_own', 'events.delete_own'
    ])
    base_role.permissions.set(base_permissions)

    # 4. Link Marco if exists
    marco = User.objects.filter(email='Marco.def4lt@gmail.com').first()
    if marco:
        marco.roles.add(super_admin)

def remove_rbac(apps, schema_editor):
    pass # No need to delete on reverse for now, or we could delete the roles/categories

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_permissioncategory_apppermission_role_user_roles'),
    ]

    operations = [
        migrations.RunPython(seed_rbac, remove_rbac),
    ]
