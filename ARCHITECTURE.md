# Systemarkitektur för Service Gateway

Detta dokument beskriver den övergripande arkitekturen för Service Gateway, ett system för ärendehantering och processautomatisering.

## 🏛 Övergripande Arkitektur

Service Gateway är byggt enligt en modern webbapplikationsarkitektur med följande huvudkomponenter:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Externa       │
│   (React)       │◄──►│   (Supabase)    │◄──►│   System        │
│                 │    │                 │    │                 │
│ • Flödesbyggare │    │ • PostgreSQL    │    │ • POB G6       │
│ • Ärendehantering│    │ • Auth          │    │ • CMDB         │
│ • CMDB Dashboard│    │ • Real-time     │    │ • AI-tjänster  │
│ • Admin panel   │    │ • Storage       │    │ • E-post        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🧩 Komponentdiagram

### Frontend-arkitektur

```
src/
├── components/          # Återanvändbara UI-komponenter
│   ├── ui/             # Shadcn/ui bas-komponenter
│   ├── editor/         # Flödesbyggar-specifika komponenter
│   └── flow/           # Flödeskörningskomponenter
├── contexts/           # Global state management
│   ├── AuthContext.tsx # Användarautentisering & roller
│   └── ...
├── hooks/              # Anpassade React hooks
│   ├── use-flow-builder.ts  # Flödesbyggar-logik
│   ├── use-flow-crud.ts     # CRUD-operationer för flöden
│   ├── use-flow-runtime.ts  # Flödeskörning
│   └── ...
├── lib/                # Hjälpfunktioner & konfigurationer
│   ├── flow-engine/    # Flödesmotor & typer
│   ├── cmdb/          # CMDB-funktionalitet
│   ├── mock-api.ts    # Mock-API för utveckling
│   └── utils.ts       # Hjälpfunktioner
├── pages/              # Sid-routing & layouts
│   ├── admin/         # Administrationssidor
│   ├── editor/        # Flödeseditor
│   └── *.tsx          # Användarsidor
└── integrations/       # Externa API-integrationer
    └── supabase/       # Supabase klient & typer
```

### Backend-arkitektur (Supabase)

```
supabase/
├── migrations/         # Databasscheman & migrationer
├── config.toml         # Supabase konfiguration
└── functions/          # Edge functions (framtida)
```

## 🔄 Dataflöden

### Användarflöde: Skapa och genomföra ett flöde

```mermaid
sequenceDiagram
    participant U as Användare
    participant F as Frontend
    participant S as Supabase
    participant E as Externa API:er

    U->>F: Logga in
    F->>S: Autentisera användare
    S-->>F: JWT-token & användardata

    U->>F: Välj flöde
    F->>S: Hämta flödesdefinition
    S-->>F: Flödesdata (steg, frågor, actions)

    U->>F: Fyll i formulär
    F->>F: Validera input lokalt

    U->>F: Skicka in data
    F->>S: Spara submission
    S-->>F: Bekräftelse

    F->>E: Kör actions (lookup, automation, etc.)
    E-->>F: Resultat från externa system

    F->>S: Uppdatera submission med resultat
    S-->>F: Uppdaterad data

    F->>U: Visa nästa steg eller bekräftelse
```

### Redaktörflöde: Skapa och publicera flöden

```mermaid
sequenceDiagram
    participant R as Redaktör
    participant F as Frontend
    participant S as Supabase

    R->>F: Öppna flödeseditor
    F->>S: Hämta befintliga flöden
    S-->>F: Flödeslista

    R->>F: Skapa nytt flöde
    F->>F: Initiera tomt flöde

    R->>F: Lägg till steg & frågor
    F->>F: Uppdatera flödesmodell

    R->>F: Konfigurera actions
    F->>F: Validera action-konfiguration

    R->>F: Spara utkast
    F->>S: Spara flow_versions med status 'draft'
    S-->>F: Versions-ID

    R->>F: Publicera flöde
    F->>S: Uppdatera flow.status till 'published'
    S-->>F: Publiceringsbekräftelse
```

### Admin-flöde: Systemadministration

```mermaid
sequenceDiagram
    participant A as Administratör
    participant F as Frontend
    participant S as Supabase

    A->>F: Öppna admin-panel
    F->>S: Hämta systemdata (användare, roller, logs)
    S-->>F: Admin-data

    A->>F: Hantera användarroller
    F->>S: Uppdatera user_roles
    S-->>F: Bekräftelse

    A->>F: Granska audit logs
    F->>S: Hämta audit_logs med filtrering
    S-->>F: Loggdata

    A->>F: Konfigurera integrationer
    F->>S: Uppdatera integration_settings
    S-->>F: Uppdateringsbekräftelse

    A->>F: Övervaka systemhälsa
    F->>S: Hämta statistik & metrics
    S-->>F: Systemstatus
```

## 💾 Databasmodell

### Huvudentiteter

```mermaid
erDiagram
    profiles ||--o{ user_roles : has
    profiles ||--o{ flows : creates
    profiles ||--o{ submissions : submits
    profiles ||--o{ audit_logs : performs

    flows ||--o{ flow_versions : has
    flow_versions ||--o{ submissions : used_by

    flows {
        uuid id PK
        text name
        text description
        text category
        jsonb tags
        uuid start_step_id FK
        jsonb permissions
        flow_status status
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    flow_versions {
        uuid id PK
        uuid flow_id FK
        int version
        flow_status status
        jsonb tree_json
        jsonb mapping_json
        uuid created_by FK
        timestamptz created_at
    }

    submissions {
        uuid id PK
        uuid flow_version_id FK
        uuid user_id FK
        jsonb answers_json
        text pob_ticket_id
        text pob_status_cache
        timestamptz created_at
        timestamptz updated_at
    }
```

