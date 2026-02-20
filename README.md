# Service Gateway

En modern webbapplikation för ärendehantering och processautomatisering byggd med React, TypeScript och Supabase. Systemet möjliggör skapande av dynamiska flöden för olika typer av ärenden och beställningar, med integrerad CMDB för IT-tillgångshantering.

## 🚀 Funktioner

### Flödeshantering
- **Visuell flödesbyggare**: Skapa komplexa processer med dra-och-släpp
- **Dynamiska formulär**: Olika frågetyper (text, select, datum, filuppladdning, etc.)
- **Villkorliga övergångar**: Logikbaserade flöden baserat på användarsvar
- **Actions & Automation**: Integrationer med externa system och automatiserade åtgärder
- **AI-stöd**: Intelligenta förslag och validering

### Ärendehantering
- **Skapa ärenden**: Incidentrapportering och beställningar
- **Statusuppföljning**: Spåra ärenden från öppet till löst
- **Kommentarer**: Kommunikation mellan användare och support
- **Kategorisering**: Organisera ärenden efter typ och prioritet

### CMDB (Configuration Management Database)
- **Tillgångshantering**: Användare, enheter, system, servrar, databaser, API:er
- **Dynamiska lookups**: Använd CMDB-data i flödesformulär
- **Hierarkiska relationer**: Koppla samman olika IT-tillgångar

### Administration
- **Rollbaserad åtkomst**: Användare, chefer, redaktörer, administratörer
- **Audit logs**: Spåra alla ändringar och åtgärder
- **Statistik**: Översikter och nyckeltal
- **Integrationer**: Konfigurera externa systemanslutningar

## 🛠 Teknikstack

- **Frontend**: React 18, TypeScript, Vite
- **UI-komponenter**: Shadcn/ui, Radix UI, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Tillståndshantering**: TanStack Query, React Context
- **Formulär**: React Hook Form, Zod
- **Byggverktyg**: Vite, ESLint, TypeScript
- **Testning**: Vitest, Testing Library

## 📋 Förutsättningar

- Node.js 18+ eller Bun
- Supabase-konto och projekt
- Git

## 🚀 Installation och Setup

### 1. Klona repositoryt

```bash
git clone <repository-url>
cd service-gateway
```

### 2. Installera beroenden

```bash
# Med npm
npm install

# Eller med bun (rekommenderas)
bun install
```

### 3. Miljökonfiguration

Skapa `.env.local` i roten av projektet:

```env
VITE_SUPABASE_URL=din-supabase-url
VITE_SUPABASE_ANON_KEY=din-supabase-anon-key
```

### 4. Supabase Setup

1. Skapa ett nytt Supabase-projekt
2. Kör migrationsfilerna i `supabase/migrations/` ordning
3. Konfigurera autentiseringsproviders om nödvändigt
4. Uppdatera RLS-policies enligt dina behov

### 5. Starta utvecklingsservern

```bash
# Med npm
npm run dev

# Eller med bun
bun run dev
```

Applikationen kommer att vara tillgänglig på `http://localhost:5173`

## 📖 Användning

### För Användare

1. **Logga in** med dina autentiseringsuppgifter
2. **Skapa ärende** genom att klicka på "Skapa ärende" på startsidan
3. **Följ flödet** genom de olika stegen i det valda formuläret
4. **Spåra dina ärenden** under "Mina ärenden"

### För Redaktörer

1. **Skapa flöden** under "Flöden" i editor-sektionen
2. **Designa formulär** med olika frågetyper och valideringar
3. **Lägg till actions** för automation och integrationer
4. **Publicera flöden** när de är klara för användning

### För Administratörer

1. **Hantera roller** under "Admin > Roller"
2. **Övervaka systemet** genom audit logs och statistik
3. **Konfigurera integrationer** med externa system
4. **Hantera CMDB-data** för IT-tillgångar

## 🏗 Arkitektur

### Projektstruktur

```
src/
├── components/          # Återanvändbara UI-komponenter
│   ├── ui/             # Shadcn/ui-komponenter
│   ├── editor/         # Flödesbyggar-komponenter
│   └── flow/           # Flödeskörnings-komponenter
├── contexts/           # React Context providers
├── hooks/              # Anpassade React hooks
├── integrations/       # Externa API-integrationer
├── lib/                # Hjälpfunktioner och konfigurationer
│   ├── flow-engine/    # Flödesmotor och typer
│   ├── cmdb/          # CMDB-funktionalitet
│   └── mock-api.ts    # Mock-API för utveckling
├── pages/              # Sidkomponenter
│   ├── admin/         # Administrationssidor
│   ├── editor/        # Flödeseditor
│   └── *.tsx          # Användarsidor
└── types/             # TypeScript-typer
```

