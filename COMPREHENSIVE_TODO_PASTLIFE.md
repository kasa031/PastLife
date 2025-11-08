# 📋 Omfattende TODO-liste for PastLife

## ✅ Fullført (fra denne sesjonen)

### Rebranding og Design
- [x] Endret alle F³/F3-referanser til 'PastLife' i alle HTML-filer
- [x] Integrert PastLifeLogo.jpg i navigasjonen på alle sider
- [x] Oppdatert fargepaletten til varmere, jordnære farger som passer bedre til bildene
- [x] Forbedret spacing og padding for mer luftig layout
- [x] Forbedret styling for kilder (klikkbare, bedre plassering, hover-effekter)

### Funksjonalitet
- [x] Forbedret bildehåndtering i familietreet - bilder lagres nå også på personens profil i hoveddatabasen
- [x] "Added by" viser allerede dato (var allerede implementert)
- [x] Oppdatert Om Meg-siden med mer bakgrunnsinformasjon og forbedret kontaktinfo

### Responsivt Design
- [x] Forbedret mobil layout (padding, spacing, grid-layout)
- [x] Lagt til tablet-styling (769px - 1024px)
- [x] Forbedret navigasjon på mobile enheter
- [x] Responsiv logo-størrelse på mobile/tablet

---

## 🔄 Pågående / Forbedringer

### Layout og Design
- [ ] Test og finjuster mobil-opplevelse på alle sider
- [ ] Test på tablets og forskjellige skjermstørrelser
- [x] Optimaliser bildestørrelser for raskere lasting (forbedret komprimering, bedre kvalitet)
- [x] Legg til loading-states for bedre UX (spinner, shimmer-effekt, progress-indikatorer)
- [ ] Forbedre animasjoner og overganger

### Bildehåndtering
- [ ] Støtte for flere bilder per person (galleri)
- [ ] Bildetagger (hvem er på bildet)
- [x] Bildkomprimering ved opplasting (forbedret med bedre algoritme, validering, logging)
- [ ] Konverter bilder til WebP format for bedre komprimering
- [x] Lazy loading for bilder (allerede delvis implementert)

### Familietre
- [ ] Forbedre automatisk layout (mindre overlapping)
- [ ] Eksport til PDF med bedre layout
- [ ] Eksport til PNG/SVG (høy oppløsning)
- [ ] Timeline-visning (tidslinje med fødselsår)
- [ ] Del familietre med andre (via link)
- [ ] Touch-gestures for bedre mobil-opplevelse (allerede delvis implementert)

### Søk og Filtrering
- [ ] Søk i relasjoner (f.eks. "finn alle søsken av X")
- [ ] Søk-suggestions basert på tidligere søk
- [ ] Fulltekst-søk i kommentarer
- [ ] Søk basert på plassering (radius-søk)
- [ ] Søk basert på tidsperiode (f.eks. "alle født mellom 1800-1900")
- [ ] Kombinert søk (navn + sted + år)

### Person-relasjoner
- [ ] Vis relasjons-graf (hvem er relatert til hvem)
- [ ] Beregn slektsforhold (f.eks. "2. kusine")
- [ ] Vis alle slektninger på én side
- [ ] "Slektninger" filter på person-siden

### Bulk-operasjoner
- [ ] Bulk-import fra CSV/Excel fil
- [ ] Bulk-edit (endre flere personer samtidig)
- [ ] Bulk-eksport med valg

### AI-forbedringer
- [ ] Stedsnavn-validering mot faktiske steder
- [ ] Flerspråklig støtte (norsk/engelsk)
- [ ] Batch-analyse (analyser flere tekster samtidig)
- [ ] Forbedret feilhåndtering ved AI-feil

### Notifikasjoner og Sosiale Funksjoner
- [ ] Notifikasjoner når noen favoriserer dine personer
- [ ] Notifikasjoner for nye personer med samme navn
- [ ] E-post-notifikasjoner (fremtidig backend-integrasjon)
- [ ] Forbedre kommentar-systemet

### Statistikk og Visualiseringer
- [ ] Grafer for fødselsår-fordeling
- [ ] Kart-visning av fødselssteder
- [ ] Generasjon-fordeling
- [ ] Aktivitet-overview (siste måned, år, etc.)
- [ ] Forbedre eksisterende statistikk-visning

### Eksport/Import Forbedringer
- [ ] Eksport til GEDCOM format (standard for slektsforskning)
- [ ] Import fra GEDCOM
- [ ] Eksport til Excel med alle detaljer
- [ ] Forbedre JSON-eksport/import

### Brukervennlighet
- [ ] Onboarding-tutorial for nye brukere
- [ ] FAQ-seksjon
- [ ] Video-tutorials
- [ ] Forbedre feilmeldinger og hjelpetekster
- [ ] Tooltips for alle knapper og funksjoner

### Tekniske Forbedringer
- [ ] Service Worker for offline-støtte
- [ ] Caching-strategi
- [ ] Performance-optimalisering (lazy load komponenter)
- [ ] Code splitting
- [ ] Error boundary/error handling
- [ ] Logging og analytics
- [ ] Test edge cases (tomme felter, spesialtegn)
- [ ] Test med store mengder data (1000+ personer)
- [ ] Test på langsomme nettverk

### Backend-integrasjon (Fremtidig)
- [ ] Server-side lagring (ikke bare localStorage)
- [ ] Multi-device sync
- [ ] Cloud backup
- [ ] Bruker-autentisering med OAuth
- [ ] API for tredjeparts-integrasjoner

### Avanserte Funksjoner
- [ ] DNA-integrasjon (f.eks. 23andMe, Ancestry)
- [ ] Integrasjon med andre slektsforsknings-verktøy
- [ ] Automatisk matching (finn lignende personer)
- [ ] Kollaborativ slektsforskning
- [ ] Versjonskontroll for endringer
- [ ] Historikk for endringer (hvem endret hva, når)

### Dokumentasjon
- [ ] Oppdater README med alle nye funksjoner
- [ ] Legg til screenshots i README
- [ ] Opprett brukerveiledning (video eller tekst)
- [ ] Dokumenter API (hvis backend legges til)
- [ ] CONTRIBUTING.md for åpne kilder

### Testing
- [ ] Test CORS-issues på GitHub Pages
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Test på forskjellige enheter (iPhone, Android, iPad)
- [ ] Performance testing
- [ ] Security testing

---

## 🎯 Prioriterte Oppgaver (Høy prioritet)

1. **Test og forbedre mobil-opplevelse** - Kritiskt for brukervennlighet
2. **Forbedre bildehåndtering** - Viktig funksjonalitet
3. **Optimaliser bildestørrelser** - Performance
4. **Forbedre familietre-layout** - Viktig visuell forbedring
5. **Legg til flere bilder per person** - Viktig funksjonalitet

---

## 📝 Notater

- Alle endringer skal testes på mobil, tablet og desktop
- Fargepaletten er nå varmere og jordnære for å matche bildene bedre
- Logo er integrert i navigasjonen på alle sider
- Bildehåndtering i familietreet oppdaterer nå også hoveddatabasen
- Layout er mer luftig med bedre spacing og padding

---

**Sist oppdatert:** 2025-01-XX
**Status:** Rebranding og grunnleggende forbedringer fullført ✅

