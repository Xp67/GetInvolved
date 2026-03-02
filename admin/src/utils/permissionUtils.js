import { PERMISSIONS_CONFIG } from '../permissionsConfig';

/**
 * Checks if a user has a specific permission codename.
 * @param {Object} user - The user object from the API.
 * @param {string} permission - The permission codename to check.
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.is_super_admin) return true;
  return user.all_permissions?.includes(permission) || false;
};

/**
 * Checks if a user has access to at least one permission in a section.
 * @param {Object} user - The user object.
 * @param {string} sectionName - The name of the section.
 * @returns {boolean}
 */
export const canAccessSection = (user, sectionName) => {
  if (!user) return false;
  if (user.is_super_admin) return true;

  // Flatten all permissions from all positions to find the section
  for (const position in PERMISSIONS_CONFIG) {
    const sections = PERMISSIONS_CONFIG[position];
    if (sections[sectionName]) {
      return sections[sectionName].some(perm => hasPermission(user, perm));
    }
  }
  return false;
};

/**
 * Checks if a user has access to at least one section within a position.
 * @param {Object} user - The user object.
 * @param {string} positionName - The name of the position (e.g., 'dashboard').
 * @returns {boolean}
 */
export const canAccessPosition = (user, positionName) => {
  if (!user) return false;
  if (user.is_super_admin) return true;

  const sections = PERMISSIONS_CONFIG[positionName];
  if (!sections) return false;

  return Object.keys(sections).some(sectionName => canAccessSection(user, sectionName));
};