### Databasstruktur

#### Huvudtabeller

- **profiles**: Användarprofiler
- **user_roles**: Rollbaserad åtkomstkontroll
- **flows**: Flödesdefinitioner
- **flow_versions**: Versionshantering av flöden
- **submissions**: Användarinskickade formulär
- **audit_logs**: Spårning av alla åtgärder
- **integration_logs**: Loggning av externa API-anrop

#### CMDB-tabeller

- **cmdb_users**: Användare i organisationen
- **cmdb_devices**: Slutenheter och hårdvara
- **cmdb_systems**: Programvarusystem
- **cmdb_servers**: Servrar och infrastruktur
- **cmdb_databases**: Databaser
- **cmdb_apis**: API-endpoints
- **cmdb_applications**: Applikationer

## 🔧 API:er och Integrationer

### Supabase Integrationer

Systemet använder Supabase för:

- **Autentisering**: JWT-baserad auth med rollhantering
- **Databas**: PostgreSQL med Row Level Security
- **Real-time**: Live-uppdateringar för samarbete
- **Storage**: Filuppladdningar och dokument

### Externa Integrationer

- **POB G6**: Ärendehanteringssystem (mock-API implementerat)
- **CMDB**: Konfigurationshantering (internt system)
- **AI-tjänster**: För intelligenta förslag och validering

### Actions-systemet

Flöden kan innehålla olika typer av actions:

- **Lookup**: Hämta data från externa system
- **Automation**: Skapa ärenden eller utför åtgärder
- **Validation**: Validera indata mot affärsregler
- **Enrichment**: Berika data med AI eller logik
- **Notification**: Skicka e-post eller notiser

## 🧪 Testning

```bash
# Kör alla tester
npm run test

# Kör tester i watch-läge
npm run test:watch

# Generera testtäckning
npm run test:coverage
```

## 🚢 Deployment

### Utvecklingsbygg

```bash
npm run build:dev
```

### Produktionsbygg

```bash
npm run build
```

### Statisk Filserver

```bash
npm run preview
```

### Docker (framtida implementation)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "preview"]
```

## 🔐 Säkerhet

- **Row Level Security**: Alla databasanrop skyddas av RLS-policies
- **Rollbaserad åtkomst**: Granulär behörighetskontroll
- **Input-validering**: Zod-scheman för alla användarinput
- **Audit logging**: Alla ändringar loggas för spårbarhet
- **HTTPS**: Krävs för produktionsmiljöer

## 📊 Övervakning

### Loggar

- **Audit logs**: Alla användaråtgärder loggas
- **Integration logs**: Externa API-anrop loggas
- **Felhantering**: Omfattande error logging och användarvänliga meddelanden

### Statistik

- **Ärendestatistik**: Lösningstider, kategorier, status
- **Flödesanalys**: Användning och effektivitet
- **Systemhälsa**: Prestanda och tillgänglighet

## 🤝 Bidrag

1. Forka projektet
2. Skapa en feature-branch (`git checkout -b feature/ny-funktion`)
3. Gör dina ändringar
4. Lägg till tester för ny funktionalitet
5. Kör linting (`npm run lint`)
6. Commita dina ändringar (`git commit -am 'Lägg till ny funktion'`)
7. Pusha till branchen (`git push origin feature/ny-funktion`)
8. Skapa en Pull Request

### Kodstandarder

- **TypeScript**: Strikt typning krävs
- **ESLint**: Alla lint-regler måste passera
- **Prettier**: Kodformatering enligt projektets regler
- **Tester**: Minst 80% testtäckning för ny kod
- **Kommentarer**: Svenska kommentarer för komplex logik

## 📝 Licens

Detta projekt är licensierat under MIT-licensen - se [LICENSE](LICENSE) filen för detaljer.

## 📞 Support

För support och frågor:

- **Dokumentation**: Denna README och inline-kommentarer
- **Issues**: GitHub Issues för buggrapporter och feature requests
- **Wiki**: Projektwiki för detaljerad dokumentation

## 🗺 Roadmap

### Kort sikt (Q1 2026)
- [ ] Förbättrad AI-integration
- [ ] Mobilapp (React Native)
- [ ] Avancerad rapportering

### Lång sikt (2026+)
- [ ] Multi-tenant arkitektur
- [ ] Integration med Microsoft 365
- [ ] Machine learning för prediktiv analys
- [ ] Workflow-automatisering med RPA

---

**Byggt med ❤️ för effektiv ärendehantering och processautomatisering**
