# 📖 Guide: Bruk AI til å Bygge Familietre fra Tekst

## Steg 1: Få OpenRouter API-nøkkel (Gratis)

### Hvordan får du API-nøkkel:

1. **Gå til OpenRouter**: https://openrouter.ai/
2. **Klikk på "Sign In"** (øverst til høyre)
   - Logg inn med Google, GitHub, eller e-post
3. **Gå til API Keys**: https://openrouter.ai/keys
4. **Klikk "Create Key"**
5. **Kopier nøkkelen** (starter med `sk-or-...`)
   - **Viktig**: Lagre denne et trygt sted! Du kan ikke se den igjen.

### Gratis vs Betalt:
- **Gratis tier**: Du får $5 gratis kreditt ved opprettelse
- **Lav kostnad**: GPT-4o-mini koster ca. $0.15 per 1M tokens (veldig billig)
- **Typisk bruk**: 10,000 ord tekst koster ca. $0.01-0.02

## Steg 2: Logg inn på PastLife

1. Åpne nettsiden (lokalt eller på GitHub Pages)
2. Klikk på **"Login"** i navigasjonen
3. Hvis du ikke har bruker, klikk **"Register here"** og opprett en bruker
4. Logg inn med brukernavn og passord

## Steg 3: Gå til Family Tree Builder

1. Klikk på **"Family Tree"** i navigasjonsmenyen
2. Du vil nå se "AI-Powered Family Tree Builder" siden

## Steg 4: Forbered Din Tekst

### Hva slags tekst fungerer best?

**GODE eksempler på tekst:**

```
Min oldefar Edvard Jensen ble født i 1885 i Christiania, Norge. 
Han giftet seg med Anna Larsen i 1910. De fikk tre barn: 
Olav Jensen (født 1912), Inger Jensen (født 1915), og 
Knut Jensen (født 1918).

Edvard døde i 1950 i Oslo. Anna overlevde ham og døde i 1965.

Olav giftet seg med Maria Hansen i 1935. De fikk to barn: 
Erik Olsen (født 1938) og Liv Olsen (født 1942).

Min bestefar var Olav Jensen. Han var født i Christiania 
og jobbet som skomaker. Han døde i 1975.
```

**Enda bedre med mer detaljer:**

```
FAMILIEHISTORIE

Edvard Jensen (1885-1950)
Edvard ble født den 15. mars 1885 i Christiania, som nå er Oslo. 
Han var sønn av Jens Edvardsen (1850-1920) og Ingeborg Nilsdatter (1855-1930).
Edvard jobbet som skomaker og hadde sin egen butikk i Karl Johans gate.
Han giftet seg med Anna Maria Larsen (1888-1965) den 12. juni 1910 
i Vår Frelsers kirke i Oslo.

Barn:
- Olav Edvard Jensen (1912-1975) - gift med Maria Hansen (1914-1990)
- Inger Jensen (1915-2001) - gift med Per Berg (1910-1985)
- Knut Jensen (1918-1989) - gift med Solveig Andersen (1920-2010)

Olav og Maria fikk:
- Erik Olsen (1938-) - gift med Kari Johansen (1940-)
- Liv Olsen (1942-) - gift med Lars Nilsen (1940-)
```

### Tips for Beste Resultat:

✅ **Inkluder:**
- Fullstendige navn (fornavn + etternavn)
- Fødselsår og dødsår når mulig
- Steder (by, land)
- Relasjoner ("sønn av", "giftet seg med", "barn:")
- Yrker eller interesser
- Datoer for viktige hendelser

✅ **Struktur:**
- Bruk linjeskift mellom personer
- List opp barn under foreldre
- Bruk klare relasjonsord (far, mor, sønn, datter, gift med)

❌ **Unngå:**
- For korte tekster (minimum 10 ord)
- For mye irrelevant informasjon
- Uklare relasjoner

## Steg 5: Lim inn Teksten

1. **Scroll ned** til "Family Information" tekstboksen
2. **Lim inn din tekst** (Ctrl+V eller Cmd+V)
3. **Sjekk ordtelleren** - du skal se "X words" oppdateres
4. Teksten kan være **10,000+ ord** - jo mer info, jo bedre!

## Steg 6: Legg inn API-nøkkel (Valgfritt men Anbefalt)

1. **Scroll ned** til "OpenRouter API Key" feltet
2. **Lim inn din API-nøkkel** (den som starter med `sk-or-...`)
3. **Viktig**: Nøkkelen lagres kun i nettleseren din, ikke på serveren

**Hvis du ikke har API-nøkkel:**
- Du kan fortsatt bruke funksjonen, men den vil bruke enklere tekstanalyse
- Resultatene blir ikke like gode, men du kan alltid legge til API-nøkkel senere

## Steg 7: Kjør AI-analysen

