# API-dokumentation för Service Gateway

Detta dokument beskriver API:erna och integrationerna i Service Gateway-systemet.

## 📡 Supabase API

### Autentisering

Systemet använder Supabase Auth för användarhantering:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Inloggning
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Utloggning
await supabase.auth.signOut();

// Hämta aktuell användare
const { data: { user } } = await supabase.auth.getUser();
```

### Databas-API:er

#### Flöden

```typescript
// Hämta alla flöden
const { data: flows } = await supabase
  .from('flows')
  .select('*')
  .eq('status', 'published');

// Hämta specifikt flöde med versioner
const { data: flow } = await supabase
  .from('flows')
  .select(`
    *,
    flow_versions (*)
  `)
  .eq('id', flowId)
  .single();
```

#### Ärenden (Submissions)

```typescript
// Skapa nytt ärende
const { data: submission } = await supabase
  .from('submissions')
  .insert({
    flow_version_id: versionId,
    answers_json: userAnswers,
    pob_ticket_id: ticketId
  })
  .select()
  .single();

// Uppdatera ärende
await supabase
  .from('submissions')
  .update({ answers_json: updatedAnswers })
  .eq('id', submissionId);
```

#### CMDB-data

```typescript
// Hämta alla användare
const { data: users } = await supabase
  .from('cmdb_users')
  .select('*');

// Sök efter enheter
const { data: devices } = await supabase
  .from('cmdb_devices')
  .select('*')
  .ilike('name', `%${searchTerm}%`);
```

## 🔌 Externa Integrationer

### POB G6 API (Mock)

Systemet integrerar med POB G6 för ärendehantering:

```typescript
import { pobApi } from '@/lib/mock-api';

// Hämta ärenden
const tickets = await pobApi.getTickets();

// Skapa nytt ärende
const newTicket = await pobApi.createTicket({
  title: 'Datorproblem',
  description: 'Kan inte starta datorn',
  category: 'IT-Support',
  priority: 'Hög'
});

// Uppdatera ärende
await pobApi.updateTicket(ticketId, {
  status: 'in_progress',
  assignedTo: 'Tekniker Anna'
});
```

### CMDB Admin API

För administration av CMDB-data:

```typescript
import * as admin from '@/lib/cmdb/admin';

// Hantera användare
const users = await admin.getAllUsers();
await admin.createUser({ name: 'Anna Andersson', email: 'anna@company.com' });

// Hantera enheter
const devices = await admin.getAllDevices();
await admin.createDevice({
  name: 'Dell Latitude 5420',
  type: 'Laptop',
  owner_id: userId
});
```

## ⚙️ Actions-systemet

### Action-typer

Systemet stödjer olika typer av actions som kan köras i flöden:

#### 1. Lookup Actions

Hämtar data från externa system:

```typescript
{
  id: "lookup-1",
  name: "Hämta användardata",
  type: "lookup",
  trigger: "pre_step",
  input_template: {
    "userId": "{{answers.userId}}"
  },
  output_mapping: {
    "answers.userName": "result.name",
    "answers.userEmail": "result.email"
  },
  error_handling: {
    strategy: "skip",
    user_message: "Kunde inte hämta användardata"
  }
}
```

#### 2. Automation Actions

Skapar ärenden eller utför åtgärder:

```typescript
{
  id: "automation-1",
  name: "Skapa supportärende",
  type: "automation",
  trigger: "post_step",
  input_template: {
    "title": "{{answers.issueTitle}}",
    "description": "{{answers.issueDescription}}",
    "category": "IT-Support"
  },
  output_mapping: {
    "answers.ticketId": "result.id",
    "answers.ticketStatus": "result.status"
  }
}
```

#### 3. Validation Actions

Validerar indata mot affärsregler:

```typescript
{
  id: "validation-1",
  name: "Validera e-post",
  type: "validation",
  trigger: "on_change",
  trigger_question_id: "email-field",
  input_template: {
    "email": "{{answers.email}}"
  },
  error_handling: {
    strategy: "stop",
    user_message: "Ogiltig e-postadress"
  }
}
```

#### 4. Enrichment Actions

Berikar data med AI eller logik:

```typescript
{
  id: "enrichment-1",
  name: "AI-kategorisering",
  type: "enrichment",
  trigger: "post_step",
  input_template: {
    "description": "{{answers.problemDescription}}"
  },
  output_mapping: {
    "answers.category": "result.category",
    "answers.priority": "result.priority"
  }
}
```

#### 5. Notification Actions

Skickar notiser eller e-post:

```typescript
{
  id: "notification-1",
  name: "Skicka bekräftelse",
  type: "notification",
  trigger: "post_step",
  input_template: {
    "to": "{{answers.email}}",
    "subject": "Ärende mottaget",
    "body": "Ditt ärende #{{answers.ticketId}} har registrerats"
  }
}
```

## 🔄 Flödesmotor API

### Flödestyper

Systemet stödjer olika typer av flödessteg:

#### Questions Step

Samlar in användardata genom formulär:

```typescript
{
  id: "step-1",
  title: "Beskriv problemet",
  type: "questions",
  questions: [
    {
      id: "q1",
      label: "Vad är problemet?",
      input_type: "textarea",
      required: true
    },
    {
      id: "q2",
      label: "Prioritet",
      input_type: "select",
      required: true,
      options: [
        { value: "low", label: "Låg" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "Hög" }
      ]
    }
  ]
}
```

#### Info Step

Visar information eller instruktioner:

```typescript
{
  id: "step-info",
  title: "Viktig information",
  type: "info",
  description: "Ditt ärende har registrerats och kommer att behandlas inom 24 timmar."
}
```

#### Action Step

Utför automatiserade åtgärder:

```typescript
{
  id: "step-action",
  title: "Behandlar...",
  type: "action",
  pre_actions: [
    // Actions som körs innan steget visas
  ],
  post_actions: [
    // Actions som körs efter steget
  ]
}
```

### Övergångar (Transitions)

Definierar logik för att navigera mellan steg:

```typescript
{
  transitions: [
    {
      id: "t1",
      condition: {
        type: "equals",
        field: "answers.priority",
        value: "high"
      },
      next_step_id: "urgent-step",
      is_default: false
    },
    {
      id: "t2",
      next_step_id: "normal-step",
      is_default: true
    }
  ]
}
```

### Villkor (Conditions)

Stöd för komplexa villkor i övergångar:

```typescript
// Enkelt villkor
{
  type: "equals",
  field: "answers.category",
  value: "IT-Support"
}

