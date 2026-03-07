const http = require('http');

http.get('http://localhost:3000/casa-oliveira-refugio-com-vista-panoramica-e-piscina', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('STATUSCODE:', res.statusCode);
        console.log('DATA_LENGTH:', data.length);
        if (data.length < 5000) {
            console.log('DATA SNEAK PEEK:', data.substring(0, 500));
        }
        process.exit(0);
    });
}).on('error', (err) => {
    console.error('FETCH ERROR:', err.message);
    process.exit(1);
});
