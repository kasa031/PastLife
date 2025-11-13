# ⚠️ SIKKERHETSVARSEL - API-NØKKEL

## KRITISK: IKKE COMMIT API-NØKKELEN!

API-nøkkelen for OpenRouter er nå implementert i `js/family-tree.js` som `DEFAULT_API_KEY`.

**DENNE FILEN MÅ IKKE COMMITTES MED API-NØKKELEN!**

### Hva er gjort:
- API-nøkkelen er lagt til i koden som en konstant
- Den settes automatisk i localStorage første gang siden lastes
- Den lagres KUN i localStorage (ikke i git)

### Hva du MÅ gjøre:
1. **IKKE commit** `js/family-tree.js` hvis den inneholder API-nøkkelen
2. **Sjekk før commit**: `git diff js/family-tree.js | grep "sk-or-v1-"`
3. Hvis du ser API-nøkkelen i diff, **IKKE commit!**

### Sikkerhetsregler:
- ✅ API-nøkkelen lagres KUN i localStorage (i nettleseren)
- ✅ API-nøkkelen settes automatisk første gang siden lastes
- ❌ API-nøkkelen skal ALDRI være i git history
- ❌ API-nøkkelen skal ALDRI være i committede filer

### Hvis API-nøkkelen allerede er committet:
1. Revoker nøkkelen umiddelbart på https://openrouter.ai/keys
2. Generer en ny nøkkel
3. Oppdater koden med ny nøkkel
4. **IKKE commit den nye nøkkelen**

### Sjekkliste før commit:
- [ ] Kjør: `git diff | grep -i "sk-or-v1-"`
- [ ] Hvis noe vises, IKKE commit!
- [ ] Sjekk at `.gitignore` er oppdatert
- [ ] Verifiser at ingen API-nøkler er i staging area

