import {clearInterval} from 'timers';
import {ConfigManager} from './config/configManager';
import {MatchIdFetcher} from './fetcher/matchIdFetcher';
import {IdDatabase} from "./database/id-database";
import {Requester} from "./client/Requester";

class Main {
  private yesterday: Date = new Date();
  private configManager: ConfigManager = new ConfigManager('miner-config.json');
  private regions: string[] = [...this.configManager.config.regions];

  constructor() {
    this.yesterday.setDate(this.yesterday.getDate() - 1);

    for (let k of this.configManager.config.keys) {
      let region = this.getNextRegion();
      if(!region) {
        return;
      }
      let fetcher = new MatchIdFetcher(region, this.yesterday);
      let database = new IdDatabase(this.configManager, region);
      let requester = new Requester(k.bearer);

      const interval = setInterval(async () => {


        if (fetcher !== null && await fetcher.fetch(requester)) {
          database.addToDatabase(fetcher.data);
          database.persistDatabase();

          region = this.getNextRegion();
          if (!region) {
            clearInterval(interval);
            return;
          }
          fetcher = new MatchIdFetcher(region, this.yesterday);
          database = new IdDatabase(this.configManager, region);
        }
      }, 66000 / k.rpm);

    }

    if (this.configManager.config.keys.length === 0) {
      console.error(`Please add your API keys to the miner-config.json, see README.md for more details.`);
      process.exit();
    }
  }

  private getNextRegion(): string {
    return this.regions.shift();
  }
}

// tslint:disable-next-line:no-unused-expression
new Main();
