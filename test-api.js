const https = require('https');

https.get('https://www.casaoliveira.company/api/admin/dashboard', (res) => {
    console.log('Status Code:', res.statusCode);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Response body:', data);
    });
}).on('error', (err) => {
    console.error('Network Error:', err.message);
});
