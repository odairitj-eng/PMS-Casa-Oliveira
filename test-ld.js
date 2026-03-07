const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    const url = 'https://www.airbnb.com.br/rooms/843787729910901596'; // Valid active room
    try {
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9',
            }
        });

        const html = res.data;
        const $ = cheerio.load(html);
        console.log('H1:', $('h1').text());

        let schemaName = null;
        $('script[type="application/ld+json"]').each((i, el) => {
            try {
                const data = JSON.parse($(el).html());
                if (data["@type"] === "LodgingBusiness" || data["@type"] === "Product" || data["@type"] === "Accommodation") {
                    if (data.name) schemaName = data.name;
                }
            } catch (e) { }
        });
        console.log('JSON-LD Name:', schemaName);

        // Also let's try regex on Apollo state just in case
        const nameRegex = /"PdpTitleSection".*?"title":"([^"]+)"/;
        const m = html.match(nameRegex);
        console.log('Apollo PdpTitleSection:', m ? m[1] : 'null');

    } catch (e) { console.error('Error fetching', e.status); }
}
test();
