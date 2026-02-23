from rest_framework.permissions import BasePermission, SAFE_METHODS

class HasAppPermission(BasePermission):
    """
    Base permission class that checks for a specific codename.
    The view should define `required_permission`.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_super_admin:
            return True

        required_perm = getattr(view, 'required_permission', None)
        if not required_perm:
            return True

        return request.user.has_app_permission(required_perm)

class EventPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_super_admin:
            return True

        if request.method == 'GET':
            return user.has_app_permission('events.view_own') or user.has_app_permission('events.view_all')
        if request.method == 'POST':
            return user.has_app_permission('events.create')
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_super_admin:
            return True

        is_owner = obj.organizer == user

        if request.method in SAFE_METHODS:
            if is_owner:
                return user.has_app_permission('events.view_own') or user.has_app_permission('events.view_all')
            return user.has_app_permission('events.view_all')

        if request.method in ['PUT', 'PATCH']:
            if is_owner:
                return user.has_app_permission('events.edit_own') or user.has_app_permission('events.edit_all')
            return user.has_app_permission('events.edit_all')

        if request.method == 'DELETE':
            if is_owner:
                return user.has_app_permission('events.delete_own') or user.has_app_permission('events.delete_all')
            return user.has_app_permission('events.delete_all')

        return False
