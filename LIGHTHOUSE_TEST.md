# 🔍 Lighthouse PWA Audit - Test Guide

## Oversikt
Lighthouse er et verktøy i Chrome DevTools som tester PWA-kvalitet og gir en score basert på PWA-best practices.

---

## 🚀 Rask Start

### Steg 1: Start Lokal Server
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

### Steg 2: Åpne i Chrome
1. Gå til `http://localhost:8000`
2. Åpne Chrome DevTools (F12)
3. Gå til "Lighthouse" fanen
4. Velg:
   - ✅ Progressive Web App
   - ✅ Desktop eller Mobile
5. Klikk "Analyze page load"

---

## 📊 Forventede Resultater

### Mål
- **PWA Score:** 90+ poeng
- **Installable:** ✅
- **Service Worker:** ✅
- **Offline support:** ✅
- **Fast and reliable:** ✅

### Alle Krav
- ✅ HTTPS (eller localhost)
- ✅ Manifest med ikoner
- ✅ Service Worker registrert
- ✅ Offline-fallback
- ✅ Responsive design
- ✅ Fast loading
- ✅ Theme color
- ✅ Maskable icon

---

## 🔧 Vanlige Problemer og Løsninger

### Problem 1: "Does not provide a valid apple-touch-icon"
**Feilmelding:**
```
The site does not provide a valid apple-touch-icon
```

**Løsning:**
1. Sjekk at `icon-180x180.png` finnes i `assets/icons/`
2. Verifiser at HTML-filene har:
   ```html
   <link rel="apple-touch-icon" href="assets/icons/icon-180x180.png">
   ```

**Test:**
```bash
# Verifiser at filen finnes
ls assets/icons/icon-180x180.png
```

---

### Problem 2: "Manifest doesn't have a maskable icon"
**Feilmelding:**
```
Manifest doesn't have a maskable icon
```

**Løsning:**
1. Sjekk at `icon-maskable-192x192.png` og `icon-maskable-512x512.png` finnes
2. Verifiser at `manifest.json` har:
   ```json
   {
     "src": "/assets/icons/icon-maskable-192x192.png",
     "sizes": "192x192",
     "type": "image/png",
     "purpose": "maskable"
   }
   ```

**Test:**
```bash
# Verifiser at filene finnes
ls assets/icons/icon-maskable-*.png
```

---

### Problem 3: "Does not register a service worker"
**Feilmelding:**
```
Does not register a service worker
```

**Løsning:**
1. Sjekk at `sw.js` finnes i root-mappen
2. Verifiser at HTML-filene har Service Worker-registrering:
   ```html
   <script>
       if ('serviceWorker' in navigator) {
           window.addEventListener('load', () => {
               navigator.serviceWorker.register('/sw.js')
                   .then((registration) => {
                       console.log('Service Worker registered:', registration.scope);
                   })
                   .catch((error) => {
                       console.log('Service Worker registration failed:', error);
                   });
           });
       }
   </script>
   ```

**Test:**
1. Åpne Chrome DevTools → Application → Service Workers
2. Verifiser at Service Worker er registrert
3. Sjekk konsollen for feilmeldinger

---

### Problem 4: "Page does not work offline"
**Feilmelding:**
```
Page does not work offline
```

**Løsning:**
1. Sjekk at Service Worker har offline-fallback:
   ```javascript
   // In sw.js
   event.respondWith(
       caches.match(request).then((cachedResponse) => {
           if (cachedResponse) {
               return cachedResponse;
           }
           return fetch(request).catch(() => {
               // Offline fallback
               return caches.match('/index.html');
           });
       })
   );
   ```

**Test:**
1. Installer appen
2. Aktiver flymodus
3. Reload appen
4. Verifiser at appen fungerer

---

### Problem 5: "Manifest doesn't have a theme color"
**Feilmelding:**
```
Manifest doesn't have a theme color
```

**Løsning:**
1. Sjekk at `manifest.json` har:
   ```json
   {
     "theme_color": "#00897b"
   }
   ```

2. Sjekk at HTML-filene har:
   ```html
   <meta name="theme-color" content="#00897b">
   ```

---

### Problem 6: "Page is not installable"
**Feilmelding:**
```
Page is not installable
```

**Løsning:**
1. Sjekk at alle krav er oppfylt:
   - ✅ Manifest med ikoner
   - ✅ Service Worker
   - ✅ HTTPS (eller localhost)
   - ✅ Start URL
   - ✅ Display mode

