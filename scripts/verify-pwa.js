/**
 * PWA Verification Script
 * Verifiserer at alle PWA-komponenter er på plass før testing
 */

const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
    // __dirname er scripts/, så vi må gå opp et nivå for rotmappen
    const rootDir = path.join(__dirname, '..');
    const fullPath = path.join(rootDir, filePath);
    if (fs.existsSync(fullPath)) {
        log(`✅ ${description}`, 'green');
        return true;
    } else {
        log(`❌ ${description} - MANGEL: ${filePath}`, 'red');
        return false;
    }
}

function checkIcon(iconName) {
    const rootDir = path.join(__dirname, '..');
    const iconPath = path.join(rootDir, 'assets', 'icons', iconName);
    if (fs.existsSync(iconPath)) {
        const stats = fs.statSync(iconPath);
        log(`  ✅ ${iconName} (${(stats.size / 1024).toFixed(1)} KB)`, 'green');
        return true;
    } else {
        log(`  ❌ ${iconName} - MANGEL`, 'red');
        return false;
    }
}

function checkManifest() {
    log('\n📄 Sjekker manifest.json...', 'cyan');
    const rootDir = path.join(__dirname, '..');
    const manifestPath = path.join(rootDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        log('❌ manifest.json finnes ikke!', 'red');
        return false;
    }
    
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        let allOk = true;
        
        // Check required fields
        const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'icons'];
        requiredFields.forEach(field => {
            if (manifest[field]) {
                log(`  ✅ ${field}`, 'green');
            } else {
                log(`  ❌ ${field} - MANGEL`, 'red');
                allOk = false;
            }
        });
        
        // Check icons
        if (manifest.icons && Array.isArray(manifest.icons)) {
            log(`  ✅ ${manifest.icons.length} ikon(er) definert`, 'green');
        } else {
            log('  ❌ Ikoner ikke definert korrekt', 'red');
            allOk = false;
        }
        
        return allOk;
    } catch (error) {
        log(`❌ Feil ved lesing av manifest.json: ${error.message}`, 'red');
        return false;
    }
}

function checkServiceWorker() {
    log('\n⚙️ Sjekker Service Worker...', 'cyan');
    const rootDir = path.join(__dirname, '..');
    const swPath = path.join(rootDir, 'sw.js');
    if (!fs.existsSync(swPath)) {
        log('❌ sw.js finnes ikke!', 'red');
        return false;
    }
    
    const swContent = fs.readFileSync(swPath, 'utf8');
    let allOk = true;
    
    // Check for cache name
    if (swContent.includes('CACHE_NAME')) {
        log('  ✅ CACHE_NAME definert', 'green');
    } else {
        log('  ❌ CACHE_NAME ikke funnet', 'red');
        allOk = false;
    }
    
    // Check for install event
    if (swContent.includes('install')) {
        log('  ✅ Install event handler', 'green');
    } else {
        log('  ❌ Install event handler mangler', 'red');
        allOk = false;
    }
    
    // Check for fetch event
    if (swContent.includes('fetch')) {
        log('  ✅ Fetch event handler', 'green');
    } else {
        log('  ❌ Fetch event handler mangler', 'red');
        allOk = false;
    }
    
    return allOk;
}

function checkHTMLFiles() {
    log('\n📄 Sjekker HTML-filer...', 'cyan');
    const rootDir = path.join(__dirname, '..');
    const htmlFiles = [
        'index.html',
        'search.html',
        'profile.html',
        'family-tree.html',
        'person.html',
        'login.html',
        'about.html'
    ];
    
    let allOk = true;
    htmlFiles.forEach(file => {
        const filePath = path.join(rootDir, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            let fileOk = true;
            
            // Check for manifest link
            if (content.includes('manifest.json')) {
                log(`  ✅ ${file} - manifest link`, 'green');
            } else {
                log(`  ❌ ${file} - manifest link mangler`, 'red');
                fileOk = false;
            }
            
            // Check for theme-color meta
            if (content.includes('theme-color')) {
                log(`  ✅ ${file} - theme-color meta`, 'green');
            } else {
                log(`  ❌ ${file} - theme-color meta mangler`, 'red');
                fileOk = false;
            }
            
            // Check for service worker registration
            if (content.includes('serviceWorker.register')) {
                log(`  ✅ ${file} - Service Worker registrering`, 'green');
            } else {
                log(`  ⚠️  ${file} - Service Worker registrering mangler (kan være i main.js)`, 'yellow');
            }
            
            if (!fileOk) allOk = false;
        } else {
            log(`  ❌ ${file} - Filen finnes ikke`, 'red');
            allOk = false;
        }
    });
    
    return allOk;
}

