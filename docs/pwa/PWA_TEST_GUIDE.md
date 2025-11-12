# 🧪 PastLife PWA - Test Guide

## Oversikt
Denne guiden hjelper deg med å teste alle PWA-funksjoner i PastLife-appen.

---

## 📋 Forhåndskrav

### Lokal Testing
- Lokal web server (ikke `file://` protokoll)
- HTTPS (eller localhost - fungerer uten HTTPS)
- Chrome/Edge/Firefox (for desktop testing)
- Chrome DevTools (for Lighthouse)

### Mobile Testing
- Android-enhet med Chrome
- iOS-enhet med Safari
- Eller bruk Chrome DevTools Device Emulation

---

## 1. 🔍 Lighthouse PWA Audit

### Steg 1: Start Lokal Server
```bash
# Python 3
python -m http.server 8000

# Eller Node.js (http-server)
npx http-server -p 8000

# Eller PHP
php -S localhost:8000
```

### Steg 2: Åpne i Chrome
1. Gå til `http://localhost:8000`
2. Åpne Chrome DevTools (F12)
3. Gå til "Lighthouse" fanen
4. Velg:
   - ✅ Progressive Web App
   - ✅ Desktop eller Mobile
5. Klikk "Analyze page load"

### Steg 3: Verifiser Resultater
**Mål:**
- ✅ PWA Score: 90+ poeng
- ✅ Installable: ✅
- ✅ Service Worker: ✅
- ✅ Offline support: ✅
- ✅ Fast and reliable: ✅

**Vanlige problemer:**
- ❌ "Does not provide a valid apple-touch-icon" → Sjekk at `icon-180x180.png` finnes
- ❌ "Manifest doesn't have a maskable icon" → Sjekk maskable icons
- ❌ "Does not register a service worker" → Sjekk at `sw.js` er registrert

### Steg 4: Fiks Eventuelle Problemer
Se `LIGHTHOUSE_FIXES.md` for løsninger.

---

## 2. 📱 Test Installasjon på Android

### Forberedelse
1. Start lokal server (se over)
2. Finn din lokale IP-adresse:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
3. Noter IP-adressen (f.eks. `192.168.1.100`)

### Testing
1. **Åpne på Android-enhet:**
   - Gå til `http://[DIN-IP]:8000` i Chrome
   - Eller bruk port forwarding i Chrome DevTools

2. **Verifiser Install Prompt:**
   - Install-knapp skal vises i header
   - Klikk "Installer app"
   - Eller bruk Chrome meny → "Install app"

3. **Test Installasjon:**
   - Appen installeres
   - Ikon vises på hjem-skjerm
   - App åpnes i standalone mode (ingen adresselinje)

4. **Verifiser Funksjonalitet:**
   - ✅ App åpnes i standalone mode
   - ✅ Ikon vises korrekt
   - ✅ Navigasjon fungerer
   - ✅ Offline-funksjonalitet fungerer

### Chrome DevTools Port Forwarding
1. Åpne Chrome DevTools
2. Gå til "More tools" → "Remote devices"
3. Aktiver "Port forwarding"
4. Legg til: `8000` → `localhost:8000`
5. Åpne Chrome på Android og gå til `localhost:8000`

---

## 3. 🍎 Test Installasjon på iOS

### Forberedelse
1. Start lokal server (se over)
2. Finn din lokale IP-adresse
3. Sørg for at iOS-enhet er på samme nettverk

### Testing
1. **Åpne i Safari på iOS:**
   - Gå til `http://[DIN-IP]:8000` i Safari
   - **Viktig:** Må være Safari, ikke Chrome

2. **Verifiser Install-instruksjoner:**
   - Install-instruksjoner skal vises
   - Visuell guide for "Add to Home Screen"

3. **Test "Add to Home Screen":**
   - Trykk del-knappen (boks med pil opp)
   - Velg "Add to Home Screen"
   - Bekreft navn og legg til

