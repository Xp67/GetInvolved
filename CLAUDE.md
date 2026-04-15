# GetInvolved — Claude Code Instructions

## Knowledge Graph Workflow

This project has a live knowledge graph in `graphify-out/graph.json` (515 nodes, 1214 edges).
Before adding features or refactoring, consult the graph. After changing code, update it.

### Rule 1 — Use the graph before writing code

Before any non-trivial addition or refactor, run:
```
/graphify query "<what you're about to change>"
```
or:
```
/graphify path "SourceNode" "TargetNode"
```

Use the graph to answer:
- Which other nodes does the thing I'm changing connect to?
- Which communities does it bridge? Changing a god node (Event, Role, TicketCategory, PermissionCategory, AppPermission, Ticket) has wide blast radius.
- Does this already exist somewhere else in the graph (avoid duplicating logic)?

**God nodes** (highest betweenness — touch carefully):
`Event`, `Role`, `TicketCategory`, `PermissionCategory`, `AppPermission`, `Ticket`, `UserSerializer`, `EventSerializer`

### Rule 2 — Update the graph after every code change

After any meaningful code change (new file, new function, structural refactor), run:
```
/graphify . --update
```
This re-extracts only changed files and merges them into the existing graph. Keep the graph current.

### Rule 3 — Refactor guided by the graph

After updating the graph, check for:
1. **New god nodes** — any node that gained many edges is a refactor candidate (split it).
2. **Low-cohesion communities** — communities with cohesion < 0.10 contain loosely coupled code; extract shared abstractions.
3. **Surprising INFERRED edges** — if the graph inferred a connection you didn't intend, it may signal hidden coupling that should be made explicit or broken.
4. **Duplicate semantics** — `semantically_similar_to` edges flag code that solves the same problem twice.

Run `/graphify query "refactoring candidates"` to trace the graph and identify concrete targets.

## Architecture Summary (from graph)

- **Backend**: Django REST Framework (`backend/api/`) — god nodes are all Django models/serializers
- **Admin frontend**: React + Vite + MUI (`admin/src/`) — address geocoding utils form a tight cluster
- **Client frontend**: React + Vite (`client/src/`) — mirrors admin structure
- **RBAC**: `Role` → `AppPermission` → `PermissionCategory` — highly connected, changes cascade everywhere
- **Tickets**: `TicketCategory` → `Ticket` → QR/PDF generation stack (qrcode + reportlab + Pillow)
- **Background jobs**: `jobs.py` auto-concludes past events — coupled to `Event` model across boundaries