function checkIcons() {
    log('\n🎨 Sjekker app-ikoner...', 'cyan');
    const requiredIcons = [
        'icon-96x96.png',
        'icon-144x144.png',
        'icon-180x180.png',
        'icon-192x192.png',
        'icon-512x512.png',
        'icon-maskable-192x192.png',
        'icon-maskable-512x512.png'
    ];
    
    let allOk = true;
    requiredIcons.forEach(icon => {
        if (!checkIcon(icon)) {
            allOk = false;
        }
    });
    
    return allOk;
}

function checkJSFiles() {
    log('\n📜 Sjekker JavaScript-filer...', 'cyan');
    const jsFiles = [
        { path: 'js/install-prompt.js', desc: 'Install prompt' },
        { path: 'js/update-manager.js', desc: 'Update manager' },
        { path: 'js/offline-queue.js', desc: 'Offline queue' },
        { path: 'js/offline-indicator.js', desc: 'Offline indicator' }
    ];
    
    let allOk = true;
    jsFiles.forEach(({ path: filePath, desc }) => {
        if (checkFile(filePath, desc)) {
            // File exists, check if it's not empty
            const rootDir = path.join(__dirname, '..');
            const fullPath = path.join(rootDir, filePath);
            const stats = fs.statSync(fullPath);
            if (stats.size > 0) {
                log(`  ✅ ${desc} - Filen er ikke tom`, 'green');
            } else {
                log(`  ⚠️  ${desc} - Filen er tom`, 'yellow');
            }
        } else {
            allOk = false;
        }
    });
    
    return allOk;
}

// Main verification
function main() {
    log('\n🔍 PastLife PWA - Verifisering\n', 'cyan');
    log('='.repeat(50), 'cyan');
    
    const results = {
        manifest: checkManifest(),
        serviceWorker: checkServiceWorker(),
        icons: checkIcons(),
        htmlFiles: checkHTMLFiles(),
        jsFiles: checkJSFiles()
    };
    
    log('\n' + '='.repeat(50), 'cyan');
    log('\n📊 Resultat:', 'cyan');
    
    const allPassed = Object.values(results).every(r => r);
    
    Object.entries(results).forEach(([key, passed]) => {
        const status = passed ? '✅' : '❌';
        const color = passed ? 'green' : 'red';
        log(`${status} ${key}: ${passed ? 'OK' : 'FEIL'}`, color);
    });
    
    log('\n' + '='.repeat(50), 'cyan');
    
    if (allPassed) {
        log('\n🎉 Alle PWA-komponenter er på plass!', 'green');
        log('✅ Appen er klar for testing!', 'green');
        log('\nNeste steg:', 'cyan');
        log('1. Start lokal server: python -m http.server 8000', 'yellow');
        log('2. Åpne http://localhost:8000 i Chrome', 'yellow');
        log('3. Kjør Lighthouse audit (F12 → Lighthouse)', 'yellow');
        log('4. Test installasjon på faktiske enheter', 'yellow');
    } else {
        log('\n⚠️  Noen komponenter mangler!', 'yellow');
        log('Fiks problemene over før testing.', 'yellow');
    }
    
    log('\n' + '='.repeat(50) + '\n', 'cyan');
}

// Run verification
main();

