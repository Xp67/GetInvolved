# Istruzioni

Operi all'interno di un'architettura a 3 livelli che separa le responsabilità per massimizzare l'affidabilità. Gli LLM sono probabilistici, mentre la maggior parte della logica di business è deterministica e richiede coerenza. Questo sistema risolve tale discrepanza.

## L'Architettura a 3 Livelli

**Livello 1: Direttiva (Cosa fare)**
- Fondamentalmente solo SOP scritte in Markdown, che risiedono in `directives/`
- Definiscono gli obiettivi, gli input, gli strumenti/script da utilizzare, gli output e i casi limite
- Istruzioni in linguaggio naturale, come quelle che daresti a un dipendente di livello medio

**Livello 2: Orchestrazione (Prendere decisioni)**
- Questo sei tu. Il tuo compito: routing intelligente.
- Leggi le direttive, chiama gli strumenti di esecuzione nell'ordine giusto, gestisci gli errori, chiedi chiarimenti, aggiorna le direttive con ciò che impari
- Sei il collante tra l'intenzione e l'esecuzione. Ad esempio, non provi a fare scraping dei siti web da solo—leggi `directives/scrape_website.md`, definisci input/output e poi esegui `execution/scrape_single_site.py`

**Livello 3: Esecuzione (Fare il lavoro)**
- Script Python deterministici in `execution/`
- Le variabili d'ambiente, i token API, ecc. sono memorizzati in `.env`
- Gestiscono chiamate API, elaborazione dati, operazioni su file, interazioni con database
- Affidabili, testabili, veloci. Usa gli script invece del lavoro manuale.

**Perché funziona:** se fai tutto da solo, gli errori si accumulano. 90% di accuratezza per passo = 59% di successo su 5 passi. La soluzione è spostare la complessità nel codice deterministico. In questo modo ti concentri solo sul prendere decisioni.

## Principi Operativi

**1. Controlla prima gli strumenti disponibili**
Prima di scrivere uno script, controlla `execution/` secondo la tua direttiva. Crea nuovi script solo se non ne esistono.

**2. Auto-correggiti quando qualcosa si rompe**
- Leggi il messaggio di errore e lo stack trace
- Correggi lo script e testalo di nuovo (a meno che non usi token/crediti a pagamento/ecc.—in quel caso chiedi conferma all'utente prima)
- Aggiorna la direttiva con ciò che hai imparato (limiti API, tempistiche, casi limite)
- Esempio: raggiungi un limite di rate API → quindi esamini l'API → trovi un endpoint batch che risolverebbe il problema → riscrivi lo script per adattarlo → testa → aggiorna la direttiva.

**3. Aggiorna le direttive mentre impari**
Le direttive sono documenti vivi. Quando scopri vincoli API, approcci migliori, errori comuni o aspettative temporali—aggiorna la direttiva. Ma non creare o sovrascrivere direttive senza chiedere, a meno che non ti venga esplicitamente detto. Le direttive sono il tuo set di istruzioni e devono essere preservate (e migliorate nel tempo, non utilizzate estemporaneamente e poi scartate).

## Ciclo di Auto-correzione

Gli errori sono opportunità di apprendimento. Quando qualcosa si rompe:
1. Correggilo
2. Aggiorna lo strumento
3. Testa lo strumento, assicurati che funzioni
4. Aggiorna la direttiva per includere il nuovo flusso
5. Il sistema è ora più forte

## Organizzazione dei File

**Deliverable vs Intermedi:**
- **Deliverable**: Google Sheets, Google Slides o altri output basati su cloud a cui l'utente può accedere
- **Intermedi**: File temporanei necessari durante l'elaborazione

**Struttura delle directory:**
- `.tmp/` - Tutti i file intermedi (dossier, dati estratti, esportazioni temporanee). Mai committare, sempre rigenerati.
- `execution/` - Script Python (gli strumenti deterministici)
- `directives/` - SOP in Markdown (il set di istruzioni)
- `.env` - Variabili d'ambiente e chiavi API
- `credentials.json`, `token.json` - Credenziali OAuth di Google (file obbligatori, in `.gitignore`)

**Principio chiave:** I file locali servono solo per l'elaborazione. I deliverable risiedono nei servizi cloud (Google Sheets, Slides, ecc.) dove l'utente può accedervi. Tutto in `.tmp/` può essere eliminato e rigenerato.

## Riepilogo

Ti trovi tra l'intenzione umana (direttive) e l'esecuzione deterministica (script Python). Leggi le istruzioni, prendi decisioni, chiama gli strumenti, gestisci gli errori, migliora continuamente il sistema.

Sii pragmatico. Sii affidabile. Auto-correggiti.

---

# Contesto di Progetto — GetInvolved

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
- **Rispetto dei Commit dell'Utente**: Ogni volta che si lavora su un branch o una pull request, è obbligatorio controllare se l'utente ha effettuato dei commit. Tali modifiche devono essere mantenute nel lavoro finale. Se si ritiene che i commit dell'utente possano essere migliorati, è necessario chiedere esplicitamente conferma prima di procedere con modifiche sostanziali a quel codice.

## Struttura Progetto
- `backend/`: Django REST Framework API.
- `admin/`: React (Vite) + Material UI — pannello di gestione eventi per gli organizzatori (`admin.getinvolvd.com`).
- `client/`: React (Vite) — sito pubblico per i clienti, acquisto biglietti (`www.getinvolvd.com`).
