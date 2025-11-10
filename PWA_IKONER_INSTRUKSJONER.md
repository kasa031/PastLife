# 📱 Instruksjoner for å Opprette App-Ikoner

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

## Hvordan Opprette Ikonene

### ⚡ Metode 1: Automatisk Generering (Anbefalt!)

#### A) HTML-basert Generator (Enklest - Ingen installasjon)
1. Åpne `generate-icons.html` i nettleseren
2. Klikk "Last inn SVG" (eller vent på automatisk lasting av favicon.svg)
3. Klikk "Generer alle ikoner"
4. Klikk "Last ned alle (ZIP)"
5. Pakk ut ZIP-filen til `assets/icons/` mappen

**Fordeler:**
- Fungerer umiddelbart i alle moderne nettlesere
- Ingen installasjon nødvendig
- Visuell forhåndsvisning av alle ikoner
- Automatisk håndtering av maskable icons (safe zone)

#### B) Node.js Script (Raskest)
1. Installer dependencies: `npm install sharp`
2. Kjør: `node generate-icons.js`
3. Ikonene genereres automatisk i `assets/icons/`

**Fordeler:**
- Raskest metode
- Automatisk håndtering av alle størrelser
- Maskable icons får automatisk safe zone

### Metode 2: Bruk PastLifeLogo.jpg som Base
1. Åpne `assets/images/PastLifeLogo.jpg` i et bildebehandlingsprogram (Photoshop, GIMP, eller online verktøy)
2. Resize til hver størrelse (96x96, 144x144, 180x180, 192x192, 512x512)
3. Lagre som PNG med transparent bakgrunn (hvis mulig)
4. For maskable ikoner: Sørg for at logo er sentrert og har padding (safe zone)

### Metode 3: Bruk Online Verktøy
- **PWA Asset Generator**: https://github.com/onderceylan/pwa-asset-generator
- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **PWA Builder Image Generator**: https://www.pwabuilder.com/imageGenerator

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

## Testing

Etter at ikonene er opprettet:
1. Test at alle ikoner lastes riktig
2. Test installasjon på Android (Chrome)
3. Test installasjon på iOS (Safari)
4. Verifiser at ikoner vises korrekt i app-listen
5. Test splash screen (512x512 ikonet)

## Automatisk Generering ✅

**Ferdig implementert!** Se Metode 1 over for instruksjoner.

Alternativt med ImageMagick (hvis installert):
```bash
# Eksempel
convert favicon.svg -resize 192x192 assets/icons/icon-192x192.png
convert favicon.svg -resize 512x512 assets/icons/icon-512x512.png
```

## Notater

- Ikonene er allerede referert i `manifest.json`
- Alle HTML-filer har lenker til ikonene
- Service Worker cacher ikonene automatisk
- Ikonene vil vises når bruker installerer appen

---

## 🚀 Rask Start

**Enkleste metode:**
1. Åpne `generate-icons.html` i nettleseren
2. Følg instruksjonene på skjermen
3. Last ned ZIP og pakk ut til `assets/icons/`

**Status:** ✅ Genereringsverktøy klare!  
**Neste steg:** Bruk `generate-icons.html` eller `generate-icons.js` for å generere ikonene

