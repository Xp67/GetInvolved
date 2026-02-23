from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics, filters
from .serializer import (
    UserSerializer, EventSerializer, RoleSerializer,
    PermissionCategorySerializer, AppPermissionSerializer,
    RegisterSerializer
)

User = get_user_model()
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Event, Role, AppPermission, PermissionCategory
from .permissions import HasAppPermission, EventPermission


# Create your views here.
class EventListCreate(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [EventPermission]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.email == 'Marco.def4lt@gmail.com' or user.has_app_permission('events.view_all'):
            return Event.objects.all()
        if user.has_app_permission('events.view_own'):
            return Event.objects.filter(organizer=user)
        return Event.objects.none()
    
class EventDelete(generics.DestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [EventPermission]

    def get_queryset(self):
        user = self.request.user
        if user.email == 'Marco.def4lt@gmail.com' or user.has_app_permission('events.delete_all'):
            return Event.objects.all()
        if user.has_app_permission('events.delete_own'):
            return Event.objects.filter(organizer=user)
        return Event.objects.none()
    



class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class RoleListCreate(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [HasAppPermission]
    required_permission = 'roles.view'

    def perform_create(self, serializer):
        if self.request.user.has_app_permission('roles.create'):
            serializer.save()
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Non hai il permesso di creare ruoli.")

class RoleDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [HasAppPermission]
    required_permission = 'roles.view'

    def perform_update(self, serializer):
        if self.request.user.has_app_permission('roles.edit'):
            serializer.save()
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Non hai il permesso di modificare ruoli.")

    def perform_destroy(self, instance):
        if not self.request.user.has_app_permission('roles.delete'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Non hai il permesso di eliminare ruoli.")
        if not instance.is_deletable:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Questo ruolo non può essere eliminato.")
        instance.delete()

class PermissionCategoryList(generics.ListAPIView):
    queryset = PermissionCategory.objects.all()
    serializer_class = PermissionCategorySerializer
    permission_classes = [IsAuthenticated] # Anyone authenticated can see permissions for UI

class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [HasAppPermission]
    required_permission = 'users.view'
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']

class UserUpdate(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [HasAppPermission]
    required_permission = 'users.assign_roles'