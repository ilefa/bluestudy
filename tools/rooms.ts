import qs from 'qs';
import axios from 'axios';
import cheerio from 'cheerio';

import { writeFileSync } from 'fs';
import { AvailabilityResponse, Floor, Room } from '..';

const getDateBoundary = () => {
    let start = new Date();
    let end = new Date(start);
    
    end.setDate(start.getDate() + 1);

    return {
        start: getDateString(start),
        end: getDateString(end)
    }
}

const getFloorFromName = (name: string) => {
    let clean = name.toLowerCase();
    if (clean.startsWith('individual study room'))
        clean = clean.split('individual study room')[1].trim();

    let start = clean.slice(0, 1).toLowerCase();
    if (start === 'a') return 'A';
    if (start === 'b') return 'B';
    
    return Object
        .entries(Floor)
        .find(([_, val]) => val === start)?.[0];
}

const getDateString = (input: Date) => `${input.getFullYear()}-${prependZero(input.getMonth() + 1)}-${prependZero(input.getDate())}`;

const prependZero = (input: number) => {
    if (input < 10)
        return `0${input}`;
    return input;
}

(async () => {
    let { start, end } = getDateBoundary();
    let payload = {
        lid: 820,
        gid: 0, eid: -1,
        seat: 0, seatId: 0, zone: 0,
        pageIndex: 0, pageSize: 18,
        start, end
    };

    let opts = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Referer': 'https://uconncalendar.lib.uconn.edu/reserve/GroupStudyRooms',
        }
    };

    let res: AvailabilityResponse[] = await axios
        .post('https://uconncalendar.lib.uconn.edu/spaces/availability/grid', qs.stringify(payload), opts)
        .then(res => res.data)
        .then(data => data.slots)
        .catch(_ => console.error('error:', _));

    if (!res) return;

    let ids = res.reduce((prev, cur) => {
        if (!prev.has(cur.itemId))
            prev.add(cur.itemId);
        return prev;
    }, new Set<number>());

    let payloads = await Promise.all([...ids].map(async id => ({
        id, payload: await axios
            .get(`https://uconncalendar.lib.uconn.edu/equipment/item/${id}/info`)
            .then(res => res.data)
            .catch(_ => null)
    })));

    let meta: Room[] = payloads
        .filter(ent => !!ent.payload)
        .map(payload => ({
            id: payload.id,
            $: cheerio.load(payload.payload)
        }))
        .map(({ id, $ }) => {
            let name = $('#myModalLabel').text().trim().split('\n')[0];
            let floor = getFloorFromName(name);
            let capacityText = $('#myModalLabel > small').text().trim();
            let capacity = parseInt(capacityText.split('\n')[1].trim());
            let description = $('.s-lc-section-description > p').text().trim().split('\n')[0];
            let image = $('.img-thumbnail')?.attr('src');

            let roomType = 'group';
            if (capacity <= 2) 
                roomType = 'individual';

            return {
                id, name, floor, capacity,
                roomType, description, image
            } as Room;
        });

    writeFileSync('rooms.json', JSON.stringify(meta, null, 4));
    console.log('Wrote rooms to disk.');
})();