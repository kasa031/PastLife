# Omfattende TODO-liste for PastLife Prosjektet

## 📊 Oversikt
Dette dokumentet inneholder en komplett gjennomgang av hele prosjektet med identifiserte problemer, mangler, forbedringer og utvidelsesmuligheter.

**Totalt antall oppgaver**: 50+
**Kategorier**: Sikkerhet, Refaktorering, Bugs, Funksjonalitet, UX, Ytelse, Testing, Tilgjengelighet, Dokumentasjon, Mobil, Offline, Analytics, Internasjonalisering

---

## 🔒 SIKKERHET (Høyest prioritet)

### Kritisk
1. **Passord-hashing** ⚠️ KRITISK
   - **Problem**: Passord lagres i klartekst i localStorage (auth.js linje 61)
   - **Løsning**: Implementer bcrypt eller Web Crypto API for passord-hashing
   - **Fil**: `js/auth.js`
   - **Status**: Ikke startet

2. **Hardkodet API-nøkkel** ⚠️ KRITISK
   - **Problem**: API-nøkkel hardkodet i family-tree.js linje 46
   - **Løsning**: Fjern hardkodet nøkkel, bruk miljøvariabel eller brukerinput
   - **Fil**: `js/family-tree.js`
   - **Status**: Ikke startet

3. **Input-validering og sanitization**
   - **Problem**: Mangler XSS-prevention på brukerinput
   - **Løsning**: Legg til validering og sanitization for alle input-felt
   - **Filer**: Alle filer med brukerinput
   - **Status**: Ikke startet

---

## 🔧 REFAKTORERING (Høy prioritet)

### Dupliserte funksjoner
4. **escapeHtml duplisert**
   - **Problem**: Funksjonen er definert i `search.js`, `utils.js`, og `person.js`
   - **Løsning**: Fjern duplikater, bruk kun `utils.js` versjonen
   - **Filer**: `js/search.js`, `js/person.js`
   - **Status**: Ikke startet

5. **toggleDarkMode og loadTheme duplisert**
   - **Problem**: Disse funksjonene er duplisert i 5+ filer (main.js, person.js, profile.js, login.js, family-tree.js, search.js)
   - **Løsning**: Opprett `js/theme.js` modul og importer fra alle steder
   - **Filer**: Alle filer med dark mode funksjonalitet
   - **Status**: Ikke startet

6. **Dupliserte sjekker i searchPersons**
   - **Problem**: Tags og description sjekkes to ganger i `data.js` (linje 228-235 og 257-269)
   - **Løsning**: Fjern duplikatene
   - **Fil**: `js/data.js`
   - **Status**: Ikke startet

7. **Duplikat-deteksjon**
   - **Problem**: Duplikat-deteksjon er kun i `profile.js`, bør være delt funksjonalitet
   - **Løsning**: Flytt til `data.js` som delt funksjon
   - **Filer**: `js/profile.js`, `js/data.js`
   - **Status**: Ikke startet

---

## 🐛 BUGS (Må fikses)

8. **Duplisert validering i searchPersons**
   - **Problem**: Tags og description valideres to ganger (linje 228-235 og 257-269)
   - **Fil**: `js/data.js`
   - **Status**: Ikke startet

9. **Performance-issue med getAllPersons()**
   - **Problem**: `getAllPersons()` kalles gjentatte ganger i `search.js` uten caching
   - **Løsning**: Implementer caching eller optimaliser kall
   - **Fil**: `js/search.js`
   - **Status**: Ikke startet

10. **Error handling i imageToBase64**
    - **Problem**: Kan feile stille hvis canvas ikke støttes
    - **Løsning**: Legg til bedre error handling og fallback
    - **Fil**: `js/data.js`
    - **Status**: Ikke startet

---

## ✨ NY FUNKSJONALITET

### Autentisering og brukerhåndtering
11. **Passord-reset**
    - **Beskrivelse**: La brukere resette passord via email
    - **Status**: Ikke startet

12. **Email-validering**
    - **Beskrivelse**: Valider email-format ved registrering
    - **Fil**: `js/login.js`
    - **Status**: Ikke startet

