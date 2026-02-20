# Användarguide för Service Gateway

Välkommen till Service Gateway! Detta är en komplett guide för hur du använder systemet för ärendehantering och processautomatisering.

## 🎯 Snabbstart

### Första inloggningen

1. Öppna Service Gateway i din webbläsare
2. Klicka på "Logga in"
3. Ange dina autentiseringsuppgifter
4. Du kommer till startsidan med en översikt

### Skapa ditt första ärende

1. Klicka på **"Skapa ärende"** på startsidan
2. Välj typ av ärende från tillgängliga flöden
3. Följ stegen i formuläret
4. Fyll i nödvändig information
5. Skicka in ärendet

## 👤 För Användare

### Startsidan

På startsidan ser du:
- **Snabbåtkomst**: Skapa ärende, Mina ärenden, Statistik
- **Senaste ärenden**: Dina senaste 4 ärenden
- **Välkomstmeddelande**: Personligt anpassat

### Skapa ett ärende

1. Gå till **"Skapa ärende"**
2. Välj önskad ärendetyp från listan
3. Följ det guidade formuläret:
   - **Steg 1**: Beskriv problemet
   - **Steg 2**: Ange detaljer och prioritet
   - **Steg 3**: Bekräfta och skicka

#### Formulärelement

- **Textfält**: Enkel textruta
- **Textarea**: Större textruta för längre beskrivningar
- **Select/Dropdown**: Välj från fördefinierade alternativ
- **Radio buttons**: Välj ett alternativ
- **Checkbox**: Markera flera alternativ
- **Datumväljare**: Välj datum
- **Filuppladdning**: Ladda upp dokument eller bilder

### Spåra dina ärenden

1. Gå till **"Mina ärenden"**
2. Se alla dina ärenden i en lista
3. Klicka på ett ärende för detaljer
4. Se status, kommentarer och historik

#### Ärendestatusar

- **Öppen**: Nytt ärende, väntar på behandling
- **Pågående**: Ärende behandlas aktivt
- **Löst**: Ärende är löst
- **Stängd**: Ärende är avslutat

### Uppdatera ett ärende

Vissa flöden tillåter att du uppdaterar information efter inskickning:
1. Öppna ärendet från "Mina ärenden"
2. Klicka på "Uppdatera" om tillgängligt
3. Fyll i ytterligare information
4. Spara ändringarna

## 🎨 För Redaktörer

### Öppna flödeseditorn

1. Logga in som redaktör eller administratör
2. Gå till **"Flöden"** i menyn
3. Se lista över befintliga flöden

### Skapa ett nytt flöde

1. Klicka på **"Nytt flöde"**
2. Fyll i grundinformation:
   - **Namn**: Beskrivande namn
   - **Beskrivning**: Vad flödet används till
   - **Kategori**: Gruppering av flöden
3. Klicka på **"Skapa"**

### Designa flödessteg

#### Lägg till ett steg

1. Öppna flödeseditorn
2. Klicka på **"+"** för att lägga till steg
3. Välj stegtyp:
   - **Frågor**: Samla in information
   - **Info**: Visa information
   - **Åtgärd**: Utför automation

#### Konfigurera frågor

För varje fråga ställer du in:

- **Etikett**: Frågetext
- **Typ**: Text, select, datum, etc.
- **Obligatorisk**: Krävs svar
- **Alternativ**: För select/radio frågor
- **Validering**: Regler för svar
- **Hjälptext**: Ytterligare förklaring

#### Lägg till övergångar

1. Välj ett steg
2. Gå till **"Övergångar"**-fliken
3. Klicka **"Lägg till övergång"**
4. Ställ in villkor (valfritt)
5. Välj nästa steg

##### Villkorstyper

- **Lika med**: Svar matchar specifikt värde
- **Innehåller**: Svar innehåller text
- **Finns**: Fält har värde
- **Har roll**: Användare har specifik roll
- **Och/Och inte**: Kombinera flera villkor

### Lägg till Actions

Actions automatiserar processer:

1. Välj ett steg
2. Gå till **"Actions"**-fliken
3. Välj **trigger**: Före steg, Efter steg, Vid ändring
4. Välj **typ**: Lookup, Automation, Validation, etc.
5. Konfigurera input och output

#### Action-exempel

**Lookup från CMDB**:
- Hämta användarinformation baserat på ID
- Fyll i formulär automatiskt

**Skapa supportärende**:
- Generera ärende i externt system
- Spara ärende-ID i flödet

### Testa flödet

1. Klicka på **"Testa flöde"** från flödeslistan
2. Gå igenom flödet som en användare
3. Verifiera att allt fungerar korrekt

