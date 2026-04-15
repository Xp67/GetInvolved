import json
import os
import time
import traceback

import jwt
from google.cloud import secretmanager


PROJECT_ID = "getinvolved-4767937"


def _get_google_secret(secret_id: str, version_id: str = "latest") -> str | None:
    """Fetch a secret from Google Secret Manager, falling back to env vars."""
    try:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{PROJECT_ID}/secrets/{secret_id}/versions/{version_id}"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    except Exception:
        traceback.print_exc()
        return os.environ.get(secret_id)


def generate_google_wallet_url(ticket, request) -> str:
    """
    Build a signed Google Wallet JWT for the given ticket and return the
    'Add to Wallet' URL.  Raises ValueError on configuration errors and
    RuntimeError on signing failures.
    """
    # --- Load credentials ---
    creds_str = _get_google_secret('GOOGLE_WALLET_CREDENTIALS')
    if not creds_str:
        raise ValueError("Credenziali Google Wallet assenti.")

    creds_str = creds_str.strip('\'"').replace('\\n', '\n')
    try:
        creds = json.loads(creds_str, strict=False)
    except Exception as exc:
        raise ValueError(f"Errore lettura Google Wallet Credentials: {exc}") from exc

    issuer_id_raw = _get_google_secret('GOOGLE_WALLET_ISSUER_ID')
    if not issuer_id_raw:
        raise ValueError("GOOGLE_WALLET_ISSUER_ID assente.")
    issuer_id = issuer_id_raw.strip('\'"')

    event = ticket.category.event
    class_id = f"{issuer_id}.{event.google_wallet_class_id}"
    clean_uuid = str(ticket.ticket_code).replace('-', '')
    object_id = f"{issuer_id}.t_{clean_uuid}"
    bg_color = ticket.category.card_bg_color or '#6200EA'

    # --- Build image URLs (Google Wallet rejects localhost) ---
    def _public_url(field):
        if not field:
            return None
        url = request.build_absolute_uri(field.url)
        if 'localhost' in url or '127.0.0.1' in url:
            return None
        return url

    logo_url = _public_url(ticket.category.logo) or _public_url(event.organizer_logo)
    hero_url = _public_url(event.hero_image)

    # --- Event Ticket Class ---
    new_class = {
        "id": class_id,
        "issuerName": "GetInvolved",
        "reviewStatus": "UNDER_REVIEW",
        "hexBackgroundColor": bg_color,
        "eventName": {
            "defaultValue": {"language": "it", "value": event.title}
        },
    }
    if logo_url:
        new_class["logo"] = {
            "sourceUri": {"uri": logo_url},
            "contentDescription": {"defaultValue": {"language": "it", "value": "Logo Evento"}},
        }
    if hero_url:
        new_class["heroImage"] = {
            "sourceUri": {"uri": hero_url},
            "contentDescription": {"defaultValue": {"language": "it", "value": "Immagine Evento"}},
        }

    # --- Event Ticket Object ---
    new_object = {
        "id": object_id,
        "classId": class_id,
        "state": "ACTIVE",
        "hexBackgroundColor": bg_color,
        "barcode": {
            "type": "QR_CODE",
            "value": str(ticket.ticket_code),
            "alternateText": clean_uuid,
        },
    }

    # --- JWT payload ---
    claims = {
        "iss": creds['client_email'],
        "aud": "google",
        "typ": "savetowallet",
        "iat": int(time.time()),
        "origins": [request.build_absolute_uri("/").rstrip("/")],
        "payload": {
            "eventTicketClasses": [new_class],
            "eventTicketObjects": [new_object],
        },
    }

    try:
        signed_jwt = jwt.encode(claims, creds['private_key'], algorithm="RS256")
        if isinstance(signed_jwt, bytes):
            signed_jwt = signed_jwt.decode('utf-8')
    except Exception as exc:
        raise RuntimeError(f"Errore generazione firma JWT: {exc}") from exc

    return f"https://pay.google.com/gp/v/save/{signed_jwt}"
