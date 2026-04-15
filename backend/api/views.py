import traceback

from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, filters, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Event, Role, AppPermission, PermissionCategory, Ticket, TicketCategory
from .permissions import HasAppPermission, EventPermission, IsEventOwnerOrHasPermission, can_manage_event_tickets, can_access_ticket
from .permission_registry import Perms
from .serializers import (
    UserSerializer, EventSerializer, RoleSerializer,
    PermissionCategorySerializer, AppPermissionSerializer,
    RegisterSerializer, AffiliateSerializer, TicketCategorySerializer,
    TicketSerializer, OnboardingSerializer, AdminOnboardingSerializer,
)
from .services.ticket_pdf import generate_ticket_pdf
from .services.google_wallet import generate_google_wallet_url

User = get_user_model()


# ---------------------------------------------------------------------------
# Event views
# ---------------------------------------------------------------------------

class EventListCreate(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [EventPermission]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin or user.has_app_permission(Perms.EVENTS_VIEW_ALL):
            return Event.objects.all()
        if user.has_app_permission(Perms.EVENTS_VIEW_OWN):
            return Event.objects.filter(organizer=user)
        return Event.objects.none()


class PublicEventListView(generics.ListAPIView):
    """Public read-only event list for the client home page. Only PUBLISHED events."""
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Event.objects.filter(status='PUBLISHED')


class EventDelete(generics.DestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [EventPermission]

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin or user.has_app_permission(Perms.EVENTS_DELETE_ALL):
            return Event.objects.all()
        if user.has_app_permission(Perms.EVENTS_DELETE_OWN):
            return Event.objects.filter(organizer=user)
        return Event.objects.none()

    def perform_destroy(self, instance):
        if instance.status != 'DRAFT':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo gli eventi in bozza possono essere eliminati.")
        super().perform_destroy(instance)


class EventUpdate(generics.UpdateAPIView):
    serializer_class = EventSerializer
    permission_classes = [EventPermission]

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin or user.has_app_permission(Perms.EVENTS_EDIT_ALL):
            return Event.objects.all()
        if user.has_app_permission(Perms.EVENTS_EDIT_OWN):
            return Event.objects.filter(organizer=user)
        return Event.objects.none()


class EventDetail(generics.RetrieveAPIView):
    serializer_class = EventSerializer
    permission_classes = [EventPermission]
    queryset = Event.objects.all()


class PublicEventDetailView(generics.RetrieveAPIView):
    """Public read-only event detail for the client. Only PUBLISHED."""
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Event.objects.filter(status='PUBLISHED')


class EventForceStatusView(APIView):
    """Admin-only endpoint to force-change event status without validation."""
    permission_classes = [HasAppPermission]
    required_permission = Perms.EVENTS_OVERRIDE_STATUS

    def patch(self, request, pk):
        event = get_object_or_404(Event, pk=pk)
        new_status = request.data.get('status')
        valid_statuses = [c[0] for c in Event.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Stato non valido. Valori ammessi: {valid_statuses}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        event.status = new_status
        event.save(update_fields=['status'])
        return Response(EventSerializer(event).data)


# ---------------------------------------------------------------------------
# User / Auth views
# ---------------------------------------------------------------------------

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': RegisterSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'onboarding_completed': user.onboarding_completed,
        }, status=status.HTTP_201_CREATED)


class OnboardingView(generics.UpdateAPIView):
    serializer_class = OnboardingSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch']

    def get_object(self):
        return self.request.user


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# ---------------------------------------------------------------------------
# Role / Permission views
# ---------------------------------------------------------------------------

class RoleListCreate(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [HasAppPermission]
    required_permission = Perms.ROLES_VIEW

    def perform_create(self, serializer):
        if self.request.user.has_app_permission(Perms.ROLES_CREATE):
            serializer.save()
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Non hai il permesso di creare ruoli.")


class RoleDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [HasAppPermission]
    required_permission = Perms.ROLES_VIEW

    def perform_update(self, serializer):
        if self.request.user.has_app_permission(Perms.ROLES_EDIT):
            serializer.save()
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Non hai il permesso di modificare ruoli.")

    def perform_destroy(self, instance):
        if not self.request.user.has_app_permission(Perms.ROLES_DELETE):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Non hai il permesso di eliminare ruoli.")
        if not instance.is_deletable:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Questo ruolo non può essere eliminato.")
        instance.delete()


class PermissionCategoryList(generics.ListAPIView):
    queryset = PermissionCategory.objects.all()
    serializer_class = PermissionCategorySerializer
    permission_classes = [IsAuthenticated]


# ---------------------------------------------------------------------------
# User management views
# ---------------------------------------------------------------------------

class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [HasAppPermission]
    required_permission = Perms.USERS_VIEW
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']


class UserUpdate(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [HasAppPermission]
    required_permission = Perms.USERS_ASSIGN_ROLES


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


# ---------------------------------------------------------------------------
# Ticket category views
# ---------------------------------------------------------------------------

class TicketCategoryCreateView(generics.CreateAPIView):
    serializer_class = TicketCategorySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        event_id = self.request.data.get('event')
        try:
            event = Event.objects.get(id=event_id)
            if not can_manage_event_tickets(self.request.user, event):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Solo l'organizzatore o chi ha i permessi può aggiungere categorie di biglietti.")
            serializer.save(event=event)
        except Event.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Evento non trovato.")


class TicketCategoryUpdateView(generics.UpdateAPIView):
    queryset = TicketCategory.objects.all()
    serializer_class = TicketCategorySerializer
    permission_classes = [IsEventOwnerOrHasPermission]


class TicketCategoryDeleteView(generics.DestroyAPIView):
    queryset = TicketCategory.objects.all()
    serializer_class = TicketCategorySerializer
    permission_classes = [IsEventOwnerOrHasPermission]

    def perform_destroy(self, instance):
        if instance.tickets.count() > 0:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Impossibile eliminare una categoria che ha già venduto biglietti.")
        instance.delete()


# ---------------------------------------------------------------------------
# Ticket views
# ---------------------------------------------------------------------------

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
            if not can_manage_event_tickets(self.request.user, event):
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

            if not can_manage_event_tickets(request.user, ticket.category.event):
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
                "category": ticket.category.name,
            }, status=status.HTTP_200_OK)

        except Ticket.DoesNotExist:
            return Response({"error": "Biglietto non trovato"}, status=status.HTTP_404_NOT_FOUND)


class TicketDownloadPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)

        if not can_access_ticket(request.user, ticket):
            return Response({"error": "Accesso negato"}, status=status.HTTP_403_FORBIDDEN)

        try:
            buffer = generate_ticket_pdf(ticket)
        except Exception:
            traceback.print_exc()
            return Response({"error": "Errore generazione PDF"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Ticket_{ticket.ticket_code}.pdf"'
        return response


class TicketDownloadGoogleWalletView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)

        if not can_access_ticket(request.user, ticket):
            return Response({"error": "Accesso negato"}, status=status.HTTP_403_FORBIDDEN)

        try:
            url = generate_google_wallet_url(ticket, request)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except RuntimeError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception:
            traceback.print_exc()
            return Response({"error": "Errore generazione Google Wallet"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"url": url}, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Admin onboarding
# ---------------------------------------------------------------------------

class AdminOnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = AdminOnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.update(request.user, serializer.validated_data)
        return Response({"message": "Onboarding admin completato"}, status=status.HTTP_200_OK)