### Publicera flödet

1. Öppna flödeseditorn
2. Klicka på **"Publicera"**
3. Flödet blir tillgängligt för användare

## 👑 För Administratörer

### Hantera användare och roller

1. Gå till **"Admin > Roller"**
2. Se lista över användare
3. Ändra roller:
   - **User**: Grundläggande åtkomst
   - **Manager**: Kan hantera vissa ärenden
   - **Editor**: Kan skapa och redigera flöden
   - **Admin**: Full åtkomst

### Övervaka systemet

#### Audit logs

1. Gå till **"Admin > Logs"**
2. Se alla användaråtgärder
3. Filtrera efter:
   - Användare
   - Åtgärdstyp
   - Datumintervall

#### Systemstatistik

1. Gå till **"Statistik"**
2. Se översikter över:
   - Totalt antal ärenden
   - Genomsnittlig lösningstid
   - Ärenden per kategori
   - Månatlig utveckling

### CMDB-hantering

1. Gå till **"Admin > CMDB"**
2. Hantera IT-tillgångar:
   - **Användare**: Organisationsanvändare
   - **Enheter**: Datorer, telefoner, etc.
   - **System**: Programvaror och tjänster
   - **Servrar**: Infrastruktur
   - **Databaser**: Datahantering
   - **API:er**: Systemintegrationer

#### Lägg till CMDB-data

1. Välj kategori (Användare, Enheter, etc.)
2. Klicka **"Lägg till"**
3. Fyll i information
4. Spara

### Integrationer

1. Gå till **"Admin > Inställningar"**
2. Konfigurera externa system:
   - POB G6-anslutning
   - E-postinställningar
   - API-nycklar

## 🔍 Avancerade Funktioner

### Använda CMDB i flöden

1. Skapa en fråga med typ "autocomplete" eller "select"
2. Välj **"Dynamiska alternativ"**
3. Välj CMDB-källa (användare, enheter, etc.)
4. Konfigurera filter och visning

### AI-stöd

Vissa flöden har AI-stöd för:
- **Intelligenta förslag**: Automatiska ifyllningar
- **Validering**: Kontrollera inmatad data
- **Kategorisering**: Föreslå rätt kategori

### Filuppladdningar

1. Välj filfråga i formulär
2. Klicka för att välja filer
3. Tillåtna format: PDF, DOC, XLS, JPG, PNG
4. Max storlek: 10MB per fil

### Kommentarer och kommunikation

1. Öppna ett ärende
2. Gå till **"Kommentarer"**-fliken
3. Lägg till kommentar
4. @-nämn användare för notiser

## ❓ Felsökning

### Vanliga problem

#### Kan inte logga in
- Kontrollera användarnamn/lösenord
- Kontakta administratör om kontot är låst

#### Flöde laddar inte
- Uppdatera sidan
- Rensa cache/cookies
- Kontakta support

#### Kan inte spara formulär
- Kontrollera obligatoriska fält
- Verifiera att alla valideringar passerar
- Kontrollera filstorlekar

#### Actions fungerar inte
- Kontrollera integrationer i admin-panelen
- Se integration logs för felmeddelanden
- Kontakta systemadministratör

### Support

För teknisk support:
1. Dokumentera problemet
2. Inkludera skärmdumpar
3. Ange webbläsare och enhet
4. Kontakta IT-support eller skapa ett supportärende

## ⌨️ Kortkommandon

- **Ctrl+S**: Spara flöde (i editor)
- **Ctrl+Z**: Ångra (i editor)
- **Esc**: Stäng dialog/modal
- **Enter**: Bekräfta och fortsätt (i formulär)

## 📱 Mobilanvändning

Systemet fungerar på mobila enheter:
- Responsiv design
- Touch-optimerade kontroller
- Offline-stöd för vissa funktioner (framtida)

## 🌐 Flerspråkighet

Systemet är för närvarande på svenska men stödjer:
- Svenska (primärt)
- Engelska (framtida)
- Anpassade översättningar (admin-konfigurerbar)

## 🔒 Säkerhet och Integritet

### Dina data
- All kommunikation krypteras (HTTPS)
- Data lagras säkert i Sverige/EU
- Endast behörig personal har åtkomst
- Automatisk radering efter retention policy

### Bästa praxis
- Använd starka lösenord
- Logga ut när du lämnar datorn
- Rapportera misstänkt aktivitet
- Uppdatera kontaktinformation

---

Denna guide uppdateras kontinuerligt. För de senaste ändringarna, se systemets release notes eller kontakta din administratör.