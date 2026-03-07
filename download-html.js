const axios = require('axios');
const fs = require('fs');

async function test() {
    const url = 'https://www.airbnb.com.br/rooms/843787729910901596';
    const res = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'pt-BR,pt;q=0.9',
        }
    });
    fs.writeFileSync('air.html', res.data);
    console.log('Saved to air.html');
}
test();
