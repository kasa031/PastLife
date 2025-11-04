# F³ - Forbedringer og Utvidelser TODO Liste

## ✅ Ferdig implementert
- [x] Preload kritiske bilder (doors.jpg, etc.) - forhindrer FOUC
- [x] Forbedret hero-seksjon bilde-loading
- [x] View in Family Tree knapp på person-siden
- [x] Add to Family Tree knapp på person-siden
- [x] Søkehistorikk dropdown
- [x] Relaterte personer visning
- [x] Quick-add til familietre fra profil
- [x] Tooltips på alle knapper
- [x] Favoritter-system
- [x] Statistikk-dashboard
- [x] Duplikat-deteksjon
- [x] Dato-intervall søk
- [x] Farget favicon med familietre-symbol (turkis/oransje)
- [x] Keyboard shortcuts (Enter, Esc, Ctrl/Cmd+K, Ctrl/Cmd+/)
- [x] Forbedret feilmeldinger med detaljer og forslag
- [x] Validering av år og dato-intervaller

## 🔄 Høy prioritet - Performance & UX

### 1. Bildeloading og optimalisering
- [x] Implementer lazy loading for bilder som ikke er "above the fold" - implementert
- [x] Optimaliser bildestørrelser (resize før lagring) - implementert (maxWidth 800px, quality 0.7)
- [ ] Konverter bilder til WebP format for bedre komprimering
- [ ] Legg til skeleton loaders for bilder som lastes

### 2. Responsiv design
- [x] Optimaliser navigasjon for små skjermer (hamburger menu) - implementert
- [ ] Test og forbedre mobil-opplevelse på alle sider
- [ ] Forbedre touch-gestures for familietre (drag, zoom)
- [ ] Test på tablets og forskjellige skjermstørrelser

### 3. Søk og filtrering
- [x] Fuzzy search forbedringer (f.eks. "Edvard" finner "Edward") - implementert
- [x] Autocomplete/forslag mens bruker skriver - implementert
- [ ] Avansert søk med flere kriterier samtidig
- [ ] Søk i relasjoner (f.eks. "finn alle søsken av X")
- [ ] Søk-suggestions basert på tidligere søk

### 4. Feilmeldinger og validering
- [x] Mer detaljerte feilmeldinger med forslag til løsning - implementert
- [x] Bedre validering av input (f.eks. datoer, år) - implementert
- [x] Visuelle indikatorer for påkrevde felt - implementert (rød *)
- [x] Kontekstuelle hjelpetekster - implementert (help-text på form-felt)

## 🎨 Medium prioritet - Funksjonalitet

### 5. Keyboard shortcuts
- [x] Enter for å søke (implementert)
- [x] Esc for å lukke modaler/dropdowns (implementert)
- [x] Ctrl/Cmd + K for quick search (implementert på index)
- [x] Ctrl/Cmd + / for å fokusere søkefelt (implementert på search)
- [x] Piltaster for navigasjon i søkeresultater - implementert (↑↓ for navigasjon, Enter for å velge)

### 6. Bulk-operasjoner
- [x] Bulk-import fra JSON - implementert
- [x] Bulk-export (eksporter flere personer) - implementert (checkbox-select)
- [ ] Bulk-import fra CSV/Excel fil
- [ ] Bulk-edit (endre flere personer samtidig)

### 7. Familietre-forbedringer
- [x] Print-variant av familietre - implementert (print-funksjon)
- [ ] Eksport til PDF med bedre layout
- [ ] Eksport til PNG/SVG (høy oppløsning)
- [ ] Timeline-visning (tidslinje med fødselsår)
- [ ] Del familietre med andre (via link)
- [ ] Automatisk layout-forbedringer (mindre overlapping)

### 8. AI-forbedringer
- [x] Forbedret dato-validering (f.eks. "født 1500" ikke "dødd 1499") - implementert i AI prompt og post-validering
- [x] Relasjons-validering (f.eks. "far" kan ikke være yngre enn "barn") - implementert (validerer alder i parent-child relasjoner)
- [x] Post-validering av AI-ekstraherte data - implementert (dato-validering, alder-validering, sted-rensing)
- [ ] Stedsnavn-validering mot faktiske steder
- [ ] Flerspråklig støtte (norsk/engelsk)
- [ ] Batch-analyse (analyser flere tekster samtidig)