13. **Brukerprofil-redigering**
    - **Beskrivelse**: La brukere endre email og passord
    - **Fil**: `js/profile.js`
    - **Status**: Ikke startet

### Datahåndtering
14. **Batch-import av personer**
    - **Beskrivelse**: Last opp CSV/JSON fil med flere personer
    - **Status**: Ikke startet

15. **Avanserte søkefiltre**
    - **Beskrivelse**: AND/OR logikk, ekskluder termer, kombiner filtre
    - **Fil**: `js/search.js`
    - **Status**: Ikke startet

16. **GEDCOM eksport**
    - **Beskrivelse**: Eksporter familietre til GEDCOM-format
    - **Fil**: `js/family-tree.js`
    - **Status**: Ikke startet

17. **Deling mellom brukere**
    - **Beskrivelse**: Del personer og familietre med andre brukere
    - **Status**: Ikke startet

18. **Versjonskontroll**
    - **Beskrivelse**: Historikk over redigeringer av personer
    - **Status**: Ikke startet

19. **Notifikasjoner**
    - **Beskrivelse**: Real-time eller polling for nye kommentarer
    - **Status**: Ikke startet

20. **Geografisk kart**
    - **Beskrivelse**: Vis fødselssteder på kart
    - **Status**: Ikke startet

---

## 🎨 BRUKERVENNLIGHET (UX)

21. **Loading-indikatorer**
    - **Problem**: Mangler spinners på mange async operasjoner
    - **Løsning**: Legg til loading-indikatorer overalt
    - **Status**: Ikke startet

22. **Keyboard shortcuts-hjelp**
    - **Beskrivelse**: Trykk ? for å vise tilgjengelige shortcuts
    - **Status**: Ikke startet

23. **Undo/redo**
    - **Beskrivelse**: Angre/gjenta for person-redigeringer
    - **Status**: Ikke startet

24. **Konfirmasjonsdialoger**
    - **Problem**: Mangler bekreftelse for destruktive operasjoner
    - **Løsning**: Legg til "Er du sikker?" dialoger
    - **Status**: Ikke startet

25. **Forbedre error-meldinger**
    - **Problem**: Feilmeldinger kan være mer actionable
    - **Løsning**: Legg til suggestions og eksempler
    - **Status**: Ikke startet

26. **Tooltips**
    - **Problem**: Mangler tooltips på mange knapper
    - **Løsning**: Legg til tooltips på alle interaktive elementer
    - **Status**: Ikke startet

27. **Auto-save**
    - **Beskrivelse**: Lagre skjema-utkast automatisk
    - **Status**: Ikke startet

28. **Breadcrumb-navigasjon**
    - **Beskrivelse**: Bedre orientering på sider
    - **Status**: Ikke startet

---

## ⚡ YTELSE

29. **Optimaliser searchPersons**
    - **Problem**: Kan være treg med store datasett
    - **Løsning**: Indeksering eller caching
    - **Fil**: `js/data.js`
    - **Status**: Ikke startet

30. **Virtual scrolling**
    - **Beskrivelse**: For lange lister (personer, kommentarer)
    - **Status**: Ikke startet

31. **Bildekomprimering**
    - **Problem**: Bilder kan være for store
    - **Løsning**: Mer aggressiv komprimering eller WebP
    - **Fil**: `js/data.js`
    - **Status**: Ikke startet

32. **Debounce søk**
    - **Beskrivelse**: Reduser unødvendige søkekall
    - **Fil**: `js/search.js`
    - **Status**: Ikke startet

33. **Lazy load kommentarer**
    - **Beskrivelse**: Last kommentarer og relasjoner på etterspørsel
    - **Fil**: `js/person.js`
    - **Status**: Ikke startet

---

## 🧪 TESTING

34. **Unit tests**
    - **Beskrivelse**: Tests for kritiske funksjoner (auth, data, search)
    - **Status**: Ikke startet

35. **Integration tests**
    - **Beskrivelse**: Tests for brukerflyt (login, registrering, søk)
    - **Status**: Ikke startet

