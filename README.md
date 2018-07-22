# Playerunknowns Battlegrounds api match telemetry data miner
This program fetches all match-ids of the last 14 days for the specified regions. 
The match-ids will then be used to pull the telemetry data from the matches. 
Telemetry data is stored into mongodb.

~~Telemetry data is compressed in 7z format for space reasons - which results in a saving of approx. 90%~~
## Dependencies
- MongoDB >= 3.0
- nodejs >= 8.0.0

## Installation
- Clone or download repo and run in project directory and run ```$ npm install```

## How to run
- To fetch match ids ```$ npm run fetch:matches```
- To fetch telemetry of your collected match ids ```$ npm run fetch:telemetry```

## Configuration
Create a developer account on https://developer.playbattlegrounds.com/ and add one ore more API keys into the miner-config.bak.json. Make sure you set the rpm (request per minute) too.  
Start the program once if you cant find the configuration file. The default file should be created on first lunch.

example:
```json
{
  "keys": [
    {
      "bearer": "BEARER_TOKEN",
      "rpm": 10
    },
    {
      "bearer": "ANOTHER_BEARER_TOKEN",
      "rpm": 10
    }
  ],
  "regions": [
    "pc-as",
    "pc-eu",
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
  "dbPath": "output/",
  "matchConcurrency": 10,
  "logLevel": 0,
  "apiBaseUrl": "https://api.playbattlegrounds.com",
  "gzip": true
  "mognoDbUrl": "mongodb://localhost:27017/",
  "mongoDbName": "pubg_telemetry"
}
```

- ```keys```: Key[] - Array of api keys
    - ```bearer```: string - Bearer token from https://developer.playbattlegrounds.com/
    - ```rpm```: number - Number of request per minute for this token
- ```regions```: string[] - Regions to process
- ```dbPath```: string - Output path for match ids and telemetry files
- ```matchConcurrency```: number - Telemetry fetching concurrency
- ```logLevel```: number - Output verbosity
- ```apiBaseUrl```: string - Pubg api base url
- ```gzip```: boolean - Use gzip for api requests
- ```mognoDbUrl```: string - url to your MongoDB
- ```mongoDbName```: boolean - name of your MongoDB

## Performance
**This section is not up to date**

~~The cpu can become a limiting factor if you have a fast internet connection. Most resources are used by 7zip to compress the telemetry files. The cpu may not be able to keep up here.~~  
~~On my machine with an Intel Core i7-3770 and a 1GBit/s connection I could achieve a download speed of ~0.8GBit/s at ~80% cpu utilization with the following settings.~~

```json
  "matchConcurrency": 32,
  "gzip": true
```

- **matchConcurrency:** Parallel match fetch and compression concurrency
    - 32 request seems to be a good choice on my setup
- **gzip:** Gzip transport compression
    - *true* In my experience, this option should stay on. It accelerates the transmission on my system by about 10% and reduces the traffic by approx 20%

![utilizaton](https://i.imgur.com/OYyreOl.png "Utilization")

![traffic](https://imgur.com/Hplyc65.png "Traffic")

## Todos

- Unit tests
- ~~Test different compression techniques~~
- Implement console args
- Improve readme
- ~~Write database import (mongodb?)~~

## Contribute
Patches welcome

