# 📋 Omfattende TODO-liste - F³ Prosjekt

## 🎨 Layout og Responsiv Design

### Mobil og Nettbrett
- [ ] Forbedre layout på mobil (alle sider)
- [ ] Forbedre layout på nettbrett (alle sider)
- [ ] Optimaliser familietre-visning for små skjermer
- [ ] Forbedre touch-gestures for familietre på mobil
- [ ] Gjør person-detalj-siden mer luftig og lesbar på mobil
- [ ] Optimaliser navigasjon for mobil/nettbrett
- [ ] Test på forskjellige skjermstørrelser (iPhone, iPad, Android)

### Generell Layout-forbedring
- [ ] Gjør alle sider mer luftige (økt padding/margin)
- [ ] Forbedre spacing mellom elementer
- [ ] Optimaliser typografi for bedre lesbarhet
- [ ] Forbedre kontrast og fargebruk

## 🖼️ Bildehåndtering

### Familietre
- [ ] Legg til mulighet til å bytte bilde for hver person i treet
- [ ] Vis personens bilde i treet hvis tilgjengelig
- [ ] Legg til "Endre bilde"-knapp i tre-node
- [ ] Lagre bilder per person (ikke bare hovedbilde)
- [ ] Støtte for flere bilder per person (bildgalleri)

### Person-profil
- [ ] Hvis person har bilde, vis det som hovedprofilbilde
- [ ] Legg til bildgalleri på person-siden
- [ ] Mulighet til å legge til flere bilder per person
- [ ] Mulighet til å velge hvilket bilde som er hovedbilde
- [ ] Vis bilder i luftig layout

## 🔗 Kilder (Sources)

- [ ] Legg til felt for kilder på person-objektet
- [ ] Gjør kilder klikkbare (hvis URL)
- [ ] Vis kilder godt innenfor rammene (ikke utenfor)
- [ ] Formater kilder pent (liste eller cards)
- [ ] Legg til mulighet til å legge til kilder når man oppretter/redigerer person
- [ ] Vis kilder på person-detalj-siden
- [ ] Vis kilder i familietre (valgfritt)

## 📅 Dato og Metadata

- [ ] Legg til "createdAt" dato på alle personer
- [ ] Vis "Added by: [navn] - [dato]" på person-sider
- [ ] Formater dato pent (f.eks. "15. januar 2025")
- [ ] Legg til "lastModified" dato for redigeringer
- [ ] Vis dato i kommentarer (allerede implementert, sjekk at det fungerer)

## 📞 Kontakt/Om Meg-fane

- [ ] Opprett ny "About" eller "Contact" side
- [ ] Legg til kontaktinformasjon: ms.tery@icloud.com
- [ ] Legg til bakgrunnsinformasjon om prosjektet/deg
- [ ] Legg til link i navigasjonen
- [ ] Gjør siden responsiv og luftig
- [ ] Legg til sosial media lenker (hvis relevant)

## 🔧 Tekniske Forbedringer

### Data-struktur
- [ ] Legg til `sources` array på person-objektet
- [ ] Legg til `images` array på person-objektet (flere bilder)
- [ ] Legg til `mainImage` felt for å velge hovedbilde
- [ ] Legg til `createdAt` og `lastModified` på alle personer
- [ ] Migrer eksisterende data til ny struktur (hvis nødvendig)

### Funksjonalitet
- [ ] Implementer bilde-upload for familietre-noder
- [ ] Implementer kilde-input i skjemaer
- [ ] Implementer bildegalleri-visning
- [ ] Implementer hovedbilde-valg
- [ ] Forbedre bildekomprimering for flere bilder

## 🎯 Prioriterte Oppgaver (Start her)

1. **Layout-forbedringer (mobil/nettbrett)** - Høy prioritet
2. **Bildehåndtering i familietre** - Høy prioritet
3. **Kilder-funksjonalitet** - Høy prioritet
4. **Dato-visning** - Medium prioritet
5. **Kontakt/Om Meg-side** - Medium prioritet
6. **Bildegalleri** - Lav prioritet (kan utvides senere)

## 📝 Notater

- Alle endringer skal være bakoverkompatible
- Test på flere enheter før deploy
- Husk å oppdatere dokumentasjon
- Sjekk at alle funksjoner fungerer med localStorage

