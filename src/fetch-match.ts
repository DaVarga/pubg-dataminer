import * as PromisePool from 'es6-promise-pool';
import {Requester} from './client/Requester';
import {ConfigManager} from './config/configManager';
import {IdDatabase} from './database/id-database';
import {MatchDatabase} from './database/match-database';

class Main {
  private configManager: ConfigManager = new ConfigManager('miner-config.json');
  private regions: string[] = [...this.configManager.config.regions];
  private requester: Requester = new Requester();
  private matchDatabase: MatchDatabase = new MatchDatabase(this.configManager);
  private readonly args: string[] = process.argv.slice(2).filter((arg: string) => this.regions.indexOf(arg) !== -1);

  constructor() {
    if (!this.args.length) {
      this.args = this.regions;
    }
  }

  public async run() {
    for (const region of this.args) {
      await this.load(region);
    }
    process.exit();
  }

  private async load(region: string) {
    const idDatabase: IdDatabase = new IdDatabase(this.configManager, region);
    const failsDatabase: IdDatabase = new IdDatabase(this.configManager, region + '-fail');
    // noinspection TypeScript
    const promisePool: PromisePool<void> = new PromisePool<void>(
      this.generatePromises(idDatabase, failsDatabase, region),
      this.configManager.config.matchConcurrency,
    );
    await promisePool.start();
  }

  private async fetchMatch(region: string, id: string): Promise<void> {
    const matchInfo = await this.requester.getMatchInfo(region, id);
    // noinspection TsLint
    const data: any = JSON.parse(matchInfo);
    const urlParsed = (data.included.find((e) => e.type === 'asset').attributes.URL);
    const matchTelemetry = await  this.requester.getMatchTelemetry(urlParsed);
    await this.matchDatabase.addMatch(region, id, matchInfo, matchTelemetry);
  }

  private* generatePromises(
    idDatabase: IdDatabase,
    failsDatabase: IdDatabase,
    region: string,
  ): IterableIterator<Promise<void>> {
    for (const id of idDatabase.ids) {
      if (!this.matchDatabase.checkMatch(region, id) && !failsDatabase.ids.has(id)) {
        yield this.fetchMatch(region, id).catch(() => {
          failsDatabase.addToDatabase(new Set<string>([id]));
          failsDatabase.persistDatabase();
          console.error(
            `[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] error fetching ${region} ${id}`
          );
        });
      } else {
        yield Promise.resolve();
      }
    }
  }
}

new Main().run();