1. **Klikk på "Analyze with AI & Build Tree"** knappen
2. Du vil se en spinner og statusmeldinger:
   - "Connecting to AI..."
   - "AI is analyzing your text..."
   - "Building family tree..."

3. **Vent** - dette tar vanligvis 10-30 sekunder avhengig av tekstlengde

## Steg 8: Se Resultatet

1. **Familietreet vises automatisk** etter analysen
2. Hver person er en "node" i treet
3. Du kan:
   - **Dra personer** ved å klikke og dra
   - **Klikke på person** for å se detaljer
   - **Redigere** (✏️ knapp)
   - **Slette** (🗑️ knapp)

## Steg 9: Lagre Treet

1. **Klikk "Save Tree"** i Tree Controls
2. Alle personene lagres til din profil
3. Du kan nå se dem på **Profile**-siden
4. Du kan søke på dem på **Search**-siden

## Eksempel på Full Tekst

Her er et eksempel på en god tekst du kan prøve:

```
FAMILIEHISTORIE - JENSEN FAMILIEN

MIN MORSLEDN - JENSEN FAMILIEN

Min oldefar Edvard Jensen ble født den 15. mars 1885 i Christiania 
(som nå er Oslo), Norge. Han var sønn av Jens Edvardsen (1850-1920) 
og Ingeborg Nilsdatter (1855-1930). Edvard jobbet som skomaker og 
hadde sin egen butikk i Karl Johans gate i Oslo.

Edvard giftet seg med Anna Maria Larsen den 12. juni 1910 i 
Vår Frelsers kirke i Oslo. Anna ble født i 1888 i Drammen, Norge, 
og døde i 1965 i Oslo.

Edvard og Anna fikk tre barn:
1. Olav Edvard Jensen (født 1912, død 1975) - gift med Maria Hansen (1914-1990)
2. Inger Jensen (født 1915, død 2001) - gift med Per Berg (1910-1985)
3. Knut Jensen (født 1918, død 1989) - gift med Solveig Andersen (1920-2010)

Edvard Jensen døde i 1950 i Oslo.

OLAV EDVARD JENSEN (1912-1975)
Min bestefar Olav Edvard Jensen ble født i 1912 i Oslo. 
Han jobbet som murer og giftet seg med Maria Hansen i 1935.
Maria ble født i 1914 og døde i 1990.

Olav og Maria fikk to barn:
- Erik Olsen (født 1938) - gift med Kari Johansen (født 1940)
- Liv Olsen (født 1942) - gift med Lars Nilsen (født 1940)

Olav døde i 1975 i Oslo.

ERIK OLSEN (1938-)
Min far Erik Olsen ble født i 1938 i Oslo. 
Han giftet seg med Kari Johansen i 1960.
Kari ble født i 1940 i Bergen, Norge.

Erik og Kari fikk meg (født 1970) og min søster Anne (født 1972).

MIN FARSLEDN - HANSEN FAMILIEN

Min bestemor Maria Hansen (1914-1990) var født i Drammen, Norge.
Hun var datter av Hans Hansen (1880-1950) og Ingrid Svendsen (1885-1960).
Maria hadde en bror, Knut Hansen (1916-1995), som var gift med 
Solveig Larsen (1920-2005).

Hans Hansen (1880-1950) var født i Kongsberg, Norge og jobbet som 
tømrer. Han giftet seg med Ingrid Svendsen i 1905 i Drammen.
```

## Troubleshooting

### AI-analysen feiler
- **Sjekk at API-nøkkelen er riktig** (starter med `sk-or-`)
- **Sjekk at du har kreditt** på OpenRouter-kontoen
- Prøv med kortere tekst først
- Sjekk nettleserens console (F12) for feilmeldinger

### For få personer ekstrahert
- Legg til mer detaljer i teksten
- Bruk klare navn og relasjoner
- Inkluder fødselsår og steder

### Treet ser ikke riktig ut
- Du kan dra personer for å flytte dem
- Klikk "Save Tree" for å lagre posisjonene
- Prøv "Clear Tree" og kjør analysen på nytt

### Treet vises ikke
- Sjekk at du er logget inn
- Sjekk at analysen fullførte uten feil
- Prøv å laste siden på nytt

## Tips og Triks

1. **Start med en liten tekst** for å teste
2. **Legg til mer info** etter hvert som du husker
3. **Bruk struktur** - list opp barn under foreldre
4. **Inkluder steder** - hjelper AI med å forstå kontekst
5. **Eksporter treet** før du sletter, så har du backup
6. **Bruk "Import Tree"** for å laste inn lagrede trær

## Kostnader

- **OpenRouter**: Gratis tier gir $5 ved opprettelse
- **Typisk bruk**: 10,000 ord koster ca. $0.01-0.02
- **Estimert**: 50-100 analyser med gratis tier
- Du kan alltid fylle opp mer kreditt hvis nødvendig

---

**Lykke til med å bygge ditt familietre! 🌳**
