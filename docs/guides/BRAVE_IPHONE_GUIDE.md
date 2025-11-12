# 📱 PastLife på iPhone med Brave - Komplett Guide

## 🎯 Oversikt

Denne guiden viser deg hvordan du installerer og bruker PastLife på iPhone med Brave-nettleseren.

---

## 🚀 Metode 1: Fra Lokal Server (Testing)

### Steg 1: Start Server på PC
1. Åpne Terminal/PowerShell på PC
2. Naviger til prosjektmappen:
   ```bash
   cd "C:\Users\Karina\Desktop\Egenlagde_programmer\PastLife"
   ```
3. Start lokal server:
   ```bash
   python -m http.server 8000
   ```

### Steg 2: Finn IP-adressen
**Windows:**
```bash
ipconfig
```
Se etter "IPv4 Address" (f.eks. `192.168.1.100`)

### Steg 3: Åpne på iPhone
1. **Sørg for at iPhone er på samme WiFi** som PC-en
2. **Åpne Brave** på iPhone
3. **Gå til**: `http://[DIN-IP]:8000`
   - F.eks.: `http://192.168.1.100:8000`

### Steg 4: Installer på Hjem-skjermen
1. **Trykk på meny-knappen** (☰) nederst i Brave
2. **Velg "Share"** eller **"Del"**
3. **Scroll ned** i share-menyen
4. **Velg "Legg til på hjem-skjerm"** eller **"Add to Home Screen"**
5. **Bekreft navn** (eller endre det)
6. **Trykk "Legg til"** eller **"Add"**
7. **Appen vises på hjem-skjermen!** 🎉

**💡 Tips:** 
- Hvis du ikke ser "Legg til på hjem-skjerm", prøv å swipe opp i share-menyen
- Noen ganger må du scroll ned for å se alle alternativer

---

## 🌐 Metode 2: Deploy til GitHub Pages (Anbefalt)

### Steg 1: Deploy til GitHub Pages
Følg instruksjonene i `DEPLOYMENT.md` for å deploye appen.

Din app vil være tilgjengelig på:
```
https://[DITT-BRUKERNAVN].github.io/PastLife/
```

### Steg 2: Åpne på iPhone
1. **Åpne Brave** på iPhone
2. **Gå til**: `https://[DITT-BRUKERNAVN].github.io/PastLife/`
3. **Følg Steg 4** fra Metode 1 for å installere

**Fordeler:**
- ✅ Fungerer overalt (ikke bare på samme WiFi)
- ✅ HTTPS (kreves for PWA)
- ✅ Ingen server-konfigurasjon
- ✅ Automatisk oppdatering

---

## 📱 Hvordan Bruke Appen

### Åpne Appen
- **Trykk på ikonet** på hjem-skjermen
- Appen åpnes i **standalone mode** (uten browser UI)

### Funksjoner
- **Søk** etter forfedre
- **Legg til** nye forfedre
- **Familietre** med AI-bygging
- **Kommentarer** og deling
- **Offline-støtte** - fungerer uten internett

---

## 🔧 Feilsøking

### Problem: "Legg til på hjem-skjerm" vises ikke
**Løsninger:**
1. **Swipe opp** i share-menyen for å se flere alternativer
2. **Scroll ned** i share-menyen
3. **Sjekk at du er på HTTPS** (GitHub Pages har automatisk HTTPS)
4. **Prøv Safari** som alternativ (fungerer også)

### Problem: Appen fungerer ikke offline
**Løsninger:**
1. **Installér appen først** (ikke bare åpne i browser)
2. **La appen laste fullstendig** før du går offline
3. **Sjekk at Service Worker er aktiv** (Brave → Settings → Privacy → Site Settings)

### Problem: Ikonet vises ikke korrekt
**Løsninger:**
1. **Slett appen** fra hjem-skjermen
2. **Installer på nytt**
3. **Sjekk at alle ikoner er deployet** (se `assets/icons/`)

---

## ✅ Verifiser Installasjon

### Sjekk at appen er installert:
1. **Se etter ikonet** på hjem-skjermen
2. **Åpne appen** - den skal åpnes uten browser UI
3. **Sjekk offline** - aktiver flymodus og test at appen fungerer

### Sjekk PWA-funksjoner:
1. **Service Worker**: Åpne Brave DevTools → Application → Service Workers
2. **Manifest**: Åpne Brave DevTools → Application → Manifest
3. **Cache**: Åpne Brave DevTools → Application → Cache Storage

---

## 📚 Flere Ressurser

- **START_GUIDE.md** - Generell start-guide
- **DEPLOYMENT.md** - Deploy-instruksjoner
- **PWA_TEST_GUIDE.md** - Test-guide
- **LIGHTHOUSE_TEST.md** - Lighthouse audit

---

## 🎉 Ferdig!

Når appen er installert:
- ✅ Fungerer offline
- ✅ Rask oppstart (cached)
- ✅ App-lignende opplevelse
- ✅ Automatiske oppdateringer

**Neste steg:** Utforsk appen og legg til dine forfedre! 🚀