### CMDB-entiteter

```mermaid
erDiagram
    cmdb_users ||--o{ cmdb_devices : owns
    cmdb_systems ||--o{ cmdb_servers : runs_on
    cmdb_systems ||--o{ cmdb_databases : uses
    cmdb_systems ||--o{ cmdb_apis : exposes
    cmdb_systems ||--o{ cmdb_applications : contains

    cmdb_users {
        uuid id PK
        text name
        text email
        text department
        text location
        timestamptz created_at
        timestamptz updated_at
    }

    cmdb_devices {
        uuid id PK
        text name
        text type
        uuid owner_id FK
        text location
        jsonb specifications
        device_status status
        timestamptz created_at
        timestamptz updated_at
    }
```

## 🔐 Säkerhetsarkitektur

### Autentisering & Auktorisering

```mermaid
graph TD
    A[Användare] --> B[Supabase Auth]
    B --> C{JWT-validering}
    C --> D[Användarprofil]
    D --> E{Rollkontroll}
    E --> F[Behörigheter]
    E --> G[Åtkomst nekad]

    F --> H[RLS Policies]
    H --> I[Databasåtkomst]
```

### Row Level Security (RLS)

Alla tabeller har RLS aktiverat med policies baserat på:

- **Ägarskap**: Användare kan endast se/modifiera sina egna data
- **Roller**: Admin, editor, manager, user med olika behörigheter
- **Status**: Published vs draft content
- **Organisation**: Framtida multi-tenant stöd

## ⚡ Prestanda & Skalbarhet

### Optimeringar

1. **Frontend**
   - Code splitting med React.lazy()
   - React Query för intelligent caching
   - Virtualisering för stora listor
   - Optimistic updates

2. **Backend**
   - Database indexes på ofta använda fält
   - Connection pooling
   - Query optimization
   - CDN för statiska tillgångar

3. **API:er**
   - Rate limiting
   - Request batching
   - Response compression
   - Caching headers

### Skalbarhetsstrategier

- **Horisontell skalning**: Stateless frontend, Supabase hanterar skalning
- **Database sharding**: Framtida vid behov
- **CDN**: För global distribution
- **Microservices**: Edge functions för tunga beräkningar

## 🔄 Integrationsarkitektur

### Synkrona Integrationer

```mermaid
graph TD
    A[Service Gateway] --> B[POB G6 API]
    A --> C[CMDB API]
    A --> D[AI Services]
    A --> E[Email Service]

    B --> F[Ticket Management]
    C --> G[Asset Management]
    D --> H[Intelligent Suggestions]
    E --> I[Notifications]
```

### Asynkrona Integrationer

- **Webhooks**: För realtidsuppdateringar
- **Message queues**: För tunga bakgrundsjobb
- **Event streaming**: För audit logging och analytics

## 📊 Övervakning & Observabilitet

### Metrics

- **Applikationsmetrics**: Response times, error rates, användaraktivitet
- **Databasmetrics**: Query performance, connection pools, storage usage
- **Systemmetrics**: CPU, memory, disk I/O

### Logging

- **Application logs**: Frontend errors, API calls
- **Audit logs**: Alla användaråtgärder
- **Integration logs**: Externa API-anrop
- **Security logs**: Autentiseringsförsök, åtkomstkontroll

### Alerting

- **Error thresholds**: Automatiska notifieringar vid fel
- **Performance degradation**: Svarstidsövervakning
- **Security incidents**: Misstänkta aktiviteter

## 🚀 Deployment & DevOps

### Utvecklingsmiljö

```
┌─────────────────┐    ┌─────────────────┐
│   Lokal dev     │    │   GitHub Codespaces │
│   (npm/bun)     │    │   (VS Code)      │
└─────────────────┘    └─────────────────┘
```

### Staging & Produktion

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel/Netlify│    │   Supabase       │    │   CDN           │
│   (Frontend)    │    │   (Backend)      │    │   (Assets)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### CI/CD Pipeline

```mermaid
graph LR
    A[Git Push] --> B[GitHub Actions]
    B --> C[Install Dependencies]
    C --> D[Run Tests]
    D --> E[Build Application]
    E --> F[Deploy to Staging]
    F --> G[Integration Tests]
    G --> H[Deploy to Production]
```

## 🔮 Framtida Arkitektur

### Planerade Förbättringar

1. **Microservices**
   - Separera flödesmotor till egen tjänst
   - AI-tjänst för intelligenta förslag
   - Notification service för e-post/SMS

2. **Multi-tenant**
   - Organisation-isolering
   - Custom branding per tenant
   - Tenant-specific konfigurationer

3. **Advanced Analytics**
   - Real-time dashboards
   - Machine learning för prediktiv analys
   - Advanced reporting capabilities

4. **Mobile Support**
   - React Native app
   - PWA capabilities
   - Offline support

### Tekniska Skulder

- Migrera från mock-API till riktiga integrationer
- Implementera comprehensive testing
- Add API versioning
- Improve error handling and user feedback

---

Denna arkitektur ger en solid grund för ett skalbart, säkert och användarvänligt system för ärendehantering och processautomatisering.