2. Test install-prompt:
   - Åpne Chrome DevTools → Application → Manifest
   - Verifiser at manifest er valid
   - Test "Add to homescreen"

---

## 📝 Detaljert Checklist

### Manifest
- [ ] `manifest.json` finnes
- [ ] `name` og `short_name` er satt
- [ ] `start_url` er satt
- [ ] `display` er satt til `standalone`
- [ ] `theme_color` er satt
- [ ] `background_color` er satt
- [ ] Alle ikoner er definert
- [ ] Maskable icons er definert

### Ikoner
- [ ] `icon-96x96.png` finnes
- [ ] `icon-144x144.png` finnes
- [ ] `icon-180x180.png` finnes
- [ ] `icon-192x192.png` finnes
- [ ] `icon-512x512.png` finnes
- [ ] `icon-maskable-192x192.png` finnes
- [ ] `icon-maskable-512x512.png` finnes
- [ ] Alle ikoner er PNG-format
- [ ] Alle ikoner har riktig størrelse

### Service Worker
- [ ] `sw.js` finnes
- [ ] Service Worker er registrert
- [ ] Service Worker cacher statiske filer
- [ ] Offline-fallback er implementert
- [ ] Cache-strategi er definert

### HTML
- [ ] Alle HTML-filer har manifest-link
- [ ] Alle HTML-filer har theme-color meta tag
- [ ] Alle HTML-filer har apple-touch-icon link
- [ ] Alle HTML-filer har viewport meta tag
- [ ] Service Worker er registrert

### Offline
- [ ] Appen fungerer offline
- [ ] Offline-fallback fungerer
- [ ] Cache fungerer
- [ ] Offline-indikator vises

---

## 🎯 Optimalisering

### Performance
1. **Minifiser JavaScript og CSS**
   - Bruk build-tool (Webpack, Vite, etc.)
   - Eller manuell minifisering

2. **Optimaliser bilder**
   - Komprimer PNG-ikoner
   - Bruk WebP for bilder (hvis mulig)

3. **Lazy loading**
   - Last inn bilder og ressurser på forespørsel
   - Bruk `loading="lazy"` for bilder

### Accessibility
1. **ARIA-labels**
   - Legg til ARIA-labels på knapper
   - Bruk semantisk HTML

2. **Kontrast**
   - Sjekk at tekst har god kontrast
   - Test med Lighthouse Accessibility audit

### Best Practices
1. **HTTPS**
   - Bruk HTTPS i produksjon
   - Localhost fungerer uten HTTPS

2. **Content Security Policy**
   - Legg til CSP headers
   - Test at appen fungerer med CSP

---

## 📊 Test-rapport Mal

```markdown
# Lighthouse PWA Audit - Test-rapport

**Dato:** [DATO]
**URL:** [URL]
**Plattform:** [Desktop/Mobile]

## Scores
- **PWA:** [SCORE]/100
- **Performance:** [SCORE]/100
- **Accessibility:** [SCORE]/100
- **Best Practices:** [SCORE]/100
- **SEO:** [SCORE]/100

## PWA-krav
- [ ] Installable: ✅/❌
- [ ] Service Worker: ✅/❌
- [ ] Offline support: ✅/❌
- [ ] Fast and reliable: ✅/❌

## Problemer
[Liste over problemer]

## Løsninger
[Liste over løsninger]

## Anbefalinger
[Liste over anbefalinger]
```

---

## 🔗 Nyttige Ressurser

- **Lighthouse Documentation:** https://developers.google.com/web/tools/lighthouse
- **PWA Checklist:** https://web.dev/pwa-checklist/
- **Web.dev Measure:** https://web.dev/measure
- **PWA Builder:** https://www.pwabuilder.com

---

## 💡 Tips

1. **Test på faktiske enheter**
   - Lighthouse gir estimater
   - Faktiske enheter gir ekte resultater

2. **Test på langsomme nettverk**
   - Bruk Network Throttling i Chrome DevTools
   - Test på faktiske mobile nettverk

3. **Test offline**
   - Installer appen
   - Aktiver flymodus
   - Test alle funksjoner

4. **Monitor i produksjon**
   - Bruk Chrome DevTools → Application → Service Workers
   - Sjekk cache-status
   - Monitor Service Worker-updates

---

**Neste steg:** Kjør Lighthouse audit og fiks eventuelle problemer!

