const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    const url = 'https://www.airbnb.com.br/rooms/843787729910901596';
    const res = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'pt-BR,pt;q=0.9',
        }
    });

    const html = res.data;

    // Attempt 1: Apollo State
    const photoUrls = new Set();
    let apolloState = null;
    const stateMatch = html.match(/id="data-deferred-state-0">([^<]+)<\/script>/) || html.match(/window\.__apolloUIState__\s*=\s*({.+?});/);
    if (stateMatch) {
        try {
            apolloState = JSON.parse(stateMatch[1]);
            const stateStr = JSON.stringify(apolloState);
            const picRegex = /"pictureUrl":"([^"]+)"/g;
            let pMatch;
            while ((pMatch = picRegex.exec(stateStr)) !== null) {
                const cleanUrl = pMatch[1].replace(/\\u0026/g, '&').split('?')[0];
                if (cleanUrl.includes('pictures/') && !cleanUrl.includes('user_profile')) {
                    photoUrls.add(cleanUrl);
                }
            }
        } catch (e) { }
    }
    console.log(`State photos: ${photoUrls.size}`);

    // Attempt 3: General regex
    const photoUrls3 = new Set();
    const imgRegex = /https:\/\/[^"]+airbnb[^"]+pictures[^"]+\.(?:jpg|jpeg|png|webp)/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
        const cleanUrl = imgMatch[0].replace(/\\u0026/g, '&').split('?')[0];
        if (!cleanUrl.includes('user_profile') && !cleanUrl.includes('avatar') && !cleanUrl.includes('explore_card')) {
            photoUrls3.add(cleanUrl);
        }
    }
    console.log(`General regex photos: ${photoUrls3.size}`);
    if (photoUrls3.size > 0) {
        console.log(Array.from(photoUrls3).slice(0, 5));
    }

    // Inspect specific state keys for standard arrays
    let count = 0;
    if (apolloState) {
        for (let key in apolloState) {
            if (key.includes('ExplorePhoto') || key.includes('Image')) {
                count++;
                if (count < 3) console.log('Found photo node:', key, apolloState[key].pictureUrl || apolloState[key].baseUrl);
            }
        }
    }
}
test();