4. **Verifiser Funksjonalitet:**
   - ✅ App åpnes i standalone mode
   - ✅ Ingen adresselinje
   - ✅ Ikon vises korrekt
   - ✅ Status bar fungerer
   - ✅ Navigasjon fungerer

### iOS-spesifikke tester
- **Status bar:** Sjekk at status bar vises korrekt
- **Splash screen:** Sjekk at splash screen vises ved oppstart
- **Orientering:** Test både portrait og landscape

---

## 4. 💻 Test Installasjon på Desktop

### Chrome/Edge
1. Åpne appen i Chrome eller Edge
2. Install-knapp skal vises i adresselinjen
3. Klikk install-ikonet
4. Bekreft installasjon
5. Appen åpnes i eget vindu (standalone)

### Firefox
- Firefox støtter ikke PWA-installasjon ennå
- Test at appen fungerer normalt

### Verifiser
- ✅ App vises i app-listen
- ✅ Kan startes fra app-listen
- ✅ Åpnes i standalone vindu
- ✅ Ingen adresselinje (eller minimal)

---

## 5. 📴 Test Offline-funksjonalitet

### Forberedelse
1. Installer appen (Android/iOS/Desktop)
2. Åpne appen og la den laste fullstendig
3. Naviger gjennom flere sider

### Testing

#### Test 1: Grunnleggende Offline
1. **Aktiver flymodus** (eller deaktiver WiFi)
2. **Verifiser:**
   - ✅ Offline-indikator vises
   - ✅ Appen fungerer fortsatt
   - ✅ Navigasjon fungerer
   - ✅ Eksisterende data er tilgjengelig

#### Test 2: Offline Navigasjon
1. Gå offline
2. Test navigasjon:
   - ✅ Hjem-siden
   - ✅ Søk-siden
   - ✅ Profil-siden
   - ✅ Familie-tre
   - ✅ Person-detaljer

#### Test 3: Offline Data
1. Gå offline
2. Test data-operasjoner:
   - ✅ Søk etter personer (cached data)
   - ✅ Vis person-detaljer
   - ✅ Vis familie-tre
   - ✅ Vis profil

#### Test 4: Offline Queue
1. Gå offline
2. Utfør handlinger:
   - Legg til person
   - Oppdater person
   - Legg til kommentar
3. Gå online igjen
4. Verifiser:
   - ✅ Offline queue prosesserer
   - ✅ Sync-notifikasjon vises
   - ✅ Data er synkronisert

#### Test 5: Online/Offline Overganger
1. Gå offline → online → offline
2. Verifiser:
   - ✅ Offline-indikator vises/skjules korrekt
   - ✅ Appen fungerer ved overganger
   - ✅ Ingen data-tap

---

## 6. 🔄 Test App-oppdateringer

### Test 1: Automatisk Oppdatering
1. Installer appen
2. Endre `sw.js` (f.eks. endre CACHE_NAME)
3. Reload appen
4. Verifiser:
   - ✅ Oppdateringsnotifikasjon vises
   - ✅ "Oppdater nå" / "Senere" valg fungerer
   - ✅ Appen oppdateres korrekt

### Test 2: Update Manager
1. Endre Service Worker
2. Vent 1 time (eller endre sjekk-intervall)
3. Verifiser:
   - ✅ Automatisk sjekk for oppdateringer
   - ✅ Notifikasjon vises
   - ✅ Oppdatering fungerer

---

## 7. ⚡ Test Performance

### Chrome DevTools Performance
1. Åpne Chrome DevTools
2. Gå til "Performance" fanen
3. Start recording
4. Reload siden
5. Stop recording
6. Analyser:
   - ✅ First Contentful Paint < 1.5s
   - ✅ Time to Interactive < 3.5s
   - ✅ Total Blocking Time < 200ms

### Network Throttling
1. Åpne Chrome DevTools
2. Gå til "Network" fanen
3. Sett throttling til "Slow 3G"
4. Reload siden
5. Verifiser:
   - ✅ Appen laster fortsatt
   - ✅ Offline-fallback fungerer
   - ✅ Service Worker cacher riktig

