# 💻 PastLife på Windows med Brave - Komplett Guide

## 🎯 Oversikt

Brave-nettleseren på Windows støtter full PWA-installasjon på samme måte som Chrome, siden Brave er basert på Chromium. Du kan installere PastLife som en app på Windows med Brave!

---

## 🚀 Hvordan Installere

### Metode 1: Fra Lokal Server (Testing)

#### Steg 1: Start Lokal Server
1. Åpne PowerShell eller Terminal
2. Naviger til prosjektmappen:
   ```bash
   cd "C:\Users\Karina\Desktop\Egenlagde_programmer\PastLife"
   ```
3. Start server:
   ```bash
   python -m http.server 8000
   ```

#### Steg 2: Åpne i Brave
1. **Åpne Brave** på Windows
2. **Gå til**: `http://localhost:8000`

#### Steg 3: Installer Appen
1. **Install-ikonet** vises automatisk i adresselinjen (til høyre)
2. **Klikk på install-ikonet** (eller meny → "Install PastLife")
3. **Bekreft installasjon** i popup-vinduet
4. **Appen installeres** og vises i Windows Start-menyen!

#### Steg 4: Åpne Appen
- **Fra Start-menyen**: Søk etter "PastLife" og klikk
- **Fra desktop**: Hvis du har lagt til snarvei
- **Appen åpnes i eget vindu** (standalone mode, uten browser UI)

---

### Metode 2: Fra GitHub Pages (Produksjon)

#### Steg 1: Deploy til GitHub Pages
Følg instruksjonene i `DEPLOYMENT.md` for å deploye appen.

Din app vil være tilgjengelig på:
```
https://[DITT-BRUKERNAVN].github.io/PastLife/
```

#### Steg 2: Åpne i Brave
1. **Åpne Brave** på Windows
2. **Gå til**: `https://[DITT-BRUKERNAVN].github.io/PastLife/`

#### Steg 3: Installer Appen
1. **Install-ikonet** vises automatisk i adresselinjen
2. **Klikk på install-ikonet**
3. **Bekreft installasjon**
4. **Appen installeres** og vises i Start-menyen!

---

## ✅ Hva Skjer Når Du Installerer?

### Installasjon
- ✅ Appen legges til i Windows Start-menyen
- ✅ Du kan legge til snarvei på desktop (valgfritt)
- ✅ Appen får eget ikon
- ✅ Appen åpnes i standalone mode (uten browser UI)

### Standalone Mode
- ✅ Ingen adresselinje
- ✅ Ingen browser-meny
- ✅ App-lignende opplevelse
- ✅ Eget vindu som kan minimeres/maksimeres

### Offline-støtte
- ✅ Fungerer offline etter installasjon
- ✅ Automatisk caching av alle sider
- ✅ Offline-indikator vises når du er offline

---

## 🔧 Funksjoner

### Install Prompt
- **Automatisk deteksjon**: Brave detekterer automatisk at appen kan installeres
- **Install-ikon**: Vises i adresselinjen når appen er klar
- **Install-knapp**: Vises også som flytende knapp nederst til høyre (hvis ikke allerede installert)

### Update Manager
- **Automatiske oppdateringer**: Appen sjekker for oppdateringer automatisk
- **Notifikasjon**: Vises når ny versjon er tilgjengelig
- **"Oppdater nå" / "Senere"**: Du velger når du vil oppdatere

### Offline Queue
- **Tracking**: Sporer handlinger når du er offline
- **Automatisk sync**: Synkroniserer når du kommer online igjen
- **Notifikasjoner**: Vises når sync er fullført

---

## 📱 Sammenligning: Brave vs Chrome

| Funksjon | Brave | Chrome |
|----------|-------|--------|
| PWA-installasjon | ✅ Ja | ✅ Ja |
| Install-ikon i adresselinje | ✅ Ja | ✅ Ja |
| Standalone mode | ✅ Ja | ✅ Ja |
| Offline-støtte | ✅ Ja | ✅ Ja |
| Service Worker | ✅ Ja | ✅ Ja |
| Update manager | ✅ Ja | ✅ Ja |

**Konklusjon:** Brave fungerer identisk med Chrome for PWA-installasjon!

---

## 🆘 Feilsøking

### Problem: Install-ikonet vises ikke
**Løsninger:**
1. **Sjekk at du er på HTTPS** eller localhost
2. **Sjekk at manifest.json** er tilgjengelig
3. **Sjekk at Service Worker** er registrert
4. **Prøv å reload** siden
5. **Sjekk Brave DevTools** (F12) → Application → Manifest

### Problem: Appen installeres ikke
**Løsninger:**
1. **Sjekk at alle ikoner** finnes i `assets/icons/`
2. **Sjekk konsollen** (F12) for feilmeldinger
3. **Sjekk at Service Worker** fungerer
4. **Prøv Chrome** som alternativ for å teste

### Problem: Appen fungerer ikke offline
**Løsninger:**
1. **Installér appen først** (ikke bare åpne i browser)
2. **La appen laste fullstendig** før du går offline
3. **Sjekk Service Worker** i Brave DevTools → Application → Service Workers

---

## ✅ Verifiser Installasjon

### Sjekk at appen er installert:
1. **Søk etter "PastLife"** i Windows Start-menyen
2. **Åpne appen** - den skal åpnes uten browser UI
3. **Sjekk offline** - aktiver flymodus og test at appen fungerer

### Sjekk PWA-funksjoner:
1. **Service Worker**: Åpne Brave DevTools (F12) → Application → Service Workers
2. **Manifest**: Åpne Brave DevTools → Application → Manifest
3. **Cache**: Åpne Brave DevTools → Application → Cache Storage

---

## 📚 Flere Ressurser

- **START_GUIDE.md** - Generell start-guide
- **DEPLOYMENT.md** - Deploy-instruksjoner
- **PWA_TEST_GUIDE.md** - Test-guide
- **BRAVE_IPHONE_GUIDE.md** - Brave på iPhone

---

## 🎉 Ferdig!

Når appen er installert:
- ✅ Fungerer offline
- ✅ Rask oppstart (cached)
- ✅ App-lignende opplevelse
- ✅ Automatiske oppdateringer
- ✅ Vises i Windows Start-menyen

**Neste steg:** Installer appen og utforsk funksjonene! 🚀

