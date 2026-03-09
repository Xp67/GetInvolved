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
import requests
from io import BytesIO
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
from .permissions import HasAppPermission, EventPermission, IsEventOwnerOrHasPermission
from .permission_registry import Perms


# Create your views here.
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
    permission_classes = [IsAuthenticated] # Anyone authenticated can see permissions for UI

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
            user = self.request.user
            if event.organizer != user and not user.is_super_admin and not user.has_app_permission(Perms.TICKETS_MANAGE):
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
            user = self.request.user
            if event.organizer != user and not user.is_super_admin and not user.has_app_permission(Perms.TICKETS_MANAGE):
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
            if event.organizer != request.user and not request.user.is_super_admin and not request.user.has_app_permission(Perms.TICKETS_MANAGE):
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

        # Define dynamic colors from category
        bg_color_hex = ticket.category.card_bg_color or '#6200EA'
        
        try:
            # Parse hex dynamically
            hex_c = bg_color_hex.lstrip('#')
            if len(hex_c) == 3: hex_c = hex_c[0]*2 + hex_c[1]*2 + hex_c[2]*2
            r, g, b = tuple(int(hex_c[i:i+2], 16)/255.0 for i in (0, 2, 4))
            primary_color = colors.Color(r,g,b)
            # Calculate luminance for contrast text
            if (r*0.299 + g*0.587 + b*0.114) > 0.73:
                contrast_color = colors.black
            else:
                contrast_color = colors.white
        except Exception:
            primary_color = colors.HexColor('#6200EA')
            contrast_color = colors.white

        # Dimensions for a vertical full-page modern digital ticket
        t_width = 19 * cm
        t_height = 26 * cm
        margin_x = 1 * cm
        margin_y = height - 27.5 * cm

        # Draw main ticket boundary
        p.setStrokeColor(primary_color)
        p.setLineWidth(2)
        p.roundRect(margin_x, margin_y, t_width, t_height, 15, fill=0, stroke=1)

        # Clip everything inside the boundary for safe drawing of background colors/images
        p.saveState()
        path = p.beginPath()
        path.roundRect(margin_x, margin_y, t_width, t_height, 15)
        p.clipPath(path, stroke=0, fill=0)

        # SECTION 1: HEADER (Hero Image & Badge) [Top 8 cm]
        # Background fallback
        p.setFillColor(primary_color)
        p.rect(margin_x, margin_y + t_height - 8*cm, t_width, 8*cm, fill=1, stroke=0)

        # Hero Image (or Poster as fallback)
        hero_img = None
        if event.hero_image and os.path.exists(event.hero_image.path):
            hero_img = event.hero_image.path
        elif event.poster_image and os.path.exists(event.poster_image.path):
            hero_img = event.poster_image.path

        if hero_img:
            try:
                p.drawImage(hero_img, margin_x, margin_y + t_height - 8*cm, width=t_width, height=8*cm, preserveAspectRatio=False)
                # Overlay semi-transparent dark gradient/tint to make text pop
                p.setFillColor(colors.Color(0, 0, 0, alpha=0.3))
                p.rect(margin_x, margin_y + t_height - 8*cm, t_width, 8*cm, fill=1, stroke=0)
            except Exception:
                pass

        # Top Bar for Logo and E-TICKET
        p.setFillColor(colors.Color(primary_color.red, primary_color.green, primary_color.blue, alpha=0.9))
        p.rect(margin_x, margin_y + t_height - 2*cm, t_width, 2*cm, fill=1, stroke=0)

        # E-TICKET text
        p.setFillColor(contrast_color)
        p.setFont("Helvetica-Bold", 16)
        p.drawString(margin_x + 1*cm, margin_y + t_height - 1.3*cm, "E-TICKET")
        p.setFont("Helvetica", 12)
        p.drawRightString(margin_x + t_width - 1*cm, margin_y + t_height - 1.3*cm, "GetInvolved")

        # SECTION 2: EVENT DETAILS (Middle 8 cm: Y_end = t_height - 16cm)
        p.setFillColor(colors.whitesmoke)
        p.rect(margin_x, margin_y + t_height - 16*cm, t_width, 8*cm, fill=1, stroke=0)

        # Poster Image
        poster_img = None
        if event.poster_image and os.path.exists(event.poster_image.path):
            poster_img = event.poster_image.path
        
        text_start_x = margin_x + 1*cm

        if poster_img:
            try:
                p.drawImage(poster_img, margin_x + 1*cm, margin_y + t_height - 15*cm, width=5*cm, height=6.5*cm, preserveAspectRatio=True, anchor='c')
                text_start_x += 5.5*cm
            except Exception:
                pass

        # Event Texts
        p.setFillColor(colors.darkgrey)
        p.setFont("Helvetica-Bold", 10)
        p.drawString(text_start_x, margin_y + t_height - 10.3*cm, "EVENTO")
        
        p.setFillColor(colors.black)
        
        title = event.title
        # Truncate title manually to avoid import complexities
        if len(title) > 35: title = title[:32] + "..."
        p.setFont("Helvetica-Bold", 18)
        curr_y = margin_y + t_height - 11.2*cm
        p.drawString(text_start_x, curr_y, title)

        curr_y -= 0.8*cm
        p.setFillColor(colors.darkgrey)
        p.setFont("Helvetica-Bold", 10)
        p.drawString(text_start_x, curr_y, "DATA E ORA")
        
        p.setFillColor(colors.black)
        p.setFont("Helvetica", 12)
        date_str = event.date.strftime('%d/%m/%Y') if event.date else 'N/D'
        time_str = event.start_time.strftime('%H:%M') if event.start_time else ''
        curr_y -= 0.6*cm
        p.drawString(text_start_x, curr_y, f"{date_str} {time_str}")

        curr_y -= 0.8*cm
        p.setFillColor(colors.darkgrey)
        p.setFont("Helvetica-Bold", 10)
        p.drawString(text_start_x, curr_y, "LUOGO")
        
        p.setFillColor(colors.black)
        p.setFont("Helvetica", 12)
        loc = event.location
        if len(loc) > 40: loc = loc[:37] + "..."
        curr_y -= 0.6*cm
        p.drawString(text_start_x, curr_y, loc)

        # DividerLine
        p.setStrokeColor(colors.lightgrey)
        p.setLineWidth(1)
        p.line(margin_x + 1*cm, margin_y + t_height - 16*cm, margin_x + t_width - 1*cm, margin_y + t_height - 16*cm)

        # SECTION 3: TICKET DETAILS (Next 3 cm: Y_end = t_height - 19cm)
        p.setFillColor(colors.white)
        p.rect(margin_x, margin_y + t_height - 19*cm, t_width, 3*cm, fill=1, stroke=0)

        p.setFillColor(colors.darkgrey)
        p.setFont("Helvetica-Bold", 10)
        # 3 columns layout
        p.drawString(margin_x + 1*cm, margin_y + t_height - 17.2*cm, "ACQUIRENTE")
        p.drawString(margin_x + 7*cm, margin_y + t_height - 17.2*cm, "TIPOLOGIA")
        p.drawString(margin_x + 13*cm, margin_y + t_height - 17.2*cm, "PREZZO")

        p.setFillColor(colors.black)
        p.setFont("Helvetica-Bold", 12)
        owner_name = f"{ticket.owner.first_name} {ticket.owner.last_name}".strip() or ticket.owner.username
        if len(owner_name) > 22: owner_name = owner_name[:19] + "..."
        p.drawString(margin_x + 1*cm, margin_y + t_height - 18.2*cm, owner_name)
        
        cat_name = ticket.category.name
        if len(cat_name) > 18: cat_name = cat_name[:15] + "..."
        p.drawString(margin_x + 7*cm, margin_y + t_height - 18.2*cm, cat_name)
        
        price_str = f"€ {ticket.category.price:.2f}" if ticket.category.price > 0 else "GRATIS"
        p.drawString(margin_x + 13*cm, margin_y + t_height - 18.2*cm, price_str)

        # Divider Line Dash
        p.setStrokeColor(colors.lightgrey)
        p.setLineWidth(2)
        p.setDash(6, 6)
        p.line(margin_x, margin_y + t_height - 19*cm, margin_x + t_width, margin_y + t_height - 19*cm)
        p.setDash()

        # SECTION 4: QR CODE & LOGOS (Bottom 7 cm: Y = 0 to t_height - 19cm)
        p.setFillColor(colors.whitesmoke)
        p.rect(margin_x, margin_y, t_width, t_height - 19*cm, fill=1, stroke=0)

        # QR Code centered
        qr_size = 4.5 * cm
        p.drawImage(ImageReader(qr_stream), margin_x + t_width/2 - qr_size/2, margin_y + 2.5*cm, width=qr_size, height=qr_size)
        
        p.setFont("Helvetica", 9)
        p.setFillColor(colors.darkgrey)
        p.drawCentredString(margin_x + t_width/2, margin_y + 2*cm, "Scansiona all'ingresso")
        
        p.setFont("Helvetica-Bold", 10)
        p.setFillColor(colors.black)
        p.drawCentredString(margin_x + t_width/2, margin_y + 1.2*cm, str(ticket.ticket_code))

        # Logos at the bottom left/right
        logo_to_draw = None
        if ticket.category.logo:
            logo_to_draw = ticket.category.logo.path
        elif event.organizer_logo:
            logo_to_draw = event.organizer_logo.path

        if logo_to_draw and os.path.exists(logo_to_draw):
            try:
                p.drawImage(logo_to_draw, margin_x + 1*cm, margin_y + 0.5*cm, width=2*cm, height=2*cm, preserveAspectRatio=True, anchor='sw', mask='auto')
            except Exception:
                pass
                
        p.restoreState()

        # Footer notes below the ticket
        p.setFont("Helvetica-Oblique", 10)
        p.setFillColor(colors.darkgrey)
        p.drawCentredString(width/2, margin_y - 1*cm, "Mostra questo biglietto all'ingresso. Conservalo con cura.")

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
        
        # Define event for easier access
        event = ticket.category.event
        
        class_id = f"{issuer_id}.{event.google_wallet_class_id}"
        clean_uuid = str(ticket.ticket_code).replace('-', '')
        object_id = f"{issuer_id}.t_{clean_uuid}"

        # Build absolute URLs for images (Wallet API needs public URLs)
        # We try to use request.build_absolute_uri, but Google Wallet will fail to load images from localhost.
        # So we supply them only if we're theoretically in production or at least provide the field.
        logo_url = None
        if ticket.category.logo:
            logo_url = request.build_absolute_uri(ticket.category.logo.url)
        elif event.organizer_logo:
            logo_url = request.build_absolute_uri(event.organizer_logo.url)
            
        hero_url = None
        if event.hero_image:
            hero_url = request.build_absolute_uri(event.hero_image.url)

        # Dynamic color
        bg_color = ticket.category.card_bg_color or '#6200EA'

        # Define the Event Ticket Class
        new_class = {
            "id": class_id,
            "issuerName": "GetInvolved",
            "reviewStatus": "UNDER_REVIEW",
            "hexBackgroundColor": bg_color,
            "eventName": {
                "defaultValue": {
                    "language": "it",
                    "value": ticket.category.event.title
                }
            }
        }
        
        # Only inject images if they look like real public URLs, since Google Wallet rejects localhost images
        if logo_url and 'localhost' not in logo_url and '127.0.0.1' not in logo_url:
            new_class["logo"] = {
                "sourceUri": { "uri": logo_url },
                "contentDescription": {
                    "defaultValue": { "language": "it", "value": "Logo Evento" }
                }
            }
            
        if hero_url and 'localhost' not in hero_url and '127.0.0.1' not in hero_url:
            new_class["heroImage"] = {
                "sourceUri": { "uri": hero_url },
                "contentDescription": {
                    "defaultValue": { "language": "it", "value": "Immagine Evento" }
                }
            }

        # Define the Event Ticket Object
        new_object = {
            "id": object_id,
            "classId": class_id,
            "state": "ACTIVE",
            "hexBackgroundColor": bg_color,
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

