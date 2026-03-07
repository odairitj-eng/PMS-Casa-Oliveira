const http = require('http');

console.log('Fetching properties...');
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/properties',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`BODY SNEAK PEEK: ${data.substring(0, 300)}`);
    });
});

req.on('error', (e) => {
    console.error(`Fetch HTTP Error: ${e.message}`);
});

req.setTimeout(5000, () => {
    console.error('TIMED OUT!');
    req.abort();
});

req.end();
