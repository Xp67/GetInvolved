/** Public landing page for GetInvolved. */

const HomePage = ({ onNavigateToAdmin = () => {} }) => {
  return (
    <div className="home-shell">
      <header className="home-header">
        <div className="brand">GetInvolved</div>
        <button type="button" className="primary-button" onClick={onNavigateToAdmin}>
          Dashboard Admin
        </button>
      </header>

      <main className="home-main">
        <section className="hero">
          <div className="hero-content">
            <h1>Organizza e promuovi gli eventi della tua comunità</h1>
            <p>
              Centralizza la gestione degli eventi, coordina volontari e tieni sotto controllo
              tutte le informazioni importanti in un unico posto facile da usare.
            </p>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={onNavigateToAdmin}>
                Accedi alla Dashboard
              </button>
              <a className="ghost-button" href="#scopri-di-piu">
                Scopri di più
              </a>
            </div>
          </div>
          <div className="hero-visual" aria-hidden>
            <div className="hero-card">
              <span className="hero-label">Prossimo Evento</span>
              <h2>Giornata del Volontariato</h2>
              <p>15 Marzo · Centro Culturale</p>
              <p className="muted-text">Partecipa alla nostra giornata di solidarietà.</p>
            </div>
          </div>
        </section>

        <section id="scopri-di-piu" className="feature-grid">
          <article className="feature-card">
            <h3>Gestione completa</h3>
            <p>
              Crea schede evento dettagliate con orari, luoghi, contatti e risorse. Tutto è
              aggiornato in tempo reale.
            </p>
          </article>
          <article className="feature-card">
            <h3>Collaborazione semplice</h3>
            <p>
              Condividi le informazioni con il tuo team e coordina attività e responsabilità
              senza stress.
            </p>
          </article>
          <article className="feature-card">
            <h3>Visibilità immediata</h3>
            <p>
              Ogni evento creato nell&apos;area admin è subito consultabile e pronto per essere
              promosso alla tua comunità.
            </p>
          </article>
        </section>
      </main>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} GetInvolved · Costruiamo comunità più attive.</p>
      </footer>
    </div>
  )
}

export default HomePage
