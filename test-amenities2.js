const axios = require('axios');

async function test() {
    const url = 'https://www.airbnb.com.br/rooms/843787729910901596';
    const res = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'pt-BR,pt;q=0.9',
        }
    });

    const html = res.data;

    // Test 1: By "available":true
    const amRegex1 = /"title":"([^"]+)","subtitle"[^}]+?"available":true/g;
    let m;
    let c = 0;
    console.log('--- BY AVAILABLE TRUE ---');
    while ((m = amRegex1.exec(html)) !== null && c < 20) {
        console.log(m[1]);
        c++;
    }

    // Test 2: Standard title subtitle
    const amRegex2 = /"title":"([^"]+)","subtitle":"([^"]+)"/g;
    c = 0;
    console.log('--- BY TITLE SUBTITLE ---');
    while ((m = amRegex2.exec(html)) !== null && c < 20) {
        console.log(m[1], ' | ', m[2]);
        c++;
    }
}
test();
