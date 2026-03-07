const http = require('http');

http.get('http://localhost:3001/casa-oliveira-refugio-com-vista-panoramica-e-piscina', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('STATUSCODE:', res.statusCode);
        process.exit(0);
    });
}).on('error', (err) => {
    console.error('FETCH ERROR:', err.message);
    process.exit(1);
});
