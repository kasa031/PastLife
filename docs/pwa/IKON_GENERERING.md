# 🚀 PWA-Ikoner: Generering og Installasjon

## Oversikt
For at PastLife skal kunne installeres som en web app, trenger vi PNG-ikoner i flere størrelser. Disse må plasseres i `assets/icons/` mappen.

## Nødvendige Ikonstørrelser

### Standard Ikoner
- `icon-96x96.png` - 96x96 piksler
- `icon-144x144.png` - 144x144 piksler  
- `icon-180x180.png` - 180x180 piksler (iOS)
- `icon-192x192.png` - 192x192 piksler (Android minimum)
- `icon-512x512.png` - 512x512 piksler (Android splash screen)

### Maskable Ikoner (Android Adaptive Icons)
- `icon-maskable-192x192.png` - 192x192 piksler
- `icon-maskable-512x512.png` - 512x512 piksler

**Viktig:** Maskable ikoner må ha "safe zone" - viktig innhold skal være innenfor sentrale 80% av ikonet, da Android kan maskere dem i forskjellige former.

---

## ⚡ Rask Start (Anbefalt)

### Steg 1: Åpne Ikon-Generatoren
Åpne `scripts/generate-icons.html` i nettleseren (dobbelklikk på filen).

### Steg 2: Generer Ikoner
1. Filen laster automatisk `favicon.svg` hvis den finnes
2. Klikk **"🎨 Generer alle ikoner"**
3. Vent til alle ikoner er generert (ca. 1-2 sekunder)
4. Klikk **"⬇️ Last ned alle (ZIP)"**

### Steg 3: Installer Ikoner
1. Pakk ut ZIP-filen
2. Kopier alle PNG-filene fra `icons/` mappen
3. Lim dem inn i `assets/icons/` mappen i prosjektet

**Ferdig!** 🎉

---

## Alternativ: Node.js Script

Hvis du har Node.js installert:

```bash
# Installer sharp
npm install sharp

# Generer ikoner
node scripts/generate-icons.js
```

Ikonene genereres automatisk i `assets/icons/` mappen.

**Fordeler:**
- Raskest metode
- Automatisk håndtering av alle størrelser
- Maskable icons får automatisk safe zone

---

## Hva blir generert?

- ✅ `icon-96x96.png` - 96x96 piksler
- ✅ `icon-144x144.png` - 144x144 piksler  
- ✅ `icon-180x180.png` - 180x180 piksler (iOS)
- ✅ `icon-192x192.png` - 192x192 piksler (Android)
- ✅ `icon-512x512.png` - 512x512 piksler (Splash screen)
- ✅ `icon-maskable-192x192.png` - 192x192 (Android Adaptive)
- ✅ `icon-maskable-512x512.png` - 512x512 (Android Adaptive)

Alle ikoner genereres automatisk med riktig størrelse og safe zone for maskable icons.

---

## Andre Metoder

### Metode 2: Bruk PastLifeLogo.jpg som Base
1. Åpne `assets/images/PastLifeLogo.jpg` i et bildebehandlingsprogram (Photoshop, GIMP, eller online verktøy)
2. Resize til hver størrelse (96x96, 144x144, 180x180, 192x192, 512x512)
3. Lagre som PNG med transparent bakgrunn (hvis mulig)
4. For maskable ikoner: Sørg for at logo er sentrert og har padding (safe zone)

### Metode 3: Bruk Online Verktøy
- **PWA Asset Generator**: https://github.com/onderceylan/pwa-asset-generator
- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **PWA Builder Image Generator**: https://www.pwabuilder.com/imageGenerator

---

## Mappestruktur

Opprett denne mappestrukturen:
```
assets/
  icons/
    icon-96x96.png
    icon-144x144.png
    icon-180x180.png
    icon-192x192.png
    icon-512x512.png
    icon-maskable-192x192.png
    icon-maskable-512x512.png
```

---

## Design Guidelines

### Farger
- Bruk PastLife-farger: Turquoise (#00897b) og Orange (#FF8C00)
- Sørg for god kontrast mot bakgrunn

### Design
- Logo skal være tydelig og gjenkjennelig selv i liten størrelse
- Unngå for mye detaljer i små størrelser
- For maskable ikoner: Viktig innhold i sentrale 80%

### Format
- PNG med transparent bakgrunn (hvis mulig)
- Eller solid bakgrunnsfarge som matcher app-tema
- Høy kvalitet, ingen komprimering

---

## Testing

Etter at ikonene er opprettet:
1. Test at alle ikoner lastes riktig
2. Test installasjon på Android (Chrome)
3. Test installasjon på iOS (Safari)
4. Verifiser at ikoner vises korrekt i app-listen
5. Test splash screen (512x512 ikonet)

---

## Feilsøking

**Problem:** "favicon.svg ikke funnet"
- **Løsning:** Sørg for at `favicon.svg` ligger i prosjektets rotmappe

**Problem:** Ikoner ser utydelige ut
- **Løsning:** Dette er normalt - SVG skal skalere perfekt. Sjekk at favicon.svg har høy kvalitet.

**Problem:** Node.js script feiler
- **Løsning:** Sørg for at `sharp` er installert: `npm install sharp`
- Eller bruk HTML-generatoren i stedet (ingen installasjon nødvendig)

**Problem:** Ikoner vises ikke i app
- **Løsning:** Sjekk at alle filer ligger i `assets/icons/` og at stiene i `manifest.json` er korrekte

---

## Neste Steg

Etter at ikonene er generert:
1. ✅ Verifiser at alle filer ligger i `assets/icons/`
2. ✅ Test installasjon på Android/iOS
3. ✅ Kjør Lighthouse audit for PWA-score

---

## Notater

- Ikonene er allerede referert i `manifest.json`
- Alle HTML-filer har lenker til ikonene
- Service Worker cacher ikonene automatisk
- Ikonene vil vises når bruker installerer appen

---

**Status:** ✅ Genereringsverktøy klare!  
**Neste steg:** Bruk `scripts/generate-icons.html` eller `scripts/generate-icons.js` for å generere ikonene

