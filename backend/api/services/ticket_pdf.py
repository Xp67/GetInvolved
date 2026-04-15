from io import BytesIO
import os

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
import qrcode


def generate_ticket_pdf(ticket) -> BytesIO:
    """Generate a PDF ticket and return a BytesIO buffer ready to be served."""
    event = ticket.category.event

    # --- QR Code ---
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(ticket.ticket_code)
    qr.make(fit=True)
    img_qr = qr.make_image(fill_color="black", back_color="white")
    qr_stream = BytesIO()
    img_qr.save(qr_stream, format="PNG")
    qr_stream.seek(0)

    # --- Colors from category ---
    bg_color_hex = ticket.category.card_bg_color or '#6200EA'
    try:
        hex_c = bg_color_hex.lstrip('#')
        if len(hex_c) == 3:
            hex_c = hex_c[0] * 2 + hex_c[1] * 2 + hex_c[2] * 2
        r, g, b = tuple(int(hex_c[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
        primary_color = colors.Color(r, g, b)
        contrast_color = colors.black if (r * 0.299 + g * 0.587 + b * 0.114) > 0.73 else colors.white
    except Exception:
        primary_color = colors.HexColor('#6200EA')
        contrast_color = colors.white

    # --- Canvas ---
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    t_width = 19 * cm
    t_height = 26 * cm
    margin_x = 1 * cm
    margin_y = height - 27.5 * cm

    # Ticket boundary
    p.setStrokeColor(primary_color)
    p.setLineWidth(2)
    p.roundRect(margin_x, margin_y, t_width, t_height, 15, fill=0, stroke=1)

    p.saveState()
    path = p.beginPath()
    path.roundRect(margin_x, margin_y, t_width, t_height, 15)
    p.clipPath(path, stroke=0, fill=0)

    # SECTION 1: Header (hero image + badge)
    p.setFillColor(primary_color)
    p.rect(margin_x, margin_y + t_height - 8 * cm, t_width, 8 * cm, fill=1, stroke=0)

    hero_img = None
    if event.hero_image and os.path.exists(event.hero_image.path):
        hero_img = event.hero_image.path
    elif event.poster_image and os.path.exists(event.poster_image.path):
        hero_img = event.poster_image.path

    if hero_img:
        try:
            p.drawImage(hero_img, margin_x, margin_y + t_height - 8 * cm,
                        width=t_width, height=8 * cm, preserveAspectRatio=False)
            p.setFillColor(colors.Color(0, 0, 0, alpha=0.3))
            p.rect(margin_x, margin_y + t_height - 8 * cm, t_width, 8 * cm, fill=1, stroke=0)
        except Exception:
            pass

    p.setFillColor(colors.Color(primary_color.red, primary_color.green, primary_color.blue, alpha=0.9))
    p.rect(margin_x, margin_y + t_height - 2 * cm, t_width, 2 * cm, fill=1, stroke=0)
    p.setFillColor(contrast_color)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(margin_x + 1 * cm, margin_y + t_height - 1.3 * cm, "E-TICKET")
    p.setFont("Helvetica", 12)
    p.drawRightString(margin_x + t_width - 1 * cm, margin_y + t_height - 1.3 * cm, "GetInvolved")

    # SECTION 2: Event details
    p.setFillColor(colors.whitesmoke)
    p.rect(margin_x, margin_y + t_height - 16 * cm, t_width, 8 * cm, fill=1, stroke=0)

    poster_img = None
    if event.poster_image and os.path.exists(event.poster_image.path):
        poster_img = event.poster_image.path

    text_start_x = margin_x + 1 * cm
    if poster_img:
        try:
            p.drawImage(poster_img, margin_x + 1 * cm, margin_y + t_height - 15 * cm,
                        width=5 * cm, height=6.5 * cm, preserveAspectRatio=True, anchor='c')
            text_start_x += 5.5 * cm
        except Exception:
            pass

    p.setFillColor(colors.darkgrey)
    p.setFont("Helvetica-Bold", 10)
    p.drawString(text_start_x, margin_y + t_height - 10.3 * cm, "EVENTO")

    p.setFillColor(colors.black)
    title = event.title
    if len(title) > 35:
        title = title[:32] + "..."
    p.setFont("Helvetica-Bold", 18)
    curr_y = margin_y + t_height - 11.2 * cm
    p.drawString(text_start_x, curr_y, title)

    curr_y -= 0.8 * cm
    p.setFillColor(colors.darkgrey)
    p.setFont("Helvetica-Bold", 10)
    p.drawString(text_start_x, curr_y, "DATA E ORA")

    p.setFillColor(colors.black)
    p.setFont("Helvetica", 12)
    date_str = event.date.strftime('%d/%m/%Y') if event.date else 'N/D'
    time_str = event.start_time.strftime('%H:%M') if event.start_time else ''
    curr_y -= 0.6 * cm
    p.drawString(text_start_x, curr_y, f"{date_str} {time_str}")

    curr_y -= 0.8 * cm
    p.setFillColor(colors.darkgrey)
    p.setFont("Helvetica-Bold", 10)
    p.drawString(text_start_x, curr_y, "LUOGO")

    p.setFillColor(colors.black)
    p.setFont("Helvetica", 12)
    loc = event.location
    if len(loc) > 40:
        loc = loc[:37] + "..."
    curr_y -= 0.6 * cm
    p.drawString(text_start_x, curr_y, loc)

    p.setStrokeColor(colors.lightgrey)
    p.setLineWidth(1)
    p.line(margin_x + 1 * cm, margin_y + t_height - 16 * cm,
           margin_x + t_width - 1 * cm, margin_y + t_height - 16 * cm)

    # SECTION 3: Ticket details
    p.setFillColor(colors.white)
    p.rect(margin_x, margin_y + t_height - 19 * cm, t_width, 3 * cm, fill=1, stroke=0)

    p.setFillColor(colors.darkgrey)
    p.setFont("Helvetica-Bold", 10)
    p.drawString(margin_x + 1 * cm, margin_y + t_height - 17.2 * cm, "ACQUIRENTE")
    p.drawString(margin_x + 7 * cm, margin_y + t_height - 17.2 * cm, "TIPOLOGIA")
    p.drawString(margin_x + 13 * cm, margin_y + t_height - 17.2 * cm, "PREZZO")

    p.setFillColor(colors.black)
    p.setFont("Helvetica-Bold", 12)
    owner_name = f"{ticket.owner.first_name} {ticket.owner.last_name}".strip() or ticket.owner.username
    if len(owner_name) > 22:
        owner_name = owner_name[:19] + "..."
    p.drawString(margin_x + 1 * cm, margin_y + t_height - 18.2 * cm, owner_name)

    cat_name = ticket.category.name
    if len(cat_name) > 18:
        cat_name = cat_name[:15] + "..."
    p.drawString(margin_x + 7 * cm, margin_y + t_height - 18.2 * cm, cat_name)

    price_str = f"€ {ticket.category.price:.2f}" if ticket.category.price > 0 else "GRATIS"
    p.drawString(margin_x + 13 * cm, margin_y + t_height - 18.2 * cm, price_str)

    p.setStrokeColor(colors.lightgrey)
    p.setLineWidth(2)
    p.setDash(6, 6)
    p.line(margin_x, margin_y + t_height - 19 * cm,
           margin_x + t_width, margin_y + t_height - 19 * cm)
    p.setDash()

    # SECTION 4: QR code + logos
    p.setFillColor(colors.whitesmoke)
    p.rect(margin_x, margin_y, t_width, t_height - 19 * cm, fill=1, stroke=0)

    qr_size = 4.5 * cm
    p.drawImage(ImageReader(qr_stream),
                margin_x + t_width / 2 - qr_size / 2, margin_y + 2.5 * cm,
                width=qr_size, height=qr_size)

    p.setFont("Helvetica", 9)
    p.setFillColor(colors.darkgrey)
    p.drawCentredString(margin_x + t_width / 2, margin_y + 2 * cm, "Scansiona all'ingresso")

    p.setFont("Helvetica-Bold", 10)
    p.setFillColor(colors.black)
    p.drawCentredString(margin_x + t_width / 2, margin_y + 1.2 * cm, str(ticket.ticket_code))

    logo_to_draw = None
    if ticket.category.logo:
        logo_to_draw = ticket.category.logo.path
    elif event.organizer_logo:
        logo_to_draw = event.organizer_logo.path

    if logo_to_draw and os.path.exists(logo_to_draw):
        try:
            p.drawImage(logo_to_draw, margin_x + 1 * cm, margin_y + 0.5 * cm,
                        width=2 * cm, height=2 * cm, preserveAspectRatio=True, anchor='sw', mask='auto')
        except Exception:
            pass

    p.restoreState()

    # Footer
    p.setFont("Helvetica-Oblique", 10)
    p.setFillColor(colors.darkgrey)
    p.drawCentredString(width / 2, margin_y - 1 * cm,
                        "Mostra questo biglietto all'ingresso. Conservalo con cura.")

    p.showPage()
    p.save()

    buffer.seek(0)
    return buffer
