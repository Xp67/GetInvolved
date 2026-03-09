from rest_framework.permissions import BasePermission, SAFE_METHODS
from .permission_registry import Perms


class HasAppPermission(BasePermission):
    """
    Generic permission class that checks for a specific codename.
    The view must define a `required_permission` attribute.
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
    """Handles list / create level permission checks for events."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_super_admin:
            return True

        if request.method == 'GET':
            return (
                user.has_app_permission(Perms.EVENTS_VIEW_OWN)
                or user.has_app_permission(Perms.EVENTS_VIEW_ALL)
            )
        if request.method == 'POST':
            return user.has_app_permission(Perms.EVENTS_CREATE)
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_super_admin:
            return True

        is_owner = obj.organizer == user

        if request.method in SAFE_METHODS:
            if is_owner:
                return (
                    user.has_app_permission(Perms.EVENTS_VIEW_OWN)
                    or user.has_app_permission(Perms.EVENTS_VIEW_ALL)
                )
            return user.has_app_permission(Perms.EVENTS_VIEW_ALL)

        if request.method in ('PUT', 'PATCH'):
            if is_owner:
                return (
                    user.has_app_permission(Perms.EVENTS_EDIT_OWN)
                    or user.has_app_permission(Perms.EVENTS_EDIT_ALL)
                )
            return user.has_app_permission(Perms.EVENTS_EDIT_ALL)

        if request.method == 'DELETE':
            if is_owner:
                return (
                    user.has_app_permission(Perms.EVENTS_DELETE_OWN)
                    or user.has_app_permission(Perms.EVENTS_DELETE_ALL)
                )
            return user.has_app_permission(Perms.EVENTS_DELETE_ALL)

        return False


class IsEventOwnerOrHasPermission(BasePermission):
    """
    Used for ticket-category and ticket-management views.
    Grants access if the user is the event organizer, a super admin,
    or has the `tickets.manage` permission.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_super_admin:
            return True

        # obj can be a TicketCategory or a Ticket
        event = getattr(obj, 'event', None)
        if event is None:
            category = getattr(obj, 'category', None)
            if category:
                event = category.event

        if event and event.organizer == user:
            return True

        return user.has_app_permission(Perms.TICKETS_MANAGE)
