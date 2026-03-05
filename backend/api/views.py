from django.shortcuts import render, get_object_or_404
from django.contrib.auth import get_user_model
from django.http import HttpResponse, JsonResponse
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
import qrcode
import json
import time
import jwt
import os
import traceback
from google.cloud import secretmanager
from django.conf import settings
from rest_framework import generics, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializer import (
    UserSerializer, EventSerializer, RoleSerializer,
    PermissionCategorySerializer, AppPermissionSerializer,
    RegisterSerializer, AffiliateSerializer, TicketCategorySerializer,
    TicketSerializer, OnboardingSerializer, AdminOnboardingSerializer
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
        if user.is_super_admin or user.has_app_permission('events.delete_all'):
            return Event.objects.all()
        if user.has_app_permission('events.delete_own'):
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
        if user.is_super_admin or user.has_app_permission('events.edit_all'):
            return Event.objects.all()
        if user.has_app_permission('events.edit_own'):
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
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        if not (user.is_super_admin or user.has_app_permission('events.override_status')):
            return Response({"error": "Permesso negato."}, status=status.HTTP_403_FORBIDDEN)

        event = get_object_or_404(Event, pk=pk)
        new_status = request.data.get('status')

        valid_statuses = [c[0] for c in Event.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({"error": f"Stato non valido. Valori ammessi: {valid_statuses}"}, status=status.HTTP_400_BAD_REQUEST)

        event.status = new_status
        event.save(update_fields=['status'])
        serializer = EventSerializer(event)
        return Response(serializer.data)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Generate JWT tokens for auto-login
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


class TicketDownloadPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)
        
        # Security check: Only the owner, event organizer, or admin can download the PDF
        if ticket.owner != request.user and ticket.category.event.organizer != request.user and not request.user.is_super_admin:
            return Response({"error": "Accesso negato"}, status=status.HTTP_403_FORBIDDEN)

        # Generate QR Code
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(ticket.ticket_code)
        qr.make(fit=True)
        img_qr = qr.make_image(fill_color="black", back_color="white")
        
        # Save QR code to a BytesIO stream
        qr_stream = BytesIO()
        img_qr.save(qr_stream, format="PNG")
        qr_stream.seek(0)

        # Generate PDF using ReportLab
        try:
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4
            
            event = ticket.category.event
        
        except Exception as e:
            print("PDF Error:")
            traceback.print_exc()
            return Response({"error": "Errore generazione PDF"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Draw Ticket Graphic Border
        p.setStrokeColor(colors.HexColor('#6200EA'))
        p.setLineWidth(3)
        p.rect(2*cm, height - 12*cm, width - 4*cm, 10*cm)

        # Draw Header Profile
        p.setFillColor(colors.HexColor('#6200EA'))
        p.rect(2*cm, height - 4*cm, width - 4*cm, 2*cm, fill=1)
        
        p.setFillColor(colors.white)
        p.setFont("Helvetica-Bold", 20)
        p.drawString(2.5*cm, height - 3.2*cm, "E-TICKET")
        p.setFont("Helvetica", 12)
        p.drawRightString(width - 2.5*cm, height - 3.2*cm, "GetInvolved")

        # Ticket Information
        p.setFillColor(colors.black)
        
        # Event Details
        p.setFont("Helvetica-Bold", 18)
        p.drawString(2.5*cm, height - 5*cm, event.title)
        
        p.setFont("Helvetica", 12)
        date_str = event.date.strftime('%d/%m/%Y') if event.date else 'Data N/D'
        time_str = event.start_time.strftime('%H:%M') if event.start_time else ''
        p.drawString(2.5*cm, height - 5.8*cm, f"Data: {date_str} {time_str}")
        p.drawString(2.5*cm, height - 6.5*cm, f"Luogo: {event.location}")
        
        # Divider
        p.setStrokeColor(colors.lightgrey)
        p.setLineWidth(1)
        p.line(2.5*cm, height - 7*cm, 12*cm, height - 7*cm)
        
        # User & Ticket Category
        p.setFont("Helvetica-Bold", 12)
        p.drawString(2.5*cm, height - 7.8*cm, "Acquirente:")
        p.setFont("Helvetica", 12)
        owner_name = f"{ticket.owner.first_name} {ticket.owner.last_name}".strip() or ticket.owner.username
        p.drawString(2.5*cm, height - 8.4*cm, owner_name)
        
        p.setFont("Helvetica-Bold", 12)
        p.drawString(2.5*cm, height - 9.4*cm, "Tipologia:")
        p.setFont("Helvetica", 12)
        p.drawString(2.5*cm, height - 10*cm, ticket.category.name)

        p.setFont("Helvetica-Bold", 12)
        p.drawString(2.5*cm, height - 11*cm, "Prezzo:")
        p.setFont("Helvetica", 12)
        price_str = f"€{ticket.category.price}" if ticket.category.price > 0 else "GRATUITA"
        p.drawString(2.5*cm, height - 11.6*cm, price_str)
        
        # Draw QR Code Image
        p.drawImage(ImageReader(qr_stream), width - 7*cm, height - 10.5*cm, width=4.5*cm, height=4.5*cm)
        
        p.setFont("Helvetica", 8)
        p.drawCentredString(width - 4.75*cm, height - 11*cm, str(ticket.ticket_code))

        # Footer notes
        p.setFont("Helvetica-Oblique", 10)
        p.drawString(2*cm, height - 13*cm, "Mostra questo biglietto all'ingresso.")

        p.showPage()
        p.save()

        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Ticket_{ticket.ticket_code}.pdf"'
        return response


class TicketDownloadGoogleWalletView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)

        # Security check
        if ticket.owner != request.user and ticket.category.event.organizer != request.user and not request.user.is_super_admin:
            return Response({"error": "Accesso negato"}, status=status.HTTP_403_FORBIDDEN)

        # Funzione helper per recuperare secrets da Google Secret Manager
        def get_google_secret(secret_id, version_id="latest"):
            try:
                client = secretmanager.SecretManagerServiceClient()
                project_id = "getinvolved-4767937" 
                name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
                response = client.access_secret_version(request={"name": name})
                return response.payload.data.decode("UTF-8")
            except Exception as e:
                print("Secret Manager Error:")
                traceback.print_exc()
                # Fallback to local .env if Secret Manager is not available
                # (E.g. when developing without a working Service Account context)
                return os.environ.get(secret_id)

        # Load Google Wallet Credentials from Secret Manager
        try:
            creds_str = get_google_secret('GOOGLE_WALLET_CREDENTIALS')
            if not creds_str:
                return Response({"error": "Credenziali Google Wallet assenti."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Clean enclosing quotes if they were pasted with quotes in Secret Manager
            creds_str = creds_str.strip('\'"')
            
            # Reconstruct literal new lines
            # This is important especially when reading from local .env strings!
            creds_str = creds_str.replace('\\n', '\n')
            
            # Also strict mode False prevents json from breaking over unescaped keys from .env
            creds = json.loads(creds_str, strict=False)
        except Exception as e:
            print("Credentials Parsing Error:")
            traceback.print_exc()
            return Response({"error": f"Errore lettura Google Wallet Credentials da Secret Manager: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            issuer_id = get_google_secret('GOOGLE_WALLET_ISSUER_ID').strip('\'"')
        except Exception as e:
            return Response({"error": f"Errore lettura GOOGLE_WALLET_ISSUER_ID da Secret Manager: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        class_id = f"{issuer_id}.{ticket.category.event.google_wallet_class_id}"
        clean_uuid = str(ticket.ticket_code).replace('-', '')
        object_id = f"{issuer_id}.t_{clean_uuid}"

        # Define the Event Ticket Class
        new_class = {
            "id": class_id,
            "issuerName": "GetInvolved",
            "reviewStatus": "UNDER_REVIEW",
            "eventName": {
                "defaultValue": {
                    "language": "it",
                    "value": ticket.category.event.title
                }
            }
        }

        # Define the Event Ticket Object
        new_object = {
            "id": object_id,
            "classId": class_id,
            "state": "ACTIVE",
            "barcode": {
                "type": "QR_CODE",
                "value": str(ticket.ticket_code),
                "alternateText": clean_uuid
            }
        }

        # Build the JWT Payload
        claims = {
            "iss": creds['client_email'],
            "aud": "google",
            "typ": "savetowallet",
            "iat": int(time.time()),
            "origins": ["http://localhost:3001", "http://localhost:8000"],
            "payload": {
                "eventTicketClasses": [new_class],
                "eventTicketObjects": [new_object]
            }
        }

        # Sign the JWT
        try:
            signed_jwt = jwt.encode(claims, creds['private_key'], algorithm="RS256")
            if isinstance(signed_jwt, bytes):
                signed_jwt = signed_jwt.decode('utf-8')
        except Exception as e:
            return Response({"error": f"Errore generazione firma JWT: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Return the Save to Wallet URL
        url = f"https://pay.google.com/gp/v/save/{signed_jwt}"
        return Response({"url": url}, status=status.HTTP_200_OK)


class AdminOnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = AdminOnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.update(request.user, serializer.validated_data)
        return Response({"message": "Onboarding admin completato"}, status=status.HTTP_200_OK)

