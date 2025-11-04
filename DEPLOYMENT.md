# Deployment Guide - PastLife til GitHub Pages

## Steg for Steg Instruksjoner

### 1. Opprett GitHub Repository

1. Gå til [GitHub](https://github.com) og logg inn
2. Klikk på "+" i øvre høyre hjørne → "New repository"
3. Fyll inn:
   - **Repository name**: `PastLife` (eller ditt valg)
   - **Description**: "AI-powered platform for discovering and sharing information about ancestors"
   - **Visibility**: Public (for GitHub Pages) eller Private
   - **Ikke** huk av for README, .gitignore, eller license (vi har allerede disse)
4. Klikk "Create repository"

### 2. Push Koden til GitHub

Åpne terminal/PowerShell i prosjektmappen og kjør:

```bash
# Sjekk status
git status

# Legg til alle filer
git add .

# Lag første commit
git commit -m "Initial commit: PastLife - AI-powered ancestor discovery platform"

# Legg til remote repository (erstatt kasa031 med ditt brukernavn og PastLife med repo-navn)
git remote add origin https://github.com/kasa031/PastLife.git

# Push til GitHub
git branch -M main
git push -u origin main
```

**Hvis du får feil om autentisering:**
- Du kan trenge å sette opp GitHub Personal Access Token
- Eller bruk GitHub Desktop appen for enklere workflow

### 3. Aktiver GitHub Pages

1. Gå til ditt repository på GitHub
2. Klikk på **Settings** (innstillinger)
3. I venstre meny, scroll ned til **Pages**
4. Under **Source**, velg:
   - Branch: `main`
   - Folder: `/ (root)`
5. Klikk **Save**
6. Vent 1-2 minutter, så vil siden være tilgjengelig på:
   ```
   https://kasa031.github.io/PastLife/
   ```

### 4. Oppdater Repository URL (hvis nødvendig)

Hvis repository-navnet er annerledes, oppdater URL i instruksjonene over.

## Fremtidige Oppdateringer

For å pushe nye endringer:

```bash
# Legg til endrede filer
git add .

# Commit med beskrivende melding
git commit -m "Beskrivelse av endringene"

# Push til GitHub
git push
```

GitHub Pages vil automatisk oppdatere siden etter noen minutter.

## Troubleshooting

### Siden vises ikke
- Sjekk at filen heter `index.html` (ikke `Index.html`)
- Vent 2-3 minutter for at GitHub skal bygge siden
- Sjekk Settings > Pages for feilmeldinger

### CORS Feil
- GitHub Pages støtter ES6 modules uten problemer
- Sjekk at alle filer er committed og pushet

### Bilder vises ikke
- Sjekk at bildene er i `assets/images/` mappen
- Sjekk at bildene er committed til git
- Bruk relative paths (f.eks. `assets/images/photo.jpg`)

## Tips

- **Custom Domain**: Du kan legge til eget domene i Settings > Pages
- **HTTPS**: Automatisk aktivert på GitHub Pages
- **Analytics**: Legg til Google Analytics hvis ønskelig
- **SEO**: Meta tags er allerede inkludert i HTML-filene

## Support

Hvis du har problemer:
1. Sjekk GitHub Actions for build-feil
2. Sjekk browser console for JavaScript-feil
3. Test lokalt først ved å åpne `index.html` i nettleseren
