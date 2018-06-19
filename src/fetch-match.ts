import {ConfigManager} from "./config/configManager";
import {Requester} from "./client/Requester";
import {IdDatabase} from "./database/id-database";
import {MatchDatabase} from "./database/match-database";

class Main {
  private configManager: ConfigManager = new ConfigManager('miner-config.json');
  private regions: string[] = [...this.configManager.config.regions];
  private requester: Requester = new Requester();
  private matchDatabase: MatchDatabase = new MatchDatabase(this.configManager);

  public async run() {
    for (let region of this.regions) {
      await this.load(region);
    }
  }

  private async load(region: string) {
    const idDatabase: IdDatabase = new IdDatabase(this.configManager, region);
    const failsDatabase: IdDatabase = new IdDatabase(this.configManager, region + '-fail');
    for (let id of idDatabase.ids) {
      try {
        if (!this.matchDatabase.checkMatch(region, id) && !failsDatabase.ids.has(id)) {
          const matchInfo = await this.requester.getMatchInfo(region, id);
          const data: any = JSON.parse(matchInfo);
          const urlParsed = (data.included.find((e) => e.type === 'asset').attributes.URL);
          const matchTelemetry = await  this.requester.getMatchTelemetry(urlParsed);
          this.matchDatabase.addMatch(region, id, matchInfo, matchTelemetry);
        } else {
          console.info(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] skipping ${region} ${id}`);
        }
      } catch (e) {
        failsDatabase.addToDatabase(new Set<string>([id]));
        failsDatabase.persistDatabase();
        console.error(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] FETCH ERROR: ${region} ${id}`);
        console.error(e);
      }
    }
  }

}

// noinspection JSIgnoredPromiseFromCall
new Main().run();
