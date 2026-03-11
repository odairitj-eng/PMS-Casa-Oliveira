const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\Usuário\\.gemini\\antigravity\\brain\\5428571a-53c6-4b3a-a469-0afa8484ed1c\\crystal_clear_casa_oliveira_logo_v4_1773247568152.png';

const destinations = [
    'public/imagens/logo.png',
    'public/icons/icon-512x512.png',
    'public/icons/icon-384x384.png',
    'public/icons/icon-192x192.png',
    'public/icons/icon-152x152.png',
    'public/icons/icon-144x144.png',
    'public/icons/icon-128x128.png',
    'public/icons/icon-96x96.png',
    'public/icons/icon-72x72.png'
];

destinations.forEach(dest => {
    try {
        const fullDest = path.join(process.cwd(), dest);
        fs.copyFileSync(src, fullDest);
        console.log(`Successfully copied to ${dest}`);
    } catch (err) {
        console.error(`Error copying to ${dest}:`, err.message);
    }
});
