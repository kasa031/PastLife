/**
 * PastLife Ikon Generator
 * 
 * Dette scriptet genererer alle nødvendige PWA-ikoner fra favicon.svg
 * 
 * Krav:
 * - Node.js installert
 * - npm install sharp
 * 
 * Bruk:
 * node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Sjekk om sharp er installert
let sharp;
try {
    sharp = require('sharp');
} catch (error) {
    console.error('❌ Feil: sharp er ikke installert!');
    console.log('📦 Installer med: npm install sharp');
    console.log('   Eller bruk generate-icons.html i nettleseren i stedet.');
    process.exit(1);
}

const iconSizes = [
    { size: 96, name: 'icon-96x96.png', maskable: false },
    { size: 144, name: 'icon-144x144.png', maskable: false },
    { size: 180, name: 'icon-180x180.png', maskable: false },
    { size: 192, name: 'icon-192x192.png', maskable: false },
    { size: 512, name: 'icon-512x512.png', maskable: false },
    { size: 192, name: 'icon-maskable-192x192.png', maskable: true },
    { size: 512, name: 'icon-maskable-512x512.png', maskable: true }
];

const inputSvg = path.join(__dirname, 'favicon.svg');
const outputDir = path.join(__dirname, 'assets', 'icons');

async function generateIcons() {
    // Sjekk om favicon.svg finnes
    if (!fs.existsSync(inputSvg)) {
        console.error('❌ Feil: favicon.svg ikke funnet!');
        console.log('   Plasser favicon.svg i prosjektets rotmappe.');
        process.exit(1);
    }
    
    // Opprett output-mappen hvis den ikke finnes
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log('✅ Opprettet assets/icons/ mappen');
    }
    
    console.log('🎨 Genererer ikoner fra favicon.svg...\n');
    
    try {
        for (const icon of iconSizes) {
            const outputPath = path.join(outputDir, icon.name);
            
            // For maskable icons, legg til padding (safe zone)
            if (icon.maskable) {
                const padding = Math.floor(icon.size * 0.1);
                const size = icon.size - (padding * 2);
                
                await sharp(inputSvg)
                    .resize(Math.floor(size), Math.floor(size), {
                        fit: 'contain',
                        background: { r: 255, g: 255, b: 255, alpha: 1 }
                    })
                    .extend({
                        top: padding,
                        bottom: padding,
                        left: padding,
                        right: padding,
                        background: { r: 255, g: 255, b: 255, alpha: 1 }
                    })
                    .png()
                    .toFile(outputPath);
            } else {
                await sharp(inputSvg)
                    .resize(icon.size, icon.size, {
                        fit: 'contain',
                        background: { r: 255, g: 255, b: 255, alpha: 1 }
                    })
                    .png()
                    .toFile(outputPath);
            }
            
            console.log(`✅ Generert: ${icon.name} (${icon.size}x${icon.size}${icon.maskable ? ' - maskable' : ''})`);
        }
        
        console.log('\n🎉 Alle ikoner generert!');
        console.log(`📁 Ikoner lagret i: ${outputDir}`);
        console.log('\n✅ PWA-ikoner er nå klare for bruk!');
        
    } catch (error) {
        console.error('❌ Feil ved generering av ikoner:', error.message);
        process.exit(1);
    }
}

// Kjør generering
generateIcons();

