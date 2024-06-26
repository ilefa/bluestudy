# Bluestudy

![version badge](https://img.shields.io/badge/version-1.0.0-blue)

Bluestudy is a TypeScript library that allows you to easily fetch the schedule for UConn Library study rooms.

## Installation

Use npm to install Bluestudy.

```bash
npm install @ilefa/bluestudy
```

## Usage

```ts
import { Floor, getAvailability, getRoomById, getRoomByName } from '@ilefa/bluestudy';

// Fetch availability for all rooms for today
let meals = await getAvailability();

{
  '1128': [
    {
      start: '2023-01-15 12:00:00',
      end: '2023-01-15 15:00:00',
      itemId: 12453,
      checksum: 'c11d5428d3ee31aa9d99de346e3ddf1c',
      state: 'available'
    },
    {
      start: '2023-01-15 15:00:00',
      end: '2023-01-15 17:00:00',
      itemId: 12453,
      checksum: '9bc32cf0c6662f6606e4249c41030929',
      state: 'unavailable'
    }
  ],
  ...
}

// Fetch availability of a B149B on January 15th
let b149b = await getAvailability(getRoomByName('B149B'), [1, 15]);

{
  "B149B": [
    {
      "start": "2024-01-15 12:00:00",
      "end": "2024-01-15 15:00:00",
      "itemId": 12453,
      "checksum": "c11d5428d3ee31aa9d99de346e3ddf1c",
      "state": "available"
    },
    {
      "start": "2024-01-15 15:00:00",
      "end": "2024-01-15 17:00:00",
      "itemId": 12453,
      "checksum": "9bc32cf0c6662f6606e4249c41030929",
      "state": "unavailable"
    }
  ]
}

// Get a room by it's ID
const b149b = getRoomById('12444');

{
    "name": "B149B",
    "id": "12444",
    "floor": Floor.B,
    "capacity": 6,
    "features": []
}

// Comparator to sort rooms by floor
const arr = [room2100, room1104];
const sorted = arr.sort(floorSorter);

[
    room1104,
    room2100
]
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[GPL-3.0](https://choosealicense.com/licenses/gpl-3.0/)