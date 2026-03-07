const fs = require('fs');

async function test() {
    const html = fs.readFileSync('air.html', 'utf8');

    let apolloState = null;
    const stateMatch = html.match(/id="data-deferred-state-0">([^<]+)<\/script>/) || html.match(/window\.__apolloUIState__\s*=\s*({.+?});/);
    if (stateMatch) {
        apolloState = JSON.parse(stateMatch[1]);

        let foundKeys = [];
        for (let key in apolloState) {
            if (key.toLowerCase().includes('amenit')) {
                foundKeys.push(key);
            }
        }
        console.log("Amenity keys:", foundKeys.slice(0, 5));

        // Let's look for standard amenity format (title, subtitle)
        const amenityRegex = /"title":"([^"]+)","subtitle"/g;
        let match;
        let c = 0;
        let stateStr = JSON.stringify(apolloState);
        while ((match = amenityRegex.exec(stateStr)) !== null) {
            if (c < 15) console.log("-", match[1]);
            c++;
        }
    }
}
test();
