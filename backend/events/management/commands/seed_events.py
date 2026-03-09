import random
import requests
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.files.base import ContentFile
from api.models import Event, TicketCategory

from api.models import Event, TicketCategory, User

# List of random realistic data
TITLES = [
    "Tech Innovators Summit 2026",
    "Festival Internazionale del Cinema, Roma",
    "Concerto Indie Rock al Tramonto",
    "Masterclass Avanzata di Fotografia",
    "Mostra d'Arte Contemporanea: Nuove Visioni",
    "Maratona di Programmazione (Hackathon)",
    "Fiera del Fumetto e del Gioco",
    "Degustazione Vini e Formaggi Locali",
    "Corso Pre-parto e Genitorialità",
    "Seminario sul Benessere Psicologico"
]

ORGANIZERS = ["TechNet Italy", "Roma Eventi", "Live Nation", "Marco Rossi", "Associazione Culturale", "Comune di Milano", "Startup Weekend", "WineLovers Club"]

LOCATIONS = [
    "Via Cristoforo Colombo 112, Roma, Italia",
    "Piazza del Duomo 1, Milano, Italia",
    "Teatro Massimo, Palermo, Italia",
    "Fiera di Bologna, Viale della Fiera 20, Bologna",
    "Lingotto Fiere, Torino, Italia",
    "Piazza San Marco, Venezia, Italia",
    "Online (Webinar Zoom)"
]

DESCRIPTIONS = [
    "Un evento imperdibile per tutti gli appassionati del settore. Scopri le ultime novità, entra in contatto con leader esperti e arricchisci il tuo bagaglio di conoscenze. Assicurati il tuo posto ora!",
    "Unisciti a noi per una giornata all'insegna del divertimento e della scoperta. Tantissimi ospiti speciali e sorprese ti aspettano. Non mancare all'appuntamento più atteso dell'anno.",
    "Formazione, networking e un'ottima opportunità di crescita personale e professionale. Il programma include sessioni interattive, workshop pratici e un panel di chiusura esclusivo.",
    "L'arte, la cultura e la musica si uniscono in questa straordinaria iniziativa. Aperta a tutte le età. Un'esperienza immersiva che ricorderai a lungo. Ingresso su prenotazione.",
    "Un'occasione unica per confrontarsi sulle sfide del futuro e trovare soluzioni innovative in un ambiente collaborativo e stimolante."
]

COLORS = ["#1b3b24", "#e63946", "#457b9d", "#1d3557", "#2a9d8f", "#f4a261", "#6d6875", "#003049", "#d62828", "#5f0f40"]

class Command(BaseCommand):
    help = 'Seeda il database con eventi fittizi realistici per il testing frontend'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("Inizio eliminazione eventi vecchi (opzionale)..."))
        # Prevent deleting entirely if not strictly necessary, but good for local dev
        # Event.objects.all().delete() 

        # Need an actual User as organizer
        organizer_user = User.objects.first()
        if not organizer_user:
            self.stdout.write(self.style.ERROR("Nessun utente trovato nel database. Crea un superuser prima di avviare lo script."))
            return

        self.stdout.write(self.style.SUCCESS("Generazione di 10 mock events in corso. Potrebbe volerci un po' per scaricare le immagini..."))

        for i in range(10):
            self.stdout.write(f"Creazione evento {i+1}/10...")

            # Generate random properties
            title = random.choice(TITLES)
            description = random.choice(DESCRIPTIONS) + "\n\n" + random.choice(DESCRIPTIONS)
            location = random.choice(LOCATIONS)
            organizer = random.choice(ORGANIZERS)
            color = random.choice(COLORS)
            
            # Dates: mix of past, present, and future
            days_offset = random.randint(-10, 60)
            date_obj = timezone.now() + timedelta(days=days_offset)
            date_str = date_obj.strftime('%Y-%m-%d')
            
            # Times
            start_hour = random.randint(8, 20)
            start_time = f"{start_hour:02d}:00:00"
            end_time = f"{(start_hour + random.randint(2, 6)):02d}:00:00" if start_hour < 18 else f"23:59:59"

            # Create event record first
            event = Event.objects.create(
                title=title,
                description=description,
                location=location,
                organizer=organizer_user,
                date=date_str,
                start_time=start_time,
                end_time=end_time,
                background_color=color,
                status='PUBLISHED', # Show directly
                ticket_clauses="1. Il biglietto è nominale.\n2. L'ingresso è consentito solo con documento d'identità valido.\n3. Rimborsi non effettuabili se non per cancellazione evento."
            )

            # --- Images via picsum ---
            # Hero (landscape)
            try:
                hero_resp = requests.get(f"https://picsum.photos/seed/hero_{event.id}_{random.randint(1,1000)}/1200/500")
                if hero_resp.status_code == 200:
                    event.hero_image.save(f"mock_hero_{event.id}.jpg", ContentFile(hero_resp.content), save=False)
            except Exception as e:
                self.stderr.write(f"Errore download hero: {e}")

            # Poster (portrait)
            try:
                poster_resp = requests.get(f"https://picsum.photos/seed/poster_{event.id}_{random.randint(1,1000)}/600/900")
                if poster_resp.status_code == 200:
                    event.poster_image.save(f"mock_poster_{event.id}.jpg", ContentFile(poster_resp.content), save=False)
            except Exception as e:
                self.stderr.write(f"Errore download poster: {e}")

            event.save()

            # --- Ticket Categories ---
            num_categories = random.randint(1, 4)
            cat_names = ["Gratuito", "Standard", "VIP (Accesso Backstage)", "Early Bird", "Ridotto Studenti", "Pacchetto Famiglia"]
            random.shuffle(cat_names)

            for j in range(num_categories):
                t_name = cat_names[j]
                
                if "Gratuito" in t_name:
                    price = 0.00
                elif "VIP" in t_name:
                    price = random.uniform(80.0, 250.0)
                elif "Early Bird" in t_name:
                    price = random.uniform(10.0, 30.0)
                else:
                    price = random.uniform(20.0, 70.0)
                
                total_qty = random.randint(10, 500)
                sold_qty = random.randint(0, total_qty) # Randomly sold
                rem_qty = total_qty - sold_qty

                # Maybe sold out?
                if random.random() < 0.15: # 15% chance to force sold out
                    rem_qty = 0
                
                # Colors
                cat_colors = random.sample(COLORS, 2)

                TicketCategory.objects.create(
                    event=event,
                    name=t_name,
                    description=f"Include accesso base all'evento e materiale informativo." if price < 50 else "Accesso esclusivo, drink di benvenuto e posti riservati nelle prime file.",
                    price=price,
                    total_quantity=total_qty,
                    card_bg_type='gradient' if random.random() > 0.5 else 'solid',
                    card_bg_color=cat_colors[0],
                    card_bg_color2=cat_colors[1],
                )

        self.stdout.write(self.style.SUCCESS("Hai generato con successo 10 eventi mockup realistici!"))
