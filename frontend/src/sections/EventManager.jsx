/** Event creation form and list within the admin dashboard. */
import { useCallback, useEffect, useMemo, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const INITIAL_FORM = {
  title: '',
  description: '',
  location: '',
  start_datetime: '',
  end_datetime: '',
  organizer: '',
  capacity: '',
  category: '',
  is_virtual: false,
  registration_link: '',
}

const toISO = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toISOString()
}

const sanitizePayload = (form) => ({
  title: form.title.trim(),
  description: form.description.trim() || null,
  location: form.location.trim() || null,
  start_datetime: toISO(form.start_datetime),
  end_datetime: toISO(form.end_datetime),
  organizer: form.organizer.trim() || null,
  capacity: form.capacity ? Number(form.capacity) : null,
  category: form.category.trim() || null,
  is_virtual: form.is_virtual,
  registration_link: form.registration_link.trim() || null,
})

const formatDateTime = (value) => {
  if (!value) return null
  try {
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch (error) {
    return value
  }
}

const EventManager = () => {
  const [events, setEvents] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/events`)
      if (!response.ok) {
        throw new Error('Impossibile recuperare gli eventi')
      }
      const data = await response.json()
      setEvents(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = sanitizePayload(form)

    if (!payload.title || !payload.start_datetime) {
      setError('Inserisci almeno un titolo e la data di inizio.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Salvataggio non riuscito, riprova più tardi.')
      }

      const created = await response.json()
      setEvents((current) => [created, ...current])
      setForm(INITIAL_FORM)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasEvents = useMemo(() => events.length > 0, [events])

  return (
    <section className="event-manager">
      <div className="section-header">
        <div>
          <h2>Eventi</h2>
          <p className="muted-text">Compila il modulo per creare una nuova scheda evento.</p>
        </div>
      </div>

      <div className="event-layout">
        <form className="event-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="title">Titolo *</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength="255"
              value={form.title}
              onChange={handleChange}
              placeholder="Es. Festival della Comunità"
            />
          </div>

          <div className="form-row">
            <label htmlFor="description">Descrizione</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              placeholder="Racconta di cosa si tratta, obiettivi e attività previste"
            />
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="start_datetime">Inizio *</label>
              <input
                id="start_datetime"
                name="start_datetime"
                type="datetime-local"
                required
                value={form.start_datetime}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label htmlFor="end_datetime">Fine</label>
              <input
                id="end_datetime"
                name="end_datetime"
                type="datetime-local"
                value={form.end_datetime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="location">Luogo</label>
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="Indirizzo o piattaforma online"
              />
            </div>
            <div className="form-row">
              <label htmlFor="organizer">Organizzatore</label>
              <input
                id="organizer"
                name="organizer"
                type="text"
                value={form.organizer}
                onChange={handleChange}
                placeholder="Nome referente"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="capacity">Capienza</label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="0"
                value={form.capacity}
                onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <label htmlFor="category">Categoria</label>
              <input
                id="category"
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                placeholder="Workshop, raccolta fondi, ..."
              />
            </div>
          </div>

          <div className="form-row checkbox-row">
            <label htmlFor="is_virtual" className="checkbox">
              <input
                id="is_virtual"
                name="is_virtual"
                type="checkbox"
                checked={form.is_virtual}
                onChange={handleChange}
              />
              <span>L&apos;evento si svolge online</span>
            </label>
          </div>

          <div className="form-row">
            <label htmlFor="registration_link">Link di iscrizione</label>
            <input
              id="registration_link"
              name="registration_link"
              type="url"
              value={form.registration_link}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Salvataggio...' : 'Crea evento'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>

        <div className="event-list-panel" aria-live="polite">
          <h3>Eventi programmati</h3>
          {loading && <p className="muted-text">Caricamento eventi in corso...</p>}
          {!loading && !hasEvents && (
            <p className="muted-text">
              Non hai ancora creato alcun evento. Utilizza il modulo per iniziare.
            </p>
          )}

          <div className="event-grid">
            {events.map((event) => {
              const start = formatDateTime(event.start_datetime)
              const end = formatDateTime(event.end_datetime)

              return (
                <article key={event.id} className="event-card">
                  <header>
                    <h4>{event.title}</h4>
                    <p className="muted-text">
                      {start}
                      {end ? ` · termina ${end}` : ''}
                    </p>
                  </header>
                  {event.description && <p>{event.description}</p>}
                  <ul className="event-meta">
                    {event.location && (
                      <li>
                        <span className="label">Luogo:</span>
                        <span>{event.location}</span>
                      </li>
                    )}
                    {event.organizer && (
                      <li>
                        <span className="label">Organizzatore:</span>
                        <span>{event.organizer}</span>
                      </li>
                    )}
                    {event.capacity !== null && event.capacity !== undefined && (
                      <li>
                        <span className="label">Capienza:</span>
                        <span>{event.capacity} persone</span>
                      </li>
                    )}
                    {event.category && (
                      <li>
                        <span className="label">Categoria:</span>
                        <span>{event.category}</span>
                      </li>
                    )}
                    <li>
                      <span className="label">Formato:</span>
                      <span>{event.is_virtual ? 'Online' : 'In presenza'}</span>
                    </li>
                  </ul>
                  {event.registration_link && (
                    <a
                      className="ghost-button small"
                      href={event.registration_link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Vai alla pagina di iscrizione
                    </a>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default EventManager
