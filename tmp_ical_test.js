const ical = require('node-ical');

const icsContent = `BEGIN:VCALENDAR
PRODID;X-RICAL-TZSOURCE=TZINFO:-//Airbnb Inc//Hosting Calendar 0.8.8//EN
CALSCALE:GREGORIAN
VERSION:2.0
BEGIN:VEVENT
DTEND;VALUE=DATE:20260313
DTSTART;VALUE=DATE:20260309
UID:1418-2026-03-09-2026-03-13@airbnb.com
SUMMARY:Davi
END:VEVENT
END:VCALENDAR`;

const data = ical.parseICS(icsContent);
for (const k in data) {
    if (data.hasOwnProperty(k)) {
        const ev = data[k];
        if (ev.type === 'VEVENT') {
            const startDate = new Date(ev.start);
            const endDate = new Date(ev.end);
            console.log('node-ical raw start:', ev.start);
            console.log('node-ical raw end:', ev.end);
            console.log('new Date(start):', startDate.toISOString(), startDate.toString());
            console.log('new Date(end):', endDate.toISOString(), endDate.toString());
        }
    }
}
