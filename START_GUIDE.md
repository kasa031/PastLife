# 🚀 PastLife - Start Guide

## 📱 Hva kan PastLife vise deg?

PastLife er en komplett webapplikasjon for å oppdage, organisere og dele informasjon om dine forfedre. Her er alt appen kan gjøre:

---

## 🎯 Hovedfunksjoner

### 1. **Søk og Oppdag** 🔍
- **Avansert søk** med flere filtre:
  - Navn, land, by, fødselsår
  - Tags (f.eks. "Oslo 1920", "morsside")
  - Beskrivelser og kommentarer
  - Relasjoner (søsken, foreldre, barn, ektefeller)
  - Lokasjonsradius (finn personer nær et sted)
- **Autocomplete** med smarte forslag
- **Søkehistorikk** og lagrede søk
- **Tastaturnavigasjon** (piltaster)

### 2. **Legg til Forfedre** 👤
- **Komplett skjema** med:
  - Navn, fødselsår, dødsår
  - Sted (land, by)
  - Beskrivelse
  - Tags for enkel søking
  - Hovedbilde
  - **Flere bilder** i galleri
  - Tagging av personer i bilder
- **Bulk-import** fra CSV/Excel
- **Import/Export** til JSON eller CSV

### 3. **Familietre** 🌳
- **AI-drevet bygging**:
  - Lim inn lang tekst (10,000+ ord)
  - AI ekstraherer automatisk familierelasjoner
  - Bygger komplett familietre
- **Interaktiv visualisering**:
  - Zoom og pan
  - Automatisk layout
  - Timeline-visning (årstall)
  - Relasjonsvisning
- **Eksport**:
  - PDF
  - PNG
  - JSON
- **Relasjonssøk**: Finn slektninger basert på familietre

### 4. **Profil og Innstillinger** ⚙️
- **Brukerprofil**:
  - Tilpass brukernavn
  - Bio
  - Profilbilde
- **Statistikk**:
  - Antall personer lagt til
  - Fødselsår-fordeling (graf)
  - Oversikt over bidrag
- **Datahåndtering**:
  - Backup og gjenoppretting
  - Eksport av all data
  - Import av data

### 5. **Kommentarer og Sosialt** 💬
- **Kommentarer** på personer:
  - @mentions
  - Klikkbare lenker
  - E-post lenker
  - Full tekstsøk i kommentarer
- **Del**:
  - Kopier lenke
  - Native share API
  - Del med andre

### 6. **Bilder og Galleri** 📸
- **Flere bilder** per person
- **Bildegalleri** med tagging
- **Hovedbilde** som vises i søkeresultater
- **Automatisk komprimering** for optimal lagring
- **Bildevalidering** (størrelse, format)

### 7. **Bulk-operasjoner** 📊
- **Bulk-import** fra CSV/Excel
- **Bulk-redigering**:
  - Tags
  - Land
  - By
- **Bulk-eksport**:
  - Valgte personer
  - Alle personer
  - JSON eller CSV

### 8. **PWA-funksjoner** 📱
- **Installerbar** på hjem-skjermen
- **Offline-støtte** - fungerer uten internett
- **App-lignende opplevelse** - standalone mode
- **Rask oppstart** - caching
- **Automatiske oppdateringer**

### 9. **Dark Mode** 🌙
- **Toggling** mellom lys og mørk modus
- **Lagres** i nettleseren
- **Automatisk** basert på systeminnstillinger

### 10. **Tilgjengelighet** ♿
- **Keyboard-navigasjon**
- **Screen reader-støtte**
- **ARIA-labels**
- **Skip-to-content** lenker

---

## 💻 Hvordan starte appen på PC (Windows)

### Metode 1: Lokal Server (Anbefalt for PWA)

**Støttede nettlesere:**
- ✅ Chrome
- ✅ Edge
- ✅ Brave (fungerer identisk med Chrome!)

#### Steg 1: Åpne Terminal/PowerShell
- **Windows**: Trykk `Win + X` → Velg "Windows PowerShell" eller "Terminal"
- **Mac**: Trykk `Cmd + Space` → Skriv "Terminal"
- **Linux**: Trykk `Ctrl + Alt + T`

