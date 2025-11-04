/** Public landing page for GetInvolved. */

const featuredEvents = [
  {
    id: "sunset-beats",
    tag: "In evidenza",
    title: "Sunset Beats Festival",
    date: "27 Aprile 2024 - 18:30",
    location: "Arena Lungomare - Napoli",
    description:
      "Un tramonto esplosivo con DJ set internazionali, area street food e lounge esclusiva.",
    price: "da \u20AC24",
  },
  {
    id: "city-rooftop",
    tag: "Nuovo",
    title: "City Rooftop Sessions",
    date: "12 Maggio 2024 - 19:00",
    location: "Skyline Hub - Milano",
    description:
      "Live music in terrazza con degustazione di cocktail d'autore e vista mozzafiato.",
    price: "da \u20AC32",
  },
  {
    id: "vinyl-market",
    tag: "Sold out 80%",
    title: "Vinyl Market + Live Jam",
    date: "25 Maggio 2024 - 15:00",
    location: "Teatro Rigenerato - Torino",
    description:
      "Mercato del vinile, laboratori di mixaggio e jam session aperte fino a tarda notte.",
    price: "ultimi 50 posti",
  },
]

const sellingPoints = [
  {
    title: "Vendi in pochi clic",
    description:
      "Crea eventi completi di posti numerati, codici promo e QR ticket pronti all'uso.",
  },
  {
    title: "Pagamenti sicuri",
    description:
      "Incassa subito grazie ai nostri circuiti certificati e monitora il cashflow in tempo reale.",
  },
  {
    title: "Campagne mirate",
    description:
      "Segmenta il pubblico, invia mail automatiche e segui le conversioni con dashboard intuitive.",
  },
]

const steps = [
  {
    title: "Crea l'evento",
    description: "Imposta dettagli, disponibilit\u00E0 e prezzi dinamici in una guida passo-passo.",
  },
  {
    title: "Lancia la prevendita",
    description:
      "Pubblicazione immediata sul portale con landing personalizzata e link condivisibili.",
  },
  {
    title: "Convalida gli accessi",
    description:
      "Scanner mobile integrato, badge personalizzati e statistiche live sugli ingressi.",
  },
]

