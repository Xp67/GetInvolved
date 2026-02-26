# Progetto GetInvolved - Istruzioni per AI

## Gestione Permessi e Visibilità UI

Il sistema utilizza un modello di controllo accessi basato su ruoli e permessi granulari. La visibilità degli elementi dell'interfaccia utente (UI) deve seguire rigorosamente le autorizzazioni dell'utente.

### Regola di Visibilità Posizioni e Sezioni
Le sezioni della UI (es. 'Eventi', 'Utenti' nella Sidebar) e le posizioni principali (es. 'Dashboard' nella Navbar) sono soggette a visibilità condizionale:
1. **Sezione**: Una sezione è visibile se l'utente possiede **almeno uno** dei permessi associati a quella sezione.
2. **Posizione**: Una posizione (che raggruppa più sezioni) è visibile se l'utente può accedere ad **almeno una** delle sezioni in essa contenute.
3. **Super Admin**: Gli utenti con il flag `is_super_admin` (o ruolo 'Super Admin') hanno sempre accesso a tutte le sezioni e posizioni.

Questa logica deve essere mantenuta per tutti i permessi e le aree funzionali future.

### Verifica Grafica Multi-Contesto
Quando si apportano modifiche alla UI o alla logica di visualizzazione:
- **Controllo Incrociato**: Verificare sempre sia la versione grafica **Web (Desktop)** che quella **Mobile**.
- **Ottimizzazione**: Cercare le soluzioni migliori in base al contesto (es. Drawer vs Sidebar, icone vs testo) per garantire un'esperienza utente coerente e funzionale su tutti i dispositivi.

## Gestione Dati e Ambiente
- **Persistenza Database**: Il database (`db.sqlite3`) **non deve mai essere resettato o cancellato**. Tutte le migrazioni devono essere applicate per mantenere i dati esistenti. Se un database viene accidentalmente rimosso, deve essere ripristinato dalla cronologia Git.

## Struttura Progetto
- `backend/`: Django REST Framework API.
- `frontend/`: React (Vite) + Material UI.
