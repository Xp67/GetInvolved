"""
Central registry of all application permission codenames.
This is the single source of truth for permission strings used across
the codebase: views, permission classes, seed migrations, and tests.
"""


class Perms:
    """All permission codenames as constants."""

    # --- Eventi ---
    EVENTS_VIEW_OWN = 'events.view_own'
    EVENTS_VIEW_ALL = 'events.view_all'
    EVENTS_CREATE = 'events.create'
    EVENTS_EDIT_OWN = 'events.edit_own'
    EVENTS_EDIT_ALL = 'events.edit_all'
    EVENTS_DELETE_OWN = 'events.delete_own'
    EVENTS_DELETE_ALL = 'events.delete_all'
    EVENTS_OVERRIDE_STATUS = 'events.override_status'

    # --- Ruoli ---
    ROLES_VIEW = 'roles.view'
    ROLES_CREATE = 'roles.create'
    ROLES_EDIT = 'roles.edit'
    ROLES_DELETE = 'roles.delete'

    # --- Utenti ---
    USERS_VIEW = 'users.view'
    USERS_ASSIGN_ROLES = 'users.assign_roles'

    # --- Biglietti ---
    TICKETS_MANAGE = 'tickets.manage'

    # --- Sviluppo ---
    DEVELOPER_VIEW = 'developer.view'


# Seed data used by the RBAC migration.
# Each entry: (category_name, [(display_name, codename), ...])
PERMISSION_SEED = [
    ('Eventi', [
        ('Visualizza propri', Perms.EVENTS_VIEW_OWN),
        ('Visualizza tutti', Perms.EVENTS_VIEW_ALL),
        ('Crea', Perms.EVENTS_CREATE),
        ('Modifica propri', Perms.EVENTS_EDIT_OWN),
        ('Modifica tutti', Perms.EVENTS_EDIT_ALL),
        ('Elimina propri', Perms.EVENTS_DELETE_OWN),
        ('Elimina tutti', Perms.EVENTS_DELETE_ALL),
        ('Override Stato', Perms.EVENTS_OVERRIDE_STATUS),
    ]),
    ('Ruoli', [
        ('Visualizza', Perms.ROLES_VIEW),
        ('Crea', Perms.ROLES_CREATE),
        ('Modifica', Perms.ROLES_EDIT),
        ('Elimina', Perms.ROLES_DELETE),
    ]),
    ('Utenti', [
        ('Visualizza', Perms.USERS_VIEW),
        ('Assegna Ruoli', Perms.USERS_ASSIGN_ROLES),
    ]),
    ('Biglietti', [
        ('Gestione Biglietti', Perms.TICKETS_MANAGE),
    ]),
    ('Sviluppo', [
        ('Visualizza Dev Tools', Perms.DEVELOPER_VIEW),
    ]),
]

# Permissions assigned to the 'Base' role by default
BASE_ROLE_PERMISSIONS = [
    Perms.EVENTS_VIEW_OWN,
    Perms.EVENTS_CREATE,
    Perms.EVENTS_EDIT_OWN,
    Perms.EVENTS_DELETE_OWN,
]