36. **E2E tests**
    - **Beskrivelse**: End-to-end tests for viktige scenarier
    - **Status**: Ikke startet

---

## ♿ TILGJENGELIGHET

37. **ARIA-labels**
    - **Beskrivelse**: Legg til på alle interaktive elementer
    - **Status**: Ikke startet

38. **Keyboard-navigasjon**
    - **Beskrivelse**: Sørg for full keyboard-støtte
    - **Status**: Ikke startet

39. **Skip-to-content**
    - **Beskrivelse**: Link for å hoppe til hovedinnhold
    - **Status**: Ikke startet

40. **Kontrast-ratios**
    - **Beskrivelse**: Forbedre for WCAG AA-kompatibilitet
    - **Status**: Ikke startet

41. **Screen reader support**
    - **Beskrivelse**: Støtte for komplekse komponenter
    - **Status**: Ikke startet

---

## 📚 DOKUMENTASJON

42. **JSDoc-kommentarer**
    - **Beskrivelse**: Dokumenter alle eksporterte funksjoner
    - **Status**: Ikke startet

43. **README oppdatering**
    - **Beskrivelse**: Setup-instruksjoner og arkitektur
    - **Status**: Ikke startet

44. **API-dokumentasjon**
    - **Beskrivelse**: Dokumenter alle moduler
    - **Status**: Ikke startet

---

## 📱 MOBIL

45. **Responsive design**
    - **Beskrivelse**: Test og forbedre på alle sider
    - **Status**: Ikke startet

46. **Touch-gestures**
    - **Beskrivelse**: Optimaliser for familietre (zoom, pan)
    - **Status**: Ikke startet

47. **Mobilmeny**
    - **Beskrivelse**: Bedre animasjoner
    - **Status**: Ikke startet

---

## 📴 OFFLINE

48. **Service worker caching**
    - **Beskrivelse**: Forbedre caching-strategi
    - **Fil**: `sw.js`
    - **Status**: Ikke startet

49. **Offline queue**
    - **Beskrivelse**: Sync endringer når online
    - **Status**: Ikke startet

50. **Offline-indikator**
    - **Beskrivelse**: Vis status i UI
    - **Status**: Ikke startet

---

## 📊 ANALYTICS

51. **Bruksstatistikk**
    - **Beskrivelse**: Anonymisert data for UX-forbedringer
    - **Status**: Ikke startet

52. **Feilsporing**
    - **Beskrivelse**: Spor feil og ytelsesproblemer
    - **Status**: Ikke startet

---

## 🌍 INTERNASJONALISERING

53. **Flerspråklig støtte**
    - **Beskrivelse**: i18n implementasjon
    - **Status**: Ikke startet

54. **Språkfiler**
    - **Beskrivelse**: Ekstraher alle tekster
    - **Status**: Ikke startet

---

## 📈 PRIORITERING

### Umiddelbart (Kritisk)
- Sikkerhet: Passord-hashing
- Sikkerhet: Fjern hardkodet API-nøkkel
- Bug: Dupliserte sjekker i searchPersons

### Kort sikt (1-2 uker)
- Refaktorering: Fjern dupliserte funksjoner
- UX: Loading-indikatorer og tooltips
- Bug: Performance-issues

### Mellomlang sikt (1 måned)
- Ny funksjonalitet: Passord-reset, email-validering
- UX: Undo/redo, auto-save
- Ytelse: Optimaliseringer

### Lang sikt (3+ måneder)
- Testing: Full test-suite
- Tilgjengelighet: WCAG compliance
- Internasjonalisering: Flerspråklig støtte

---

## 📝 NOTATER

- Alle funksjoner ser ut til å være implementert, men det er mye duplikasjon og manglende optimalisering
- Kodekvaliteten er generelt god, men trenger refaktorering
- Sikkerhet er den største bekymringen - passord i klartekst må fikses umiddelbart
- Prosjektet har god struktur, men trenger bedre dokumentasjon

---

**Sist oppdatert**: $(date)
**Totalt antall oppgaver**: 54

