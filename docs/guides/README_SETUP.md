# ⚠️ VIKTIG: Du MÅ starte en webserver!

## Problemet
Hvis du åpner HTML-filene direkte fra filsystemet (dobbeltklikk på filen), vil nettleseren **blokkere** JavaScript-modulene på grunn av CORS-policy. Dette betyr at:
- ❌ Login fungerer ikke
- ❌ AI-funksjoner fungerer ikke
- ❌ Alle JavaScript-funksjoner fungerer ikke

## Løsningen: Start en lokal webserver

### Metode 1: Python (anbefalt - enklest)
1. Åpne en terminal/PowerShell i `PastLife`-mappen
2. Kjør: `python -m http.server 8000`
3. Åpne nettleseren og gå til: `http://localhost:8000/login.html`
4. ✅ Nå fungerer alt!

### Metode 2: Node.js
```bash
npx http-server -p 8000
```

### Metode 3: VS Code Live Server
1. Installer "Live Server"-extension i VS Code
2. Høyreklikk på HTML-filen
3. Velg "Open with Live Server"

## ⚠️ HUSK:
- **ALDTID** åpne via `http://localhost:8000/` i stedet for `file:///`
- Hold terminalen åpen mens du tester
- Stopp serveren med Ctrl+C når du er ferdig

## Test at det fungerer
Når du åpner `http://localhost:8000/login.html`, skal du IKKE se CORS-feil i konsollen.