const HomePage = ({ onNavigateToAdmin = () => {} }) => {
  const currentYear = new Date().getFullYear()

  return (
    <div className="home-shell">
      <header className="home-header">
        <div className="brand">GetInvolved</div>
        <nav className="home-nav" aria-label="Navigazione principale">
          <a href="#eventi">Eventi</a>
          <a href="#come-funziona">Come funziona</a>
          <a href="#perche-noi">Perch&eacute; noi</a>
        </nav>
        <button type="button" className="primary-button" onClick={onNavigateToAdmin}>
          Crea il tuo evento
        </button>
      </header>

      <main className="home-main">
        <section className="hero" id="hero">
          <div className="hero-content">
            <div className="hero-badge">Ticketing per eventi indipendenti</div>
            <h1>
              {"Riempire la sala \u00E8 solo l'inizio: crea, vendi e fai crescere i tuoi eventi."}
            </h1>
            <p>
              {
                "GetInvolved \u00E8 la piattaforma tutto-in-uno per ideare esperienze live, vendere biglietti senza commissioni nascoste e coinvolgere il tuo pubblico dall'annuncio all'ultimo applauso."
              }
            </p>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={onNavigateToAdmin}>
                Inizia subito
              </button>
              <a className="ghost-button" href="#eventi">
                Guarda gli eventi
              </a>
            </div>
            <ul className="hero-metrics">
              <li>
                <strong>250+</strong>
                Eventi attivi ogni mese
              </li>
              <li>
                <strong>98%</strong>
                Organizzatori soddisfatti
              </li>
              <li>
                <strong>60K</strong>
                Biglietti validati dal vivo
              </li>
            </ul>
          </div>
          <div className="hero-visual" aria-hidden>
            <div className="hero-card">
              <span className="hero-label">Dashboard vendite live</span>
              <div className="card-figure">
                <div className="card-chart">
                  <span className="chart-dot dot-primary" />
                  <span className="chart-dot dot-secondary" />
                </div>
                <div className="card-amount">\u20AC8.430</div>
              </div>
              <p className="muted-text">
                Ricavi aggiornati in tempo reale, segmentati per canale di vendita.
              </p>
              <div className="card-tags">
                <span className="tag">+34% rispetto all'ultimo tour</span>
                <span className="tag">Prevendite 72%</span>
              </div>
            </div>
          </div>
        </section>

        <section id="eventi" className="events-showcase">
          <header className="section-header">
            <span className="section-label">In vetrina questa settimana</span>
            <h2 className="section-title">Eventi creati con GetInvolved</h2>
            <p className="section-description">
              Festival, concerti boutique, workshop immersivi: la nostra community genera format unici
              con landing page ottimizzate e ticket digitali pronti per essere scansionati.
            </p>
          </header>

          <div className="showcase-grid">
            {featuredEvents.map((event) => (
              <article key={event.id} className="event-showcase-card">
                <span className="event-tag">{event.tag}</span>
                <h3>{event.title}</h3>
                <p className="event-meta-line">{event.date}</p>
                <p className="event-meta-line">{event.location}</p>
                <p>{event.description}</p>
                <div className="event-card-footer">
                  <span className="event-price">{event.price}</span>
                  <button
                    type="button"
                    className="ghost-button small"
                    onClick={onNavigateToAdmin}
                  >
                    Metti in vendita
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="come-funziona" className="flow-section">
          <div className="flow-card">
            <span className="section-label">Workflow intuitivo</span>
            <h2 className="section-title">Dal concept alla serata in tre passi</h2>
            <p className="section-description">
              {
                "Gestisci lineup, disponibilit\u00E0 e comunicazione in un'unica piattaforma pensata per team agili e organizzatori indipendenti."
              }
            </p>

            <div className="flow-grid">
              {steps.map((step, index) => (
                <div key={step.title} className="flow-step">
                  <span className="step-index">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="flow-aside">
            <div className="aside-card">
              <h3>Check-in smart</h3>
              <p>
                Scannerizza i QR code con la nostra app, monitora gli accessi in diretta e assegna
                badge al volo agli ospiti VIP.
              </p>
            </div>
            <div className="aside-card">
              <h3>Supporto eventi live</h3>
              <p>
                {
                  "Team dedicato la sera dell'evento, numeri d'urgenza e materiali marketing pronti da personalizzare."
                }
              </p>
            </div>
          </aside>
        </section>

        <section id="perche-noi" className="selling-points">
          <header className="section-header">
            <span className="section-label">Perch&eacute; scegliere GetInvolved</span>
            <h2 className="section-title">Ticketing pensato per chi crea esperienze memorabili</h2>
          </header>

          <div className="selling-grid">
            {sellingPoints.map((point) => (
              <article key={point.title} className="selling-card">
                <h3>{point.title}</h3>
                <p>{point.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-banner">
          <div>
            <span className="section-label">Pronti a partire?</span>
            <h2 className="section-title">
              Pubblica il tuo prossimo evento e monitora le vendite live.
            </h2>
            <p className="section-description">
              {
                "Configurazione guidata, calendario eventi centralizzato e reportistica pronta per il tuo team."
              }
            </p>
          </div>
          <div className="cta-actions">
            <button type="button" className="primary-button" onClick={onNavigateToAdmin}>
              Apri la dashboard
            </button>
            <a className="ghost-button" href="mailto:hello@getinvolved.com">
              Parla con noi
            </a>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>
          &copy; {currentYear} GetInvolved &middot; Costruiamo eventi indipendenti che lasciano il
          segno.
        </p>
      </footer>
    </div>
  )
}

export default HomePage
