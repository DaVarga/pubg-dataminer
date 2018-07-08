# Playerunknowns Battlegrounds api match telemetry data miner
This program fetches all match-ids of the last 14 days for the specified regions. 
The match-ids will then be used to pull the telemetry data from the matches. 

Telemetry data is compressed in 7z format for space reasons - which results in a saving of approx. 90%.
## Dependencies:
- 7z
- nodejs >= 8.0.0

## Installation:
clone or download repo and run in project directory

```$ npm install```

## How to run:
- To fetch match ids

  ```$ npm run fetch:matches```


- To fetch telemetry files of your collected match ids

  ```$ npm run fetch:telemetry```

## Adding API keys
Create a developer account on https://developer.playbattlegrounds.com/ and add one ore more API keys into the miner-config.json. Make sure you set the rpm (request per minute) too.  
Start the program once if you cant find the configuration file. The default file should be created on first lunch.

example:
```json
{
   "keys":[
      {
         "bearer":"eyJ.....",
         "rpm":10
      },
      {
         "bearer":"eyJ.....",
         "rpm":10
      }
   ],
   "regions":[
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
   "dbPath":"output/",
   "matchConcurrency":10,
   "execParams7z":"-mx=3",
   "logLevel":0
}
```

## Peformance
The cpu can become a limiting factor if you have a fast internet connection. Most resources are used by 7zip to compress the telemetry files. The cpu may not be able to keep up here.  
On my machine with an Intel Core i7-3770 and a 1Gbit/s connection I could achieve a download speed of ~0.8GBit/s at 80% cpu utilization with the following settings.

```json
  "matchConcurrency": 32,   
  "execParams7z": "-mx=3 -mmt=off",
```

- **matchConcurency:** Number of parallel telemetry requests 
    -  Number of parallel telemetry requests 32
- **execParams7z:** 7za execution [parameters](https://sevenzip.osdn.jp/chm/cmdline/switches/method.htm)
    - *-mx=3* compression level 3. Sufficient compression at comparatively low utilization
    - *-mmt=off* Multi threding disabled since many 7z instances are running at the same time anyway. 

![utilizaton](https://i.imgur.com/OYyreOl.png "Utilization")

![traffic](https://imgur.com/Hplyc65.png "Traffic")


## Contribute
Patches welcome