---

## 8. 🎨 Test UI/UX

### Responsiv Design
1. Test på forskjellige skjermstørrelser:
   - Mobile (320px - 480px)
   - Tablet (768px - 1024px)
   - Desktop (1280px+)

2. Verifiser:
   - ✅ Layout tilpasser seg
   - ✅ Navigasjon fungerer
   - ✅ Tekst er lesbar
   - ✅ Knapper er klikkbare

### Dark Mode
1. Aktiver dark mode
2. Verifiser:
   - ✅ Tema endres korrekt
   - ✅ Alle sider har dark mode
   - ✅ Kontraster er gode
   - ✅ Ikoner er synlige

---

## 9. 🔐 Test Sikkerhet

### HTTPS
1. Deploy til HTTPS-server
2. Verifiser:
   - ✅ Service Worker fungerer
   - ✅ Install prompt fungerer
   - ✅ Ingen mixed content warnings

### Content Security Policy
1. Sjekk konsollen for CSP-feil
2. Verifiser:
   - ✅ Ingen CSP-violations
   - ✅ Alle ressurser laster

---

## 10. 📊 Test Checklist

### Pre-Deployment
- [ ] Lighthouse PWA score: 90+
- [ ] Installert på Android (Chrome)
- [ ] Installert på iOS (Safari)
- [ ] Installert på Desktop (Chrome/Edge)
- [ ] Offline-funksjonalitet testet
- [ ] App-oppdateringer testet
- [ ] Performance testet
- [ ] Responsiv design testet
- [ ] Dark mode testet
- [ ] Alle sider fungerer offline

### Post-Deployment
- [ ] HTTPS fungerer
- [ ] Service Worker registreres
- [ ] Install prompt vises
- [ ] Ikoner vises korrekt
- [ ] Splash screen fungerer
- [ ] Offline-indikator fungerer
- [ ] Update manager fungerer

---

## 🐛 Feilsøking

### Problem: Install-knapp vises ikke
**Løsning:**
- Sjekk at `manifest.json` er tilgjengelig
- Sjekk at alle ikoner finnes
- Sjekk at Service Worker er registrert
- Sjekk Chrome DevTools Console for feil

### Problem: Appen fungerer ikke offline
**Løsning:**
- Sjekk at Service Worker er aktiv
- Sjekk at filer er caches
- Sjekk Service Worker i Chrome DevTools → Application → Service Workers

### Problem: Ikoner vises ikke
**Løsning:**
- Verifiser at alle ikoner finnes i `assets/icons/`
- Sjekk at stier i `manifest.json` er korrekte
- Clear cache og reload

### Problem: Update manager fungerer ikke
**Løsning:**
- Sjekk at `update-manager.js` er inkludert
- Sjekk at Service Worker oppdateres
- Sjekk konsollen for feil

---

## 📝 Test-rapport Mal

```markdown
# PastLife PWA Test-rapport

**Dato:** [DATO]
**Tester:** [NAVN]
**Plattform:** [Android/iOS/Desktop]

## Lighthouse Score
- PWA: [SCORE]/100
- Performance: [SCORE]/100
- Accessibility: [SCORE]/100
- Best Practices: [SCORE]/100
- SEO: [SCORE]/100

## Installasjon
- [ ] Android: ✅/❌
- [ ] iOS: ✅/❌
- [ ] Desktop: ✅/❌

## Offline-funksjonalitet
- [ ] Grunnleggende offline: ✅/❌
- [ ] Offline navigasjon: ✅/❌
- [ ] Offline data: ✅/❌
- [ ] Offline queue: ✅/❌

## Funksjonalitet
- [ ] Navigasjon: ✅/❌
- [ ] Søk: ✅/❌
- [ ] Familie-tre: ✅/❌
- [ ] Profil: ✅/❌

## Problemer
[Liste over problemer funnet]

## Anbefalinger
[Liste over anbefalinger]
```

---

**Neste steg:** Start med Lighthouse audit, deretter test installasjon på faktiske enheter.

