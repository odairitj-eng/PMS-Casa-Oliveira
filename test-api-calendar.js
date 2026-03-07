const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/calendar?propertyId=cm80drc820001y990n85h7a0o',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`BODY: ${data.substring(0, 1000)}`);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.setTimeout(5000, () => {
    console.error('Request timed out!');
    req.abort();
});

req.end();
