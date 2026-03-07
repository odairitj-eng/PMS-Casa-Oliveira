const lucide = require('lucide-react');

const importsToCheck = [
    'Building2', 'CreditCard', 'Share2', 'Mail', 'Save', 'Loader2',
    'Image', 'Map', 'FileCheck', 'DownloadCloud', 'ArrowLeft', 'ExternalLink', 'Plug',
    'Plus', 'Trash2', 'ShieldAlert', 'CheckCircle2', 'ArrowRight'
];

let missing = [];

for (const name of importsToCheck) {
    if (!lucide[name]) {
        missing.push(name);
    }
}

console.log('MISSING ICONS:', missing.length > 0 ? missing.join(', ') : 'NONE');
