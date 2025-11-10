# 🚀 Rask Start: Generer PWA-Ikoner

## Enkleste Metode (Anbefalt)

### Steg 1: Åpne Ikon-Generatoren
Åpne `generate-icons.html` i nettleseren (dobbelklikk på filen).

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
node generate-icons.js
```

Ikonene genereres automatisk i `assets/icons/` mappen.

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

## Feilsøking

**Problem:** "favicon.svg ikke funnet"
- **Løsning:** Sørg for at `favicon.svg` ligger i prosjektets rotmappe

**Problem:** Ikoner ser utydelige ut
- **Løsning:** Dette er normalt - SVG skal skalere perfekt. Sjekk at favicon.svg har høy kvalitet.

**Problem:** Node.js script feiler
- **Løsning:** Sørg for at `sharp` er installert: `npm install sharp`
- Eller bruk HTML-generatoren i stedet (ingen installasjon nødvendig)

---

## Neste Steg

Etter at ikonene er generert:
1. ✅ Verifiser at alle filer ligger i `assets/icons/`
2. ✅ Test installasjon på Android/iOS
3. ✅ Kjør Lighthouse audit for PWA-score

