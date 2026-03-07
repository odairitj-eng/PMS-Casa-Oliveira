const html = require('fs').readFileSync('air.html', 'utf8');
const r = /"title"\s*:\s*"([^"]+)"\s*,\s*"subtitle"\s*:\s*([^,]+)/g;
let m;
let c = 0;
while ((m = r.exec(html)) !== null && c < 50) {
    console.log(m[1]);
    c++;
}
