import qs from 'qs';
import axios from 'axios';
import Rooms from './rooms.json';

export enum Floor {
    A = '-1',
    B = '0',
    ONE = '1',
    TWO = '2',
    THREE = '3',
    FOUR = '4'
}

export type Room = {
    name: string;
    id: number;
    floor: keyof typeof Floor;
    capacity: number;
    roomType: 'individual' | 'group';
    description: string;
    image?: string;
}

export enum Groups {
    All = 0,
    Group = 1425,
    Individual = 34588
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
    room: string;
    roomId: number;
}

const prependZero = (input: number) => {
    if (input < 10)
        return `0${input}`;
    return input;
}

const getDateBoundary = () => {
    let start = new Date();
    let end = new Date(start);
    
    end.setDate(start.getDate() + 1);

    return {
        start: getDateString(start),
        end: getDateString(end)
    }
}

const getDateString = (input: Date) => `${input.getFullYear()}-${prependZero(input.getMonth() + 1)}-${prependZero(input.getDate())}`;

export const floorSorter = (a: Room, b: Room) => {
    if (a.floor === b.floor)
        return a.name.localeCompare(b.name);
    return parseInt(a.floor) - parseInt(b.floor);
}

export const getRooms = (): Room[] => Rooms as Room[];

export const getRoomById = (id: number) => Rooms.find(({ id: roomId }) => roomId === id);

export const getRoomByName = (name: string) => Rooms.find(room => room.name === name);

export const getRoomsOnFloor = (floor: Floor) => Rooms.filter(room => room.floor === floor);

/**
 * Attempts to retrieve availability data
 * for the UConn Library study spaces.
 * 
 * If `roomId` is not provided, the function will
 * return availability data for all rooms.
 * 
 * @param roomId [optional] the target room to receive availability data for
 * @param date [optional] the target date to receive availability data for
 */
export const getAvailability = async (groupId?: Groups, roomId?: number): Promise<AvailabilityRecord[]> => {
    if (roomId && !getRoomById(roomId))
        return [];    

    let { start, end } = getDateBoundary();
    let payload = {
        lid: 820,
        gid: groupId ?? 0, eid: roomId ?? -1,
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

    let grid: AvailabilityRecord[] = res.map(ent => {
        let room = getRoomById(ent.itemId);
        if (!room) return;

        let patched: AvailabilityRecord = {
            start: ent.start,
            end: ent.end,
            itemId: ent.itemId,
            checksum: ent.checksum,
            room: room.name,
            roomId: room.id,
            state: (!ent.className || ent.className.includes('s-lc-eq-avail'))
                ? 'available'
                : 'unavailable'
        }

        return patched;
    });

    if (roomId) return grid.filter(room => room.roomId === roomId);

    return grid;
}