#### Steg 2: Naviger til prosjektmappen
```bash
cd "C:\Users\Karina\Desktop\Egenlagde_programmer\PastLife"
```

#### Steg 3: Start lokal server

**Python 3:**
```bash
python -m http.server 8000
```

**Node.js (http-server):**
```bash
npx http-server -p 8000
```

**PHP:**
```bash
php -S localhost:8000
```

#### Steg 4: Åpne i nettleseren
1. Åpne Chrome, Edge eller Firefox
2. Gå til: `http://localhost:8000`
3. Appen lastes!

#### Steg 5: Installer appen (Valgfritt)

**Med Chrome/Edge:**
- Klikk på install-ikonet i adresselinjen
- Eller: Meny → "Install PastLife"
- Appen åpnes i eget vindu (standalone mode)

**Med Brave:**
- Klikk på install-ikonet i adresselinjen (samme som Chrome)
- Eller: Meny → "Install PastLife"
- Appen åpnes i eget vindu (standalone mode)
- **Brave støtter PWA-installasjon på samme måte som Chrome!**

---

### Metode 2: Direkte fra fil (Enklest, men begrenset)

1. **Finn filen**: `index.html` i prosjektmappen
2. **Dobbelklikk** på filen
3. Den åpnes i standard nettleser

**⚠️ Merk:** PWA-funksjoner fungerer ikke med `file://` protokoll. Bruk lokal server for full funksjonalitet.

---

## 📱 Hvordan starte appen på iPhone

### Metode 1: Fra samme nettverk (Anbefalt)

#### Steg 1: Start lokal server på PC
Følg "Metode 1" over for å starte server på PC.

#### Steg 2: Finn IP-adressen til PC-en

