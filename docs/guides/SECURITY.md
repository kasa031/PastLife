# 🔒 Sikkerhetsguide

## ⚠️ VIKTIG: Aldri Committ Sensitiv Informasjon

### Hva som IKKE skal committes:
- ✅ API-nøkler (OpenRouter, OpenAI, etc.)
- ✅ Passord eller tokens
- ✅ Private konfigurasjonsfiler med secrets
- ✅ Personlig identifiserbar informasjon (PII)
- ✅ Kredittkortnummer eller finansielle data

### Hva som ER trygt å committe:
- ✅ Kode og funksjonalitet
- ✅ Dokumentasjon (uten nøkler)
- ✅ Konfigurasjonsfiler uten sensitive verdier
- ✅ HTML, CSS, og generelle JavaScript-filer

## Hvordan vi håndterer API-nøkler i dette prosjektet

1. **API-nøkler lagres kun i localStorage** (klient-side)
2. **Ingen hardkodede nøkler i kildekoden** som skal committes
3. **Brukere må legge inn sin egen nøkkel** via UI
4. **Nøkler initialiseres kun første gang** og lagres deretter i localStorage

## Sjekkliste før commit

Før du committer endringer, sjekk:

```bash
# Sjekk at du ikke har nøkler i filene
git diff | grep -i "sk-or-"
git diff | grep -i "api.*key"
git diff | grep -i "password"
git diff | grep -i "secret"
```

Hvis noen av disse finner treff, **IKKE COMMIT** før du har fjernet dem!

## Hvis du har committet sensitiv informasjon ved uhell

1. **Fjern nøkkelen umiddelbart** fra koden
2. **Revoker/generer ny nøkkel** fra tjenesten (f.eks. OpenRouter)
3. **Vurder å rydde git-historikken**:
   ```bash
   # Dette er avansert - vurder hjelp hvis du er usikker
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch FILENAME" \
     --prune-empty --tag-name-filter cat -- --all
   ```
4. **Push endringene** og informer eventuelle samarbeidspartnere

## Best Practices

- ✅ Bruk localStorage for klient-side nøkler
- ✅ Bruk environment variables (.env) for server-side (hvis backend legges til)
- ✅ Legg aldri nøkler direkte i kildekode
- ✅ Sjekk alltid `git diff` før commit
- ✅ Bruk `.gitignore` for å ekskludere sensitive filer

## Hjelp

Hvis du er usikker på om noe er trygt å committe, **spør først**! Det er bedre å være forsiktig enn å måtte rydde opp etterpå.

