# Konkrete Kodeforbedringer for PastLife

## 🚀 Høy Prioritet - Rask Implementering

### 1. **Duplikat-deteksjon ved søk**
**Problem**: Brukere kan legge inn samme person flere ganger
**Løsning**: 
- Sjekk for lignende navn + fødselsår ved lagring
- Vis varsel: "En lignende person finnes allerede: [Navn]"
- Foreslå å merge personer

**Kode-sted**: `js/profile.js` - `submitForm()` funksjonen

### 2. **Favoritter/Bookmarking**
**Problem**: Ingen måte å lagre interessante personer
**Løsning**:
- "Add to Favorites" knapp på person-siden
- Favoritt-liste på profil-siden
- Lokal lagring per bruker

**Kode-sted**: `js/person.js` + ny `js/favorites.js`

### 3. **Søkehistorikk**
**Problem**: Må søke på nytt hver gang
**Løsning**:
- Lagre siste 10 søk
- Klikk for å gjenta søk
- Clear history-knapp

**Kode-sted**: `js/search.js`

### 4. **Forbedret Dato-søk (Dato-intervall)**
**Problem**: Kan bare søke på ett år
**Løsning**:
- "Fra år" og "Til år" felt
- Søk i dato-intervaller
- "Født mellom X og Y"

**Kode-sted**: `search.html` + `js/search.js`

### 5. **Statistikk Dashboard**
**Problem**: Ingen oversikt over egen aktivitet
**Løsning**:
- Ny "Statistics" side
- Vis: antall personer lagt til, kommentarer, tags
- Graf over aktivitet over tid
- Mest brukte tags

**Kode-sted**: Ny `statistics.html` + `js/statistics.js`

## 💡 Medium Prioritet - Viktig Funksjonalitet

### 6. **Dark Mode**
**Problem**: Ingen dark mode
**Løsning**:
- Toggle-knapp i navigasjon
- Lagre preferanse i localStorage
- CSS variabler for farger

**Kode-sted**: `css/style.css` + `js/utils.js`

### 7. **Forbedret Familietre - Zoom og Pan**
**Problem**: Treet blir for stort for å se hele
**Løsning**:
- Zoom in/out (mouse wheel + buttons)
- Pan (drag bakgrunn)
- "Fit to screen" knapp
- Minimap for navigasjon

**Kode-sted**: `js/family-tree.js` + `css/family-tree.css`

### 8. **Print/Export Familietre til PDF/PNG**
**Problem**: Kan ikke printe eller eksportere treet
**Løsning**:
- Print-knapp som genererer PDF
- Export til PNG bilde
- Bruk html2canvas eller jsPDF

**Kode-sted**: `js/family-tree.js` (ny funksjon)

### 9. **Avanserte Søkefiltre**
**Problem**: Begrenset søkefunksjonalitet
**Løsning**:
- "Med bilder kun" filter
- "Med kommentarer" filter
- "Lagt til av meg" filter
- "Sorter etter kommentarer" filter

**Kode-sted**: `search.html` + `js/search.js`

### 10. **Bulk-import fra CSV/Excel**
**Problem**: Må legge inn en og en person
**Løsning**:
- CSV import funksjonalitet
- Template for CSV-format
- Validering og feilmeldinger
- Preview før import

**Kode-sted**: Ny `js/import-csv.js` + `profile.html`

## 🔧 Tekniske Forbedringer

### 11. **Passord-hashing (Simpel)**
**Problem**: Passord lagres i klartekst
**Løsning**:
- Bruk enkel hash (bCrypt eller SHA-256)
- Ikke perfekt sikkerhet, men bedre enn nå
- Backwards compatible med eksisterende brukere

**Kode-sted**: `js/auth.js`

### 12. **LocalStorage Quota Warning**
**Problem**: Ingen varsel når storage er full
**Løsning**:
- Sjekk localStorage størrelse
- Varsle når nærme grensen (80%)
- Foreslå å eksportere/slette gamle data

**Kode-sted**: Ny funksjon i `js/data.js`

### 13. **Error Boundary og Bedre Feilhåndtering**
**Problem**: Feil kan krasje hele appen
**Løsning**:
- Try-catch rundt kritiske operasjoner
- Global error handler
- User-friendly feilmeldinger

**Kode-sted**: Alle JS-filer, spesielt `js/utils.js`

### 14. **Lazy Loading av Bilder**
**Problem**: Alle bilder lastes på en gang
**Løsning**:
- Intersection Observer API
- Lazy load bilder når de er synlige
- Bedre ytelse

**Kode-sted**: `js/main.js`, `js/search.js`, etc.

### 15. **Data Validation**
**Problem**: Ingen validering av input
**Løsning**:
- Valider fødselsår (må være realistisk)
- Valider e-post format
- Sanitize HTML input
- Makslengde på tekstfelt

**Kode-sted**: `js/profile.js`, `js/login.js`

## 🎨 UX Forbedringer

### 16. **Loading Skeleton Screens**
**Problem**: Tomme områder mens data lastes
**Løsning**:
- Skeleton loaders i stedet for spinners
- Bedre visuell feedback

