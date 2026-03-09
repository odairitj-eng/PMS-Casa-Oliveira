export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import * as cheerio from "cheerio";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        // 🛡️ REDUNDANT ADMIN CHECK (DEFENSE IN DEPTH)
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const { url } = await req.json();

        // 🛡️ SSRF PROTECTION
        if (!url || !url.startsWith("https://") || !url.includes("airbnb.com/rooms/")) {
            return NextResponse.json({ error: "URL inválida. Apenas links diretos de anúncios do Airbnb são permitidos por segurança." }, { status: 400 });
        }

        // Fetching the Airbnb listing page
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'max-age=0',
            },
            timeout: 10000 // 10s timeout
        });

        const html = response.data;
        const $ = cheerio.load(html);

        const ogTitle = $('meta[property="og:title"]').attr('content')?.replace(' - Airbnb', '') || $('title').text()?.replace(' - Airbnb', '') || "";
        const h1Title = $('h1').first().text().trim();
        const ogDescription = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || "";

        // Default values
        let maxGuests = 2;
        let bedrooms = 1;
        let beds = 1;
        let bathrooms = 1;
        let city = "";
        let state = "";
        let country = "Brasil";

        // Extract Location from Schema if possible
        $('script[type="application/ld+json"]').each((i, el) => {
            try {
                const data = JSON.parse($(el).html() || "");
                if (data["@type"] === "LodgingBusiness" || data["@type"] === "Product" || data["@type"] === "Accommodation") {
                    if (data.address) {
                        city = data.address.addressLocality || city;
                        state = data.address.addressRegion || state;
                        country = data.address.addressCountry || country;
                    }
                }
            } catch (e) { }
        });

        // Extract capacity from description text
        if (ogDescription) {
            const guestsMatch = ogDescription.match(/(\d+)\s+hóspede/i);
            if (guestsMatch) maxGuests = parseInt(guestsMatch[1]);

            const bedroomsMatch = ogDescription.match(/(\d+)\s+quarto/i);
            if (bedroomsMatch) bedrooms = parseInt(bedroomsMatch[1]);

            const bedsMatch = ogDescription.match(/(\d+)\s+cama/i);
            if (bedsMatch) beds = parseInt(bedsMatch[1]);

            const bathsMatch = ogDescription.match(/(\d+)\s+banheiro/i);
            if (bathsMatch) bathrooms = parseInt(bathsMatch[1]);
        }

        // We return the data for the form pre-fill
        return NextResponse.json({
            success: true,
            data: {
                name: ogTitle || h1Title,
                publicTitle: ogTitle || h1Title,
                maxGuests,
                bedrooms,
                beds,
                bathrooms,
                city,
                state,
                country,
                // These are useful to have even if not in the basic form yet
                shortDescription: ogDescription.substring(0, 160)
            }
        });

    } catch (error: any) {
        console.error("Erro na extração AirBnb:", error.message);
        return NextResponse.json({ error: "Falha ao extrair dados do Airbnb. Talvez o link seja inválido ou protegido." }, { status: 500 });
    }
}
