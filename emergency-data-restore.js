const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const cheerio = require('cheerio');

const prisma = new PrismaClient();

const AIRBNB_URL = 'https://www.airbnb.com.br/rooms/1510424097227887943';
const PROPERTY_ID = 'casa-oliveira-id';

async function restore() {
    console.log('--- INICIANDO CARGA INICIAL DE EMERGÊNCIA ---');

    try {
        console.log(`Buscando dados de: ${AIRBNB_URL}`);
        const response = await axios.get(AIRBNB_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'pt-BR,pt;q=0.9',
            },
            timeout: 10000
        });

        const html = response.data;
        const $ = cheerio.load(html);

        const title = $('meta[property="og:title"]').attr('content')?.replace(' - Airbnb', '') || 'Casa Oliveira';
        const description = $('meta[property="og:description"]').attr('content') || '';

        console.log(`Título encontrado: ${title}`);

        // Update Property
        await prisma.property.update({
            where: { id: PROPERTY_ID },
            data: {
                name: 'Casa Oliveira - Itajaí',
                publicTitle: title,
                fullDescription: description,
                shortDescription: description.substring(0, 160),
                isActive: true
            }
        });
        console.log('Imóvel atualizado.');

        // Extract Photos from Apollo State if possible (placeholder logic)
        // For now, let's just ensure we have the primary one if possible
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage) {
            await prisma.propertyPhoto.upsert({
                where: { id: 'primary-photo-id' },
                create: {
                    id: 'primary-photo-id',
                    propertyId: PROPERTY_ID,
                    imageUrl: ogImage,
                    isPrimary: true,
                    sortOrder: 0
                },
                update: {
                    imageUrl: ogImage
                }
            });
            console.log('Foto principal restaurada.');
        }

        console.log('--- CARGA INICIAL CONCLUÍDA COM SUCESSO ---');
    } catch (error) {
        console.error('Erro na restauração:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

restore();