**Kode-sted**: `css/style.css` + alle JS-filer

### 17. **Undo/Redo Funksjonalitet**
**Problem**: Ingen måte å angre operasjoner
**Løsning**:
- Lagre siste handlinger
- Undo-knapp i toolbar
- Max 10 handlinger

**Kode-sted**: Ny `js/history.js`

### 18. **Keyboard Shortcuts**
**Problem**: Må bruke mus for alt
**Løsning**:
- `/` for søk
- `Ctrl+K` for quick search
- `Escape` for å lukke modaler
- `Enter` for å submit forms

**Kode-sted**: Ny `js/shortcuts.js`

### 19. **Toast Notifications (Bedre)**
**Problem**: Nåværende meldinger er enkle
**Løsning**:
- Stilige toast-notifikasjoner
- Auto-dismiss med progress bar
- Stakk for flere meldinger
- Action buttons i toast

**Kode-sted**: `js/utils.js` - forbedre `showMessage()`

### 20. **Confirmation Dialogs (Bedre)**
**Problem**: Bruker `confirm()` som er stygt
**Løsning**:
- Custom modal dialogs
- Stilige bekreftelsesbokser
- Animerte transitions

**Kode-sted**: Ny `js/modals.js`

## 📊 Data og Analyse

### 21. **Activity Feed**
**Problem**: Ingen oversikt over nye aktiviteter
**Løsning**:
- Feed med nye personer, kommentarer
- Sorter etter dato
- Filter på type aktivitet

**Kode-sted**: Ny `activity.html` + `js/activity.js`

### 22. **Tag Cloud**
**Problem**: Vanskelig å se mest brukte tags
**Løsning**:
- Tag cloud visualisering
- Klikk for å søke på tag
- Størrelse basert på bruk

**Kode-sted**: Ny komponent, legg til i `index.html` eller profil

### 23. **Geografisk Kart**
**Problem**: Ingen visuell oversikt over steder
**Løsning**:
- Integrer Leaflet.js eller Google Maps
- Vis personer på kart
- Filter på land/region

**Kode-sted**: Ny `map.html` + `js/map.js`

## 🌳 Familietre Spesifikke

### 24. **Automatisk Layout Algoritmer**
**Problem**: Treet må organiseres manuelt
**Løsning**:
- Hierarkisk layout (foreldre over, barn under)
- Force-directed layout
- Timeline layout
- "Auto-organize" knapp

**Kode-sted**: `js/family-tree.js` - forbedre `layoutTree()`

### 25. **Relasjon Editor**
**Problem**: Kan ikke redigere relasjoner i treet
**Løsning**:
- Klikk på linje for å redigere relasjon
- Legg til nye relasjoner
- Slett relasjoner
- Vis relasjon-type i tooltip

**Kode-sted**: `js/family-tree.js`

### 26. **Eksport til GEDCOM Format**
**Problem**: Kan ikke importere til andre slektsprogrammer
**Løsning**:
- GEDCOM export funksjonalitet
- Standard format for slektsforskning
- Kompatibel med MyHeritage, Ancestry, etc.

**Kode-sted**: Ny `js/gedcom-export.js`

## 🔐 Sikkerhet og Privatliv

### 27. **Private Personer**
**Problem**: Alle personer er offentlige
**Løsning**:
- "Private" checkbox ved opprettelse
- Private personer vises kun for eier
- Ikke søkbare for andre

**Kode-sted**: `js/data.js` + `js/profile.js` + `js/search.js`

### 28. **Data Backup til Cloud**
**Problem**: Data kan mistes hvis browser-data slettes
**Løsning**:
- Eksport til Google Drive
- Eksport til Dropbox
- Automatisk backup (valgfritt)

**Kode-sted**: Ny `js/backup.js`

## 🎯 Quick Wins (Raskt å Implementere)

### 29. **"Copy Person as JSON"**
- Knapp på person-siden
- Kopier person-data som JSON
- Nyttig for debugging og deling

### 30. **Pagination for Søkeresultater**
- Maks 50 per side
- Next/Previous knapper
- Viser "X-Y av Z resultater"

### 31. **Quick Add Form**
- Modal for raskt å legge til person
- Kun navn og fødselsår
- Fyll ut resten senere

### 32. **Bulk Tag Editor**
- Velg flere personer
- Legg til/slett tags i bulk
- Tidsbesparende

### 33. **Person Comparison**
- Sammenlign to personer side-ved-side
- Vis forskjeller
- Hjelper med å finne duplikater

---

## 📝 Prioritering

**Start med disse (høyest verdi/lavest innsats):**
1. Favoritter/Bookmarking
2. Søkehistorikk  
3. Duplikat-deteksjon
4. Dark Mode
5. Dato-intervall søk
6. Statistikk Dashboard
7. Print/Export familietre
8. Forbedret familietre zoom/pan

**Implementer etterhvert:**
- Bulk-import CSV
- Geografisk kart
- GEDCOM export
- Activity feed
- Private personer

**Tekniske forbedringer (kontinuerlig):**
- Error handling
- Data validation
- Performance optimalisering
- Security improvements

