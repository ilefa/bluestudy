# Bluesign

![version badge](https://img.shields.io/badge/version-1.0.0-blue)

Bluesign is a TypeScript library that allows you to easily fetch the schedule for any UConn room.

## Installation

Use npm to install Bluesign.

```bash
npm install @ilefa/bluesign
```

Since Blueplate is currently hosted on GitHub packages, you will need to make a ``.npmrc`` file in the root of your project, and insert the following:

```env
@ilefa:registry=https://npm.pkg.github.com
```

## Usage

```ts
import { getRoomSchedule, isRoomTracked } from '@ilefa/bluesign';

// Fetch everything happening at McHugh Room 201
let meals = await getRoomSchedule("MCHU_201");

{
    "title": "MCHU 201"
    "date": "11/17/2021"
    "entries": [
        {
            "start": "8:00 AM",
            "end": "8:50 AM",
            "eyent": "CE 3640",
            "section": "005",
            "independent": false
        },
        {
            "start": "9:05 AM",
            "end": "9:55 AM",
            "event". "SOCI 3307",
            "section": "001",
            "independent": false
        }
        ...
    ]
}

// Check if a room is tracked (has a schedule)
let tracked = isRoomTracked("MCHU_201");
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[GPL-3.0](https://choosealicense.com/licenses/gpl-3.0/)