### 9. Notifikasjoner og sosiale funksjoner
- [x] Notifikasjoner for nye kommentarer på dine personer - implementert (badge på profil-link)
- [ ] Notifikasjoner når noen favoriserer dine personer
- [ ] Notifikasjoner for nye personer med samme navn
- [ ] E-post-notifikasjoner (fremtidig backend-integrasjon)

### 10. Statistikk og visualiseringer
- [x] Statistikk over antall personer per land/by - implementert (antall land/byer vises)
- [x] Forbedret statistikk-dashboard - implementert (totalt, med bilder, morsside/farsside, år-område, land/by)
- [x] My Favorites visning - implementert (viser favoritter på profil)
- [ ] Grafer for fødselsår-fordeling
- [ ] Kart-visning av fødselssteder
- [ ] Generasjon-fordeling
- [ ] Aktivitet-overview (siste måned, år, etc.)

## 🚀 Lav prioritet - Nice to have

### 11. Dark mode
- [ ] Dark mode toggle
- [ ] Automatisk dark mode basert på system-innstillinger
- [ ] Lagre brukerpreferanse

### 12. Eksport/import forbedringer
- [ ] Eksport til GEDCOM format (standard for slektsforskning)
- [ ] Import fra GEDCOM
- [ ] Eksport til Excel med alle detaljer
- [ ] Backup/restore funksjonalitet

### 13. Søk i tekst
- [ ] Fulltekst-søk i beskrivelser
- [ ] Søk i kommentarer
- [ ] Søk i tags (fuzzy)

### 14. Person-relasjoner
- [ ] Vis relasjons-graf (hvem er relatert til hvem)
- [ ] Beregn slektsforhold (f.eks. "2. kusine")
- [ ] Vis alle slektninger på én side
- [ ] "Slektninger" filter på person-siden

### 15. Bilder og media
- [ ] Støtte for flere bilder per person
- [ ] Bildgalleri
- [ ] Støtte for video (fremtidig)
- [ ] Bildetagger (hvem er på bildet)

### 16. Søk-algoritmer
- [ ] Søk basert på likhet (f.eks. "Edvard Jensen" finner "Edward Jensen")
- [ ] Søk basert på plassering (radius-søk)
- [ ] Søk basert på tidsperiode (f.eks. "alle født mellom 1800-1900")
- [ ] Kombinert søk (navn + sted + år)

### 17. Brukervennlighet
- [ ] Onboarding-tutorial for nye brukere
- [ ] Tooltips med eksempler
- [ ] Contextual help
- [ ] FAQ-seksjon
- [ ] Video-tutorials

### 18. Tekniske forbedringer
- [ ] Service Worker for offline-støtte
- [ ] Caching-strategi
- [ ] Performance-optimalisering (lazy load komponenter)
- [ ] Code splitting
- [ ] Error boundary/error handling
- [ ] Logging og analytics

## 📋 Framtidige utvidelser (krever backend)

### 19. Backend-integrasjon
- [ ] Server-side lagring (ikke bare localStorage)
- [ ] Multi-device sync
- [ ] Cloud backup
- [ ] Bruker-autentisering med OAuth
- [ ] API for tredjeparts-integrasjoner

### 20. Avanserte funksjoner
- [ ] DNA-integrasjon (f.eks. 23andMe, Ancestry)
- [ ] Integrasjon med andre slektsforsknings-verktøy
- [ ] Automatisk matching (finn lignende personer)
- [ ] Kollaborativ slektsforskning
- [ ] Versjonskontroll for endringer
- [ ] Historikk for endringer (hvem endret hva, når)

## 🐛 Bugs å fikse
- [x] Sjekk alle formateringsfeil i datoer - implementert (post-validering av AI-data, klient-side validering)
- [ ] Test edge cases (tomme felter, spesialtegn)
- [ ] Test med store mengder data (1000+ personer)
- [ ] Test på langsomme nettverk
- [ ] Test CORS-issues på GitHub Pages

## 📝 Dokumentasjon
- [ ] Oppdater README med alle nye funksjoner
- [ ] Legg til screenshots i README
- [ ] Opprett brukerveiledning (video eller tekst)
- [ ] Dokumenter API (hvis backend legges til)
- [ ] CONTRIBUTING.md for åpne kilder

---

**Status oppdatert:** 2025-01-XX
**Neste review:** Etter implementering av høy-prioritets oppgaver

