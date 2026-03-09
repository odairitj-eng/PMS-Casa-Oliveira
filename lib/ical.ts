import axios from 'axios';
import { BlockedSource } from '@prisma/client';

export interface ICalEvent {
    start: Date;
    end: Date;
    summary?: string;
}

export async function fetchAndParseICal(url: string): Promise<ICalEvent[]> {
    const ical = require('node-ical');
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Casa-Oliveira-Sync/1.0',
            }
        });

        const data = ical.parseICS(response.data);
        const events: ICalEvent[] = [];

        for (const k in data) {
            if (data.hasOwnProperty(k)) {
                const ev = data[k] as any;
                if (ev.type === 'VEVENT' && ev.start && ev.end) {
                    events.push({
                        start: new Date(ev.start),
                        end: new Date(ev.end),
                        summary: ev.summary || 'Bloqueio Externo'
                    });
                }
            }
        }

        return events;
    } catch (error) {
        console.error(`Error fetching iCal from ${url}:`, error);
        throw error;
    }
}

export function getSourceFromPlatform(platform: string): BlockedSource {
    const p = platform.toUpperCase();
    if (p === 'AIRBNB') return BlockedSource.AIRBNB;
    if (p === 'BOOKING') return BlockedSource.BOOKING;
    if (p === 'CHANNEX') return (BlockedSource as any).CHANNEX;
    return BlockedSource.MANUAL;
}
