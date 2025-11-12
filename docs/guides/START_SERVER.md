# Start lokal webserver

## Problem
Hvis du åpner HTML-filene direkte fra filsystemet (file://), vil nettleseren blokkere ES6 moduler på grunn av CORS-policy.

## Løsning: Start en lokal webserver

### Metode 1: Python (anbefalt)
```bash
# I mappen PastLife, kjør:
python -m http.server 8000
```

Deretter åpne i nettleseren:
```
http://localhost:8000/family-tree.html
```

### Metode 2: Node.js (hvis du har Node.js installert)
```bash
npx http-server -p 8000
```

### Metode 3: VS Code Live Server
Hvis du bruker VS Code, installer "Live Server" extension og klikk "Go Live" i høyre hjørne.

## Stopp serveren
Trykk Ctrl+C i terminalen for å stoppe serveren.

