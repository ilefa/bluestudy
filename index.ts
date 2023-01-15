import qs from 'qs';
import axios from 'axios';

export type MonthDayPair = [number, number];

export enum Floor {
    A, B, ONE, TWO, THREE, FOUR
}

export type Room = {
    readonly name: string;
    readonly id: string;
    readonly floor: Floor;
    readonly capacity: number;
    readonly features: string[];
}

export type AvailabilityResponse = {
    start: number;
    end: number;
    itemId: number;
    checksum: string;
    className: string;
}

export type AvailabilityRecord = Omit<AvailabilityResponse, 'className'> & {
    state: 'available' | 'unavailable';
}

export const Rooms: Room[] = [
    {
        name: '1103A',
        id: '12445',
        floor: Floor.ONE,
        capacity: 5,
        features: []
    },
    {
        name: '1103B',
        id: '12447',
        floor: Floor.ONE,
        capacity: 5,
        features: []
    },
    {
        name: '1104A',
        id: '12448',
        floor: Floor.ONE,
        capacity: 5,
        features: []
    },
    {
        name: '1104B',
        id: '12449',
        floor: Floor.ONE,
        capacity: 5,
        features: []
    },
    {
        name: '1104C',
        id: '12450',
        floor: Floor.ONE,
        capacity: 5,
        features: []
    },
    {
        name: '1104D',
        id: '12451',
        floor: Floor.ONE,
        capacity: 5,
        features: []
    },
    {
        name: '1104E',
        id: '12456',
        floor: Floor.ONE,
        capacity: 5,
        features: []
    },
    {
        name: '1104F',
        id: '12457',
        floor: Floor.ONE,
        capacity: 5,
        features: []
    },
    {
        name: '1105A',
        id: '12454',
        floor: Floor.ONE,
        capacity: 5,
        features: []
    },
    {
        name: '1105B',
        id: '12455',
        floor: Floor.ONE,
        capacity: 5,
        features: []
    },
    {
        name: '1106A',
        id: '12458',
        floor: Floor.ONE,
        capacity: 5,
        features: []
    },
    {
        name: '1106B',
        id: '12459',
        floor: Floor.ONE,
        capacity: 5,
        features: []
    },
    {
        name: '1128',
        id: '12453',
        floor: Floor.ONE,
        capacity: 5,
        features: []
    },
    {
        name: '2100',
        id: '12460',
        floor: Floor.TWO,
        capacity: 6,
        features: []
    },
    {
        name: '2149',
        id: '12461',
        floor: Floor.TWO,
        capacity: 6,
        features: []
    },
    {
        name: '2177',
        id: '12462',
        floor: Floor.TWO,
        capacity: 6,
        features: []
    },
    {
        name: '2200',
        id: '12463',
        floor: Floor.TWO,
        capacity: 12,
        features: []
    },
    {
        name: '3166A',
        id: '12465',
        floor: Floor.THREE,
        capacity: 6,
        features: []
    },
    {
        name: '3166B',
        id: '12466',
        floor: Floor.THREE,
        capacity: 6,
        features: []
    },
    {
        name: '3182',
        id: '12467',
        floor: Floor.THREE,
        capacity: 12,
        features: []
    },
    {
        name: '4100',
        id: '12468',
        floor: Floor.FOUR,
        capacity: 6,
        features: []
    },
    {
        name: '4100',
        id: '12468',
        floor: Floor.FOUR,
        capacity: 6,
        features: []
    },
    {
        name: '4129',
        id: '12469',
        floor: Floor.FOUR,
        capacity: 6,
        features: []
    },
    {
        name: '4134A',
        id: '12470',
        floor: Floor.FOUR,
        capacity: 6,
        features: []
    },
    {
        name: '4134B',
        id: '12471',
        floor: Floor.FOUR,
        capacity: 6,
        features: []
    },
    {
        name: '4177',
        id: '12472',
        floor: Floor.FOUR,
        capacity: 6,
        features: []
    },
    {
        name: '4182A',
        id: '12473',
        floor: Floor.FOUR,
        capacity: 6,
        features: []
    },
    {
        name: '4182B',
        id: '12474',
        floor: Floor.FOUR,
        capacity: 6,
        features: []
    },
    {
        name: '4200',
        id: '12475',
        floor: Floor.FOUR,
        capacity: 12,
        features: []
    },
    {
        name: 'B141A',
        id: '12371',
        floor: Floor.B,
        capacity: 6,
        features: []
    },
    {
        name: 'B141B',
        id: '12440',
        floor: Floor.B,
        capacity: 6,
        features: []
    },
    {
        name: 'B144A',
        id: '12441',
        floor: Floor.B,
        capacity: 6,
        features: []
    },
    {
        name: 'B144B',
        id: '12442',
        floor: Floor.B,
        capacity: 6,
        features: []
    },
    {
        name: 'B149A',
        id: '12443',
        floor: Floor.B,
        capacity: 6,
        features: []
    },
    {
        name: 'B149B',
        id: '12444',
        floor: Floor.B,
        capacity: 6,
        features: []
    }
];

const getOrDefault = (input?: MonthDayPair, def = new Date()) => {
    if (!input) return def;

    let date = new Date();
    date.setMonth(input[0]);
    date.setDate(input[1]);
    date.setHours(0, 0, 0, 0);

    return date;
}

const prependZero = (input: number) => {
    if (input < 10)
        return `0${input}`;
    return input;
}

const getDateBoundary = (during: MonthDayPair) => {
    let start = getOrDefault(during);
    let end = new Date(start);
    
    end.setDate(start.getDate() + 1);

    return {
        start: getDateString(start),
        end: getDateString(end)
    }
}

const getDateString = (input: Date) => `${input.getFullYear()}-${prependZero(input.getMonth())}-${prependZero(input.getDate())}`;

export const floorSorter = (a: Room, b: Room) => {
    if (a.floor === b.floor)
        return a.name.localeCompare(b.name);
    return a.floor - b.floor;
}

export const resolveRoomById = (id: string) => Rooms.find(({ id: roomId }) => roomId === id);

/**
 * Attempts to retrieve availability data
 * for the UConn Library study spaces.
 * 
 * @param date [optional] the target date to receive availability data for
 */
export const getAvailability = async (date?: MonthDayPair) => {
    let { start, end } = getDateBoundary(date);
    let payload = {
        lid: 820, gid: 1425, eid: -1,
        seat: 0, seatId: 0, zone: 0,
        accessible: 0, powered: 0,
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
        .catch(_ => []);

    let grid: Record<string, AvailabilityRecord[]> = res.reduce((prev, cur) => {
        let room = resolveRoomById(cur.itemId.toString());
        if (!room) return;
        if (!prev[room.name])
            prev[room.name] = [];

        let patched: AvailabilityRecord = {
            start: cur.start,
            end: cur.end,
            itemId: cur.itemId,
            checksum: cur.checksum,
            state: cur.className?.includes('unavailable') ? 'unavailable' : 'available'
        }

        prev[room.name].push(patched);
        return prev;
    }, {});

    return grid;
}