export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
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
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || "";
        const h1Title = $('h1').first().text().trim();
        const ogDescription = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || "";
        const mainImage = $('meta[property="og:image"]').attr('content') || "";

        // Default values
        let maxGuests = 2;
        let bedrooms = 1;
        let beds = 1;
        let bathrooms = 1;
        let fullDescription = ogDescription;
        let city = "";
        let state = "";
        let country = "";
        let neighborhood = "";

        // ==========================================
        // 1. Title, Subtitle, Location and Descriptions
        // ==========================================
        // 1. Tentar ler o nome oficial e o endereço pelo JSON Schema (SEO) do Airbnb
        let schemaName = "";
        $('script[type="application/ld+json"]').each((i, el) => {
            try {
                const data = JSON.parse($(el).html() || "");
                if (data["@type"] === "LodgingBusiness" || data["@type"] === "Product" || data["@type"] === "Accommodation") {
                    if (data.name) schemaName = data.name;
                    if (data.address) {
                        city = data.address.addressLocality || city;
                        state = data.address.addressRegion || state;
                        country = data.address.addressCountry || country;
                    }
                }
            } catch (e) { }
        });

        // 2. Tentar Ler pelo Apollo State em HTML bruto (PdpTitleSection)
        let apolloTitle = "";
        const titleRegex = /"PdpTitleSection".*?"title"\s*:\s*"([^"]+)"/;
        const tm = html.match(titleRegex);
        if (tm && tm[1]) apolloTitle = tm[1];

        // Decisão do Title:
        let publicTitle = schemaName || apolloTitle || h1Title || ogTitle;
        let publicSubtitle = "";
        let shortDescription = "";

        // Se for forçado a usar o ogTitle como último recurso, limpa só o traço:
        if (publicTitle === ogTitle && publicTitle.includes(' - ')) {
            publicTitle = publicTitle.split(' - ')[0].trim();
        }

        // Tentar extrair Descrição Completa (se houver no state React com mais detalhes)
        const descRegex = /"description"\s*:\s*"([^"]+)"/g;
        let dMatch;
        let descriptions = [];
        while ((dMatch = descRegex.exec(html)) !== null) {
            const cleanDesc = dMatch[1]
                .replace(/\\u([0-9a-fA-F]{4})/g, (m: string, c: string) => String.fromCharCode(parseInt(c, 16)))
                .replace(/\\n/g, '\n');
            if (cleanDesc.length > descriptions.length) {
                descriptions.push(cleanDesc);
            }
        }
        if (descriptions.length > 0) {
            fullDescription = descriptions.reduce((a, b) => a.length > b.length ? a : b, "");
        }

        // Subtítulo: Buscando "Espaço inteiro: casa de campo em Cidade" ou similar
        // Muitas vezes fica dentro de um span ou JSON. Vamos tentar extrair via regex bruto do HTML
        const subtitleRegex = /"roomAndPropertyType"\s*:\s*"([^"]+)"/;
        const subtitleMatch = html.match(subtitleRegex);
        if (subtitleMatch && subtitleMatch[1]) {
            publicSubtitle = subtitleMatch[1].replace(/\\u([0-9a-fA-F]{4})/g, (m: string, c: string) => String.fromCharCode(parseInt(c, 16)));
        }

        // Descrição Curta obrigatóriamente igual ao título, conform UX
        shortDescription = publicTitle;

        // Estrutura
        const guestsMatch = ogDescription.match(/(\d+)\s+hóspede/i);
        if (guestsMatch) maxGuests = parseInt(guestsMatch[1]);

        const bedroomsMatch = ogDescription.match(/(\d+)\s+quarto/i);
        if (bedroomsMatch) bedrooms = parseInt(bedroomsMatch[1]);

        const bedsMatch = ogDescription.match(/(\d+)\s+cama/i);
        if (bedsMatch) beds = parseInt(bedsMatch[1]);

        const bathsMatch = ogDescription.match(/(\d+)\s+banheiro/i);
        if (bathsMatch) bathrooms = parseInt(bathsMatch[1]);

        const property = await db.property.findFirst();
        if (!property) {
            return NextResponse.json({ error: "Nenhuma propriedade configurada no banco." }, { status: 404 });
        }

        // Textos de localização amigáveis
        let locationText = "";
        if (city && state) {
            locationText = `${city}, ${state}`;
            if (country && country.length > 2) locationText += `, ${country}`;
        }

        await (db.property as any).update({
            where: { id: property.id },
            data: {
                publicTitle,
                publicSubtitle: publicSubtitle.substring(0, 190),
                shortDescription: shortDescription.substring(0, 300),
                fullDescription,
                maxGuests,
                bedrooms,
                beds,
                bathrooms,
                city,
                state,
                country,
                neighborhood,
                locationText,
                // Ao importar, limpamos as coordenadas para forçar um novo geocoding preciso no admin/save
                latitude: null,
                longitude: null,
                publicLatitude: null,
                publicLongitude: null
            }
        });

        // ==========================================
        // DEEP JSON EXTRACTION (APOLLO STATE)
        // ==========================================
        let apolloState: any = null;
        try {
            const stateMatch = html.match(/id="data-deferred-state-0">([^<]+)<\/script>/);
            if (stateMatch && stateMatch[1]) {
                apolloState = JSON.parse(stateMatch[1]);
            } else {
                const stateMatch2 = html.match(/window\.__apolloUIState__\s*=\s*({.+?});/);
                if (stateMatch2 && stateMatch2[1]) {
                    apolloState = JSON.parse(stateMatch2[1]);
                }
            }
        } catch (e) {
            console.log("Falha ao fazer parse do Apollo State");
        }

        // ==========================================
        // 2. Photos Extraction
        // ==========================================
        const photoUrls = new Set<string>();

        // Tentar varrer o JSON state se existir
        if (apolloState) {
            const stateStr = JSON.stringify(apolloState);
            const picRegex = /"pictureUrl"\s*:\s*"([^"]+)"/g;
            let pMatch;
            while ((pMatch = picRegex.exec(stateStr)) !== null) {
                const cleanUrl = pMatch[1].replace(/\\u0026/g, '&').split('?')[0];
                if (cleanUrl.includes('pictures/') && !cleanUrl.includes('user_profile') && !cleanUrl.includes('avatar')) {
                    // Convert to higher resolution if it's a thumbnail (miso -> original, or just remove query constraint)
                    photoUrls.add(cleanUrl.replace('/im/w', '/im/pictures'));
                }
            }
        }

        // Fallback global de imagens na página HTML inteira
        if (photoUrls.size < 2) {
            const imgRegex = /https:\/\/[a-z0-9\.]*(?:muscache|airbnb)\.com\/im\/pictures\/[^\s"'\\]+\.(?:jpg|jpeg|webp)/gi;
            let imgMatch;
            while ((imgMatch = imgRegex.exec(html)) !== null) {
                const cleanUrl = imgMatch[0].replace(/\\u0026/g, '&').split('?')[0];
                const cleanLower = cleanUrl.toLowerCase();
                // Bloqueando SVGs e Vetores (Hospedados no Muscache mas não são fotos reais, como Transparent UI, Miso/Hosting icons, Aircover badges)
                if (!cleanLower.includes('user_profile') && !cleanLower.includes('avatar') && !cleanLower.includes('transparent') && !cleanLower.includes('miso/hosting') && !cleanLower.includes('icon')) {
                    photoUrls.add(cleanUrl);
                }
            }
        }

        if (photoUrls.size === 0 && mainImage) photoUrls.add(mainImage.split('?')[0]);

        const photosArray = Array.from(photoUrls);

        if (photosArray.length > 0) {
            await (db as any).propertyPhoto.deleteMany({
                where: { propertyId: property.id }
            });

            const photosToCreate = photosArray.map((url, index) => ({
                propertyId: property.id,
                imageUrl: url,
                sortOrder: index,
                isPrimary: index === 0
            }));

            await (db as any).propertyPhoto.createMany({
                data: photosToCreate
            });
        }

        // ==========================================
        // BLACKLIST & HEURÍSTICAS DE COMUNICAÇÃO
        // ==========================================
        const blacklistUI = [
            "selecionar data", "preferido dos hóspedes", "como funcionam", "avaliações",
            "onde você estará", "saiba mais", "mostrar todas", "mostrar mais", "traduzir",
            "comodidades", "regras da casa", "o que esse lugar oferece", "denunciar",
            "anfitrião", "superhost", "cancelamento", "políticas", "ajuda", "entrar",
            "cadastrar", "compartilhar", "salvar", "buscar", "checkout", "check-in",
            "não é permitido", "não são permitid", "proibido", "limpeza", "hóspedes",
            "detector de fumaça", "detector de monóxido", "monóxido de carbono", "nenhum"
        ];

        const isRuleOrUI = (text: string) => {
            const lower = text.toLowerCase();
            const rulesKeywords = [
                "silêncio", "fotografia", "regras", "toalhas", "lixo", "desligue",
                "devolva", "tranque", "pedidos", "adequado para", "crianças",
                "bebês", "animais de estimação", "pets", "festas", "eventos", "fumar",
                "check", "recolha", "adultos", "idade", "permitido", "proibido", "apenas"
            ];

            return blacklistUI.some(w => lower === w || lower.startsWith(w)) ||
                rulesKeywords.some(w => lower.includes(w)) ||
                lower.length < 3 || lower.length > 50;
        };

        const isAmenityOrUI = (text: string) => {
            const lower = text.toLowerCase();
            const basicAmenities = ["wi-fi", "wifi", "piscina", "estacionamento", "ar-condicionado", "cozinha", "tv"];
            if (basicAmenities.some(w => lower === w || lower === `tem ${w}`)) return true;
            return blacklistUI.some(w => lower === w) || lower.length < 5;
        };

        // ==========================================
        // 3. Amenities Extraction (Filtered)
        // ==========================================
        const amenityUrls = new Set<string>();

        // Fallback genérico filtrado estritamente
        const amenityRegexFallback = /"title"\s*:\s*"([^"]+)"\s*,\s*"subtitle"\s*:\s*([^,]+)/g;
        let aMatchFall;
        while ((aMatchFall = amenityRegexFallback.exec(html)) !== null) {
            const amName = aMatchFall[1].trim();
            const amLower = amName.toLowerCase();

            if (!amName.includes('{') && !amName.includes('[')) {
                // Impede traduções e seções do layout visual passarem
                if (amLower === "salvo" || amLower.includes("traduzido") || amLower.includes("top 5%") || amLower === "quarto" || amLower.includes("entrada e estacionamento")) continue;

                if (!isRuleOrUI(amName) && !blacklistUI.includes(amLower)) {
                    amenityUrls.add(amName);
                }
            }
        }

        const amenitiesArray = Array.from(amenityUrls);
        if (amenitiesArray.length > 0) {
            await (db as any).propertyAmenity.deleteMany({
                where: { propertyId: property.id }
            });

            const amenitiesToCreate = amenitiesArray.map((name, idx) => ({
                propertyId: property.id,
                amenityKey: name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, ''),
                amenityName: name,
                iconName: "check-circle",
                sortOrder: idx,
                isActive: true
            }));

            await (db as any).propertyAmenity.createMany({
                data: amenitiesToCreate
            });
        }

        // ==========================================
        // 4. Rules Extraction (Filtered)
        // ==========================================
        const rules = new Set<string>();
        const ruleRegex = /"title"\s*:\s*"([^"]+)"\s*,\s*"values"\s*:\s*\[([^\]]+)\]/g;
        let rMatch;
        while ((rMatch = ruleRegex.exec(html)) !== null) {
            const sectionTitle = rMatch[1].toLowerCase();
            if (sectionTitle.includes('regras') || sectionTitle.includes('conduta') || sectionTitle.includes('horário')) {
                const valuesMatch = rMatch[2].match(/"([^"]+)"/g);
                if (valuesMatch) {
                    valuesMatch.forEach(v => {
                        const ruleT = v.replace(/"/g, '').trim();
                        if (!ruleT.includes('{') && !isAmenityOrUI(ruleT)) {
                            rules.add(ruleT);
                        }
                    });
                }
            }
        }

        // Se o parser não achou blocos definidos de regra, buscar regras brutas na página
        if (rules.size === 0) {
            const manualRules = html.match(/"(Check-in [^"]+|Checkout [^"]+|Não é permitido [^"]+|Não são permitid[^"]+|Proibido [^"]+|Horário de [^"]+)"/ig);
            if (manualRules) {
                manualRules.forEach((r: string) => rules.add(r.replace(/"/g, '')));
            }
        }

        // Fallbacks baseados na descrição
        if (rules.size === 0) {
            if (fullDescription.toLowerCase().includes('não aceitamos pets') || fullDescription.toLowerCase().includes('proibido pets')) rules.add('Não aceita animais');
            else if (fullDescription.toLowerCase().includes('aceitamos pets') || fullDescription.toLowerCase().includes('pet friendly')) rules.add('Permite animais');

            if (fullDescription.toLowerCase().includes('proibido festas')) rules.add('Não são permitidas festas ou eventos');
            rules.add('Check-in flexível a confirmar');
        }

        const rulesArray = Array.from(rules);
        if (rulesArray.length > 0) {
            await (db as any).propertyRule.deleteMany({
                where: { propertyId: property.id }
            });

            const rulesToCreate = rulesArray.map((ruleText, idx) => ({
                propertyId: property.id,
                ruleText: ruleText.length > 100 ? ruleText.substring(0, 100) + '...' : ruleText,
                isActive: !ruleText.toLowerCase().includes('proibido') && !ruleText.toLowerCase().includes('não'),
                iconName: ruleText.toLowerCase().includes('pet') || ruleText.toLowerCase().includes('animais') ? 'dog' : (ruleText.toLowerCase().includes('fuma') ? 'cigarette' : 'info'),
                sortOrder: idx
            }));

            await (db as any).propertyRule.createMany({
                data: rulesToCreate
            });
        }

        // Extrair horários do texto pesquisável
        const searchableText = `${fullDescription} ${rulesArray.join(' ')}`;
        const checkInPatterns = [
            /check-in\s*(?:é|as|após|entre)?\s*(\d{1,2}(?::\d{2})?h?(?:\s*e\s*\d{1,2}(?::\d{2})?h?)?)/i,
            /entrada\s*(?:liberada|das|após|entre)?\s*(\d{1,2}(?::\d{2})?h?(?:\s*e\s*\d{1,2}(?::\d{2})?h?)?)/i
        ];
        const checkOutPatterns = [
            /check-out\s*(?:é|até|as)?\s*(\d{1,2}(?::\d{2})?h?)/i,
            /saída\s*(?:até|as)?\s*(\d{1,2}(?::\d{2})?h?)/i
        ];

        let extractedCheckInStart = "14:00";
        let extractedCheckInEnd = "22:00";
        let extractedCheckOut = "11:00";

        for (const pattern of checkInPatterns) {
            const match = searchableText.match(pattern);
            if (match) {
                const time = match[1].toLowerCase();
                const parts = time.split(/\s+e\s+/);
                if (parts[0]) extractedCheckInStart = parts[0].includes(':') ? parts[0] : parts[0].replace('h', ':00');
                if (parts[1]) extractedCheckInEnd = parts[1].includes(':') ? parts[1] : parts[1].replace('h', ':00');
                break;
            }
        }

        for (const pattern of checkOutPatterns) {
            const match = searchableText.match(pattern);
            if (match) {
                const time = match[1].toLowerCase();
                extractedCheckOut = time.includes(':') ? time : time.replace('h', ':00');
                break;
            }
        }

        const cleanTime = (t: string) => {
            const hMatch = t.match(/(\d{1,2})/);
            if (hMatch) return `${hMatch[1].padStart(2, '0')}:00`;
            return t;
        };

        return NextResponse.json({
            success: true,
            summary: {
                photos: photosArray.length,
                amenities: amenitiesArray.length,
                rules: rulesArray.length,
                publicTitle,
                hasSubtitle: !!publicSubtitle,
                checkInStart: cleanTime(extractedCheckInStart),
                checkInEnd: cleanTime(extractedCheckInEnd),
                checkOutEnd: cleanTime(extractedCheckOut)
            }
        });

    } catch (error: any) {
        console.error("Erro na importação AirBnb:", error.message);
        return NextResponse.json({ error: "Falha ao extrair dados do Airbnb. Talvez o link seja inválido ou protegido." }, { status: 500 });
    }
}