**Windows:**
```bash
ipconfig
```
Se etter "IPv4 Address" (f.eks. `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
Se etter IP-adressen under `en0` eller `eth0`

#### Steg 3: Åpne på iPhone
1. **Sørg for at iPhone er på samme WiFi** som PC-en
2. **Åpne Safari eller Brave** på iPhone
3. **Gå til**: `http://[DIN-IP]:8000`
   - F.eks.: `http://192.168.1.100:8000`

#### Steg 4: Installer appen på iPhone

**Med Safari:**
1. **Trykk Share-knappen** (📤) nederst i Safari
2. **Swipe opp** og velg "Legg til på hjem-skjerm"
3. **Bekreft navn** (eller endre det)
4. **Trykk "Legg til"**
5. **Appen vises på hjem-skjermen!**

**Med Brave:**
1. **Trykk på meny-knappen** (☰) nederst i Brave
2. **Velg "Share"** eller **"Del"**
3. **Scroll ned** og velg "Legg til på hjem-skjerm" eller "Add to Home Screen"
4. **Trykk "Legg til"** eller **"Add"**
5. **Appen vises på hjem-skjermen!**

**💡 Tips:** Hvis du ikke ser "Legg til på hjem-skjerm" i Brave, prøv å swipe opp i share-menyen for å se flere alternativer.

#### Steg 5: Åpne appen
- **Trykk på ikonet** på hjem-skjermen
- Appen åpnes i **standalone mode** (uten browser UI)

---

### Metode 2: Chrome DevTools Port Forwarding

#### Steg 1: Koble iPhone til PC
1. **Koble iPhone til PC** med USB-kabel
2. **Tillat datatilgang** på iPhone når det spørres

#### Steg 2: Åpne Chrome DevTools på PC
1. **Åpne Chrome** på PC
2. **Gå til**: `chrome://inspect/#devices`
3. **Aktiver "Port forwarding"**
4. **Legg til**: `8000` → `localhost:8000`

#### Steg 3: Åpne på iPhone
1. **Åpne Safari** på iPhone
2. **Gå til**: `http://localhost:8000`
3. **Følg Steg 4-5** fra Metode 1

---

### Metode 3: Deploy til nettet (Best for produksjon)

#### Deploy til GitHub Pages (Gratis og enkelt)

**Steg 1: Opprett GitHub Repository**
1. Gå til [GitHub](https://github.com) og logg inn
2. Klikk på "+" → "New repository"
3. Navn: `PastLife` (eller ditt valg)
4. Klikk "Create repository"

**Steg 2: Push koden til GitHub**
```bash
# I prosjektmappen
git add .
git commit -m "Initial commit: PastLife PWA"
git branch -M main
git remote add origin https://github.com/[DITT-BRUKERNAVN]/PastLife.git
git push -u origin main
```

**Steg 3: Aktiver GitHub Pages**
1. Gå til repository → **Settings**
2. Scroll til **Pages** i venstre meny
3. Under **Source**: Velg `main` branch, `/ (root)` folder
4. Klikk **Save**
5. Vent 1-2 minutter
6. Din app er nå tilgjengelig på:
   ```
   https://[DITT-BRUKERNAVN].github.io/PastLife/
   ```

**Steg 4: Åpne på iPhone**
1. **Åpne Safari eller Brave** på iPhone
2. **Gå til**: `https://[DITT-BRUKERNAVN].github.io/PastLife/`
3. **Følg Steg 4-5** fra Metode 1 for å installere

**Fordeler med GitHub Pages:**
- ✅ Gratis HTTPS (kreves for PWA)
- ✅ Automatisk oppdatering når du pusher
- ✅ Ingen server-konfigurasjon
- ✅ Fungerer perfekt med PWA

**Se `DEPLOYMENT.md` for detaljerte instruksjoner.**

---

## ✅ Verifiser at alt fungerer

### Quick Check
1. **Åpne appen** i nettleseren
2. **Sjekk konsollen** (F12 → Console) for feil
3. **Test hovedfunksjoner**:
   - [ ] Registrer/logg inn
   - [ ] Legg til en person
   - [ ] Søk etter personer
   - [ ] Se profil
   - [ ] Åpne familietre
   - [ ] Test dark mode
   - [ ] Test offline (aktiver flymodus)

### PWA Check
Kjør verifiseringsscript:
```bash
node verify-pwa.js
```

Alle komponenter skal være ✅ OK.

---

## 🎨 Hva ser du i appen?

### Hjem-siden (`index.html`)
- **Hero-seksjon** med søkeboks
- **Funksjoner** (Search, Share, Connect)
- **Nylig lagt til** personer
- **FAQ** med ofte stilte spørsmål

### Søk-siden (`search.html`)
- **Avansert søk** med filtre
- **Autocomplete** forslag
- **Søkeresultater** med bilder
- **Sortering** og filtrering

### Profil-siden (`profile.html`)
- **Brukerprofil** med innstillinger
- **Skjema** for å legge til forfedre
- **Statistikk** og oversikt
- **Import/Export** funksjoner
- **Bulk-operasjoner**

### Familietre-siden (`family-tree.html`)
- **AI-analyse** av tekst
- **Interaktivt familietre**
- **Timeline-visning**
- **Eksport** til PDF/PNG

### Person-siden (`person.html`)
- **Detaljert informasjon** om person
- **Bildegalleri**
- **Kommentarer**
- **Relasjoner** (slektninger)
- **Del-funksjon**

### Login-siden (`login.html`)
- **Registrering** av ny bruker
- **Innlogging** for eksisterende bruker
- **Sikker passordhåndtering**

---

## 🆘 Feilsøking

### Problem: "Service Worker ikke registrert"
**Løsning:** Bruk lokal server, ikke `file://` protokoll

### Problem: "Kan ikke installere på iPhone"
**Løsning:** 
- Må bruke Safari (ikke Chrome)
- Må være på HTTPS eller localhost
- Sjekk at `manifest.json` er tilgjengelig

### Problem: "Offline fungerer ikke"
**Løsning:**
- Installer appen først
- La appen laste fullstendig
- Aktiver flymodus
- Reload appen

### Problem: "Bilder vises ikke"
**Løsning:**
- Sjekk at bildene er lastet opp korrekt
- Sjekk konsollen for feil
- Prøv å laste opp bildet på nytt

---

## 📚 Flere Ressurser

- **PWA Status**: `PWA_STATUS.md`
- **Test Guide**: `PWA_TEST_GUIDE.md`
- **Lighthouse Test**: `LIGHTHOUSE_TEST.md`
- **Klar for Testing**: `PWA_KLAR_FOR_TESTING.md`

---

**Neste steg:** Start lokal server og utforsk appen! 🚀

