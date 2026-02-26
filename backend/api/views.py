from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializer import (
    UserSerializer, EventSerializer, RoleSerializer,
    PermissionCategorySerializer, AppPermissionSerializer,
    RegisterSerializer, AffiliateSerializer, TicketCategorySerializer,
    TicketSerializer
)

User = get_user_model()
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Event, Role, AppPermission, PermissionCategory, Ticket, TicketCategory
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
        if user.is_super_admin or user.has_app_permission('events.view_all'):
            return Event.objects.all()
        if user.has_app_permission('events.view_own'):
            return Event.objects.filter(organizer=user)
        return Event.objects.none()
    
class EventDelete(generics.DestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [EventPermission]

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin or user.has_app_permission('events.delete_all'):
            return Event.objects.all()
        if user.has_app_permission('events.delete_own'):
            return Event.objects.filter(organizer=user)
        return Event.objects.none()

class EventUpdate(generics.UpdateAPIView):
    serializer_class = EventSerializer
    permission_classes = [EventPermission]

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin or user.has_app_permission('events.edit_all'):
            return Event.objects.all()
        if user.has_app_permission('events.edit_own'):
            return Event.objects.filter(organizer=user)
        return Event.objects.none()

class EventDetail(generics.RetrieveAPIView):
    serializer_class = EventSerializer
    permission_classes = [EventPermission]
    queryset = Event.objects.all()


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

from rest_framework.pagination import PageNumberPagination

class AffiliatePagination(PageNumberPagination):
    page_size = 20

class AffiliateList(generics.ListAPIView):
    serializer_class = AffiliateSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AffiliatePagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']

    def get_queryset(self):
        return User.objects.filter(affiliated_to=self.request.user).order_by('-affiliation_date')

class TicketCategoryCreateView(generics.CreateAPIView):
    serializer_class = TicketCategorySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        event_id = self.request.data.get('event')
        try:
            event = Event.objects.get(id=event_id)
            if event.organizer != self.request.user and not self.request.user.is_super_admin and not self.request.user.has_app_permission('tickets.manage'):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Solo l'organizzatore o chi ha i permessi può aggiungere categorie di biglietti.")
            serializer.save(event=event)
        except Event.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Evento non trovato.")

class TicketCategoryUpdateView(generics.UpdateAPIView):
    queryset = TicketCategory.objects.all()
    serializer_class = TicketCategorySerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        category = self.get_object()
        if category.event.organizer != self.request.user and not self.request.user.is_super_admin and not self.request.user.has_app_permission('tickets.manage'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo l'organizzatore o chi ha i permessi può modificare le categorie.")
        serializer.save()

class TicketCategoryDeleteView(generics.DestroyAPIView):
    queryset = TicketCategory.objects.all()
    serializer_class = TicketCategorySerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.event.organizer != self.request.user and not self.request.user.is_super_admin and not self.request.user.has_app_permission('tickets.manage'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo l'organizzatore o chi ha i permessi può eliminare le categorie.")
        # Optional: check if tickets have already been sold
        if instance.tickets.count() > 0:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Impossibile eliminare una categoria che ha già venduto biglietti.")
        instance.delete()

class TicketPurchaseView(generics.CreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        category_id = self.request.data.get('category')
        try:
            category = TicketCategory.objects.get(id=category_id)
            if category.remaining_quantity <= 0:
                from rest_framework.exceptions import ValidationError
                raise ValidationError("I biglietti per questa categoria sono esauriti.")
            serializer.save(owner=self.request.user, category=category)
        except TicketCategory.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Categoria biglietto non trovata.")

class UserTicketsListView(generics.ListAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(owner=self.request.user).order_by('-purchase_date')

class EventTicketsListView(generics.ListAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        event_id = self.kwargs.get('event_id')
        try:
            event = Event.objects.get(id=event_id)
            if event.organizer != self.request.user and not self.request.user.is_super_admin and not self.request.user.has_app_permission('tickets.manage'):
                return Ticket.objects.none()
            return Ticket.objects.filter(category__event=event).order_by('-purchase_date')
        except Event.DoesNotExist:
            return Ticket.objects.none()

class TicketValidationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ticket_code = request.data.get('ticket_code')
        ticket_id = request.data.get('ticket_id')
        from django.utils import timezone

        try:
            if ticket_code:
                ticket = Ticket.objects.get(ticket_code=ticket_code)
            elif ticket_id:
                ticket = Ticket.objects.get(id=ticket_id)
            else:
                return Response({"error": "Identificativo biglietto mancante"}, status=status.HTTP_400_BAD_REQUEST)

            event = ticket.category.event
            if event.organizer != request.user and not request.user.is_super_admin and not request.user.has_app_permission('tickets.manage'):
                return Response({"error": "Permesso negato"}, status=status.HTTP_403_FORBIDDEN)

            if ticket.is_checked_in:
                return Response({
                    "error": "Biglietto già validato",
                    "checked_in_at": ticket.checked_in_at,
                    "owner_name": f"{ticket.owner.first_name} {ticket.owner.last_name}".strip() or ticket.owner.username,
                }, status=status.HTTP_400_BAD_REQUEST)

            ticket.is_checked_in = True
            ticket.checked_in_at = timezone.now()
            ticket.save()

            return Response({
                "message": "Biglietto validato con successo",
                "owner_name": f"{ticket.owner.first_name} {ticket.owner.last_name}".strip() or ticket.owner.username,
                "category": ticket.category.name
            }, status=status.HTTP_200_OK)

        except Ticket.DoesNotExist:
            return Response({"error": "Biglietto non trovato"}, status=status.HTTP_404_NOT_FOUND)
