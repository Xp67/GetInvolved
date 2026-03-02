/**
 * Configuration of permissions grouped by positions and sections.
 * This structure allows for scalable permission checks across the UI.
 */
export const PERMISSIONS_CONFIG = {
  dashboard: {
    eventi: [
      'events.view_own',
      'events.view_all',
      'events.create',
      'events.edit_own',
      'events.edit_all',
      'events.delete_own',
      'events.delete_all'
    ],
    biglietti: [
      'tickets.manage',
      'tickets.purchase'
    ],
    utenti: [
      'users.view',
      'users.assign_roles'
    ],
    ruoli: [
      'roles.view',
      'roles.create',
      'roles.edit',
      'roles.delete'
    ]
  }
};
