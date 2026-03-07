const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    const url = 'https://www.airbnb.com.br/rooms/843787729910901596'; // example or random room
    try {
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'pt-BR,pt;q=0.9',
            }
        });

        const html = res.data;
        const $ = cheerio.load(html);
        console.log('OG:', $('meta[property="og:title"]').attr('content'));
        console.log('H1:', $('h1').first().text());

        // Apollo State
        let apolloState = null;
        const stateMatch = html.match(/id="data-deferred-state-0">([^<]+)<\/script>/) || html.match(/window\.__apolloUIState__\s*=\s*({.+?});/);
        if (stateMatch) {
            apolloState = JSON.parse(stateMatch[1]);
            const stateStr = JSON.stringify(apolloState);
            const titleMatch = stateStr.match(/"title":"([^"]+)"/g);
            console.log('Titles in State:', titleMatch ? titleMatch.slice(0, 5) : 'None');

            const nameMatch = stateStr.match(/"name":"([^"]+)"/g);
            console.log('Names in State:', nameMatch ? nameMatch.slice(0, 5) : 'None');
        }
    } catch (e) { console.error(e.message); }
}
test();
