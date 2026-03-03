import { PERMISSIONS_CONFIG } from '../permissionsConfig';

export interface AppUser {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    bio?: string;
    avatar?: string | null;
    roles_details?: Array<{
        id: number;
        name: string;
        description: string;
        permissions_details: Array<{ id: number; name: string; codename: string }>;
        is_deletable: boolean;
    }>;
    all_permissions?: string[];
    is_super_admin?: boolean;
    affiliate_code?: string;
    affiliated_to_username?: string | null;
    affiliation_date?: string | null;
}

/**
 * Checks if a user has a specific permission codename.
 */
export const hasPermission = (user: AppUser | null, permission: string): boolean => {
    if (!user) return false;
    if (user.is_super_admin) return true;
    return user.all_permissions?.includes(permission) || false;
};

/**
 * Checks if a user has access to at least one permission in a section.
 */
export const canAccessSection = (user: AppUser | null, sectionName: string): boolean => {
    if (!user) return false;
    if (user.is_super_admin) return true;

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
 */
export const canAccessPosition = (user: AppUser | null, positionName: string): boolean => {
    if (!user) return false;
    if (user.is_super_admin) return true;

    const sections = PERMISSIONS_CONFIG[positionName];
    if (!sections) return false;

    return Object.keys(sections).some(sectionName => canAccessSection(user, sectionName));
};
