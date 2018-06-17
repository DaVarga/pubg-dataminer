# Playerunknowns Battlegrounds api match telemetry data miner
This program fetches all match-ids of the last 14 days for the specified regions. 
The match-ids will then be used to pull the telemetry data from the matches. 

Telemetry data is compressed in 7z format for space reasons - which results in a saving of approx. 90%.
## Dependencies:
7z
nodejs >= 8.0.0

## Installation:
clone or download repo and run in project directory

```$ npm install```

## How to run:

To fetch match ids

```$ npm run fetch:matches```


To fetch telemetry files of your collected match ids

```$ npm run fetch:telemetry```

## Adding API keys
Create a developer account on https://developer.playbattlegrounds.com/ and add one ore more API keys into the miner-config.json. Make sure you set the rpm (request per minute) too.

example:
```
{
  "keys": [
    {
      "bearer": "eyJ.....",
      "rpm": 10
    },
    {
      "bearer": "eyJ.....",
      "rpm": 10
    }
  ],
  "regions": [
    "pc-eu",
    "pc-as",
    "pc-jp",
    "pc-kakao",
    "pc-krjp",
    "pc-na",
    "pc-oc",
    "pc-ru",
    "pc-sa",
    "pc-sea",
    "xbox-as",
    "xbox-eu",
    "xbox-na",
    "xbox-oc"
  ],
  "dbPath": "output/"
}
```

## Contribute
Feel free to rise a pull request.