// Komplexa villkor
{
  type: "and",
  children: [
    {
      type: "equals",
      field: "answers.priority",
      value: "high"
    },
    {
      type: "exists",
      field: "answers.approver"
    }
  ]
}

// Rollbaserade villkor
{
  type: "has_role",
  value: "manager"
}
```

## 📊 Real-time Updates

Systemet använder Supabase real-time för live-uppdateringar:

```typescript
// Prenumerera på flödesändringar
const channel = supabase
  .channel('flows')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'flows' },
    (payload) => {
      console.log('Flöde uppdaterat:', payload);
    }
  )
  .subscribe();

// Prenumerera på ärendeuppdateringar
const ticketChannel = supabase
  .channel('tickets')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'submissions' },
    (payload) => {
      // Uppdatera UI
    }
  )
  .subscribe();
```

## 🔍 Sök och Filtrering

### Flödessökning

```typescript
// Sök efter flöden
const { data: flows } = await supabase
  .from('flows')
  .select('*')
  .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
  .eq('status', 'published');
```

### Ärendesökning

```typescript
// Sök efter ärenden
const { data: submissions } = await supabase
  .from('submissions')
  .select(`
    *,
    flow_versions (
      flows (name)
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

## 🛡️ Säkerhet och Behörigheter

### Row Level Security (RLS)

Alla databastabeller har RLS aktiverat:

```sql
-- Exempel: Användare kan bara se sina egna submissions
CREATE POLICY "Users can view own submissions"
ON public.submissions FOR SELECT
USING (auth.uid() = user_id);
```

### Rollbaserade Policies

```sql
-- Administratörer kan hantera allt
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### API-nycklar och Secrets

- Använd miljövariabler för känsliga konfigurationer
- Rotera API-nycklar regelbundet
- Använd HTTPS för alla externa anrop

## 📈 Övervakning och Loggning

### Audit Logs

Alla viktiga åtgärder loggas:

```typescript
// Logga användaråtgärd
await supabase
  .from('audit_logs')
  .insert({
    actor_id: userId,
    action: 'flow_created',
    entity_type: 'flow',
    entity_id: flowId,
    payload_json: { flowName: name }
  });
```

### Integration Logs

Externa API-anrop loggas:

```typescript
// Logga API-anrop
await supabase
  .from('integration_logs')
  .insert({
    correlation_id: requestId,
    endpoint: 'pob-api/tickets',
    request_meta: { method: 'POST', body: requestBody },
    response_meta: { status: response.status },
    status: response.ok ? 'success' : 'error'
  });
```

## 🚀 Prestandaoptimeringar

### Query-optimeringar

- Använd `select` för att endast hämta nödvändiga fält
- Implementera pagination för stora dataset
- Använd indexes på ofta sökta fält

### Caching

- React Query cache:ar API-anrop
- Supabase cache:ar databassvar
- Service Worker för offline-stöd (framtida)

### Lazy Loading

- Komponenter laddas på begäran
- Bilder och stora resurser lazy loadas
- Koddelning med dynamic imports

---

## 🖥️ CMDB Gateway API

### Installerad mjukvara (nytt)

```typescript
import { cmdbGateway } from '@/lib/cmdb';

// Hämta installerad mjukvara på en enhet
const software = await cmdbGateway.getDeviceInstalledSoftware("dev-1");
// Returnerar: CmdbInstalledSoftware[] med id, deviceId, name, version, vendor
```

### Användarmappning (förbättrat)

`getMyOverview` stödjer nu e-post/displayName-matchning:

```typescript
// Mappning: email → displayName → fallback "u-1"
const overview = await cmdbGateway.getMyOverview(
  supabaseUserId,  // Supabase user.id
  userEmail,       // user.email – matchas mot CMDB-identitet
  displayName      // profil-displayName – sekundär matchning
);
```

### Dynamisk alternativkälla: `deviceInstalledSoftware`

Ny CMDB-källa för dynamiska frågor i flöden:

```typescript
// I flow-definition
{
  id: "installedSoftware",
  input_type: "multiselect",
  optionsMode: "dynamic",
  dynamicOptions: {
    provider: "cmdb",
    source: "deviceInstalledSoftware",
    params: { deviceId: "{{answers.deviceId}}" },
    labelTemplate: "{{name}} v{{version}} ({{vendor}})",
    valuePath: "id",
    dependsOn: ["deviceId"]
  }
}
```

### UserOverview – utökad (förbättrat)

`getUserOverview` inkluderar nu CI där användaren är:
- **Tilldelad** (devices via assignedUserId, apps via userAccess)
- **Ägare** (owner)
- **Förvaltare** (manager)
- **Driftansvarig** (operationsLead)

---

Denna dokumentation täcker de viktigaste API:erna och integrationerna. För mer detaljerad information, se inline-kommentarer i källkoden eller skapa ett issue för specifika frågor.