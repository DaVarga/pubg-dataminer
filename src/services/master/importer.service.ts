import { Service } from 'typedi';
import { ConfigManager } from '../shared/config-manager.service';
import { MatchDatabase } from '../shared/match-database.service';
import { Mongodb } from '../shared/mongodb.service';

@Service()
export class Importer {
  private exit = false;
  private regions: string[];

  constructor(
    private configManager: ConfigManager,
    private matchDatabase: MatchDatabase,
    private mongodb: Mongodb
  ) {
    this.regions = [...this.configManager.config.regions];
  }


  public async run(): Promise<void> {
    await this.mongodb.connect();
    for (const region of this.regions) {
      if (this.exit) {
        break;
      }
      await this.insert(region);
    }
  }

  public stop() {
    this.exit = true;
  }

  private async insert(region:string) {
    const ids = this.matchDatabase.getZippedIds(region);
    for (const match of ids) {
      if (this.exit) {
        break;
      }
      if(this.mongodb.matchExists(match)) {
        continue;
      }
      let data = await this.matchDatabase.getZippedMatch(region, match);
      data.info._id = match;
      await this.mongodb.insertMatch(data.info, data.telemetry);
    }
  }
}
