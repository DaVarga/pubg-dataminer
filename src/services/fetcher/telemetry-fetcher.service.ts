import * as PromisePool from 'es6-promise-pool';
import { ConfigManager } from '../config/config-manager.service';
import { ApiRequester } from '../api-request/api-request.service';
import { MatchDatabase } from '../database/match-database.service';
import { IdDatabase, IdDatabaseFactory } from '../database/id-database.service';
import { Service } from 'typedi';
import { Mongodb } from '../mongodb/mongodb.service';

@Service()
export class TelemetryFetcher {
  private exit = false;
  private regions: string[];

  constructor(
    private configManager: ConfigManager,
    private requester: ApiRequester,
    private matchDatabase: MatchDatabase,
    private idDatabaseFactory: IdDatabaseFactory,
    private mongodb: Mongodb,
  ) {
    this.regions = [...this.configManager.config.regions];
  }

  public async run() {
    await this.mongodb.connect();
    for (const region of this.regions) {
      if (this.exit) {
        break;
      }
      await this.load(region);
    }
    return true;
  }

  public stop() {
    this.exit = true;
  }

  private async load(region: string) {
    const idDatabase: IdDatabase = this.idDatabaseFactory.create(region);
    const failsDatabase: IdDatabase = this.idDatabaseFactory.create(`${region}-fail`);
    // noinspection TypeScript
    const promisePool: PromisePool<void> = new PromisePool<void>(
      this.generatePromises(idDatabase, failsDatabase, region),
      this.configManager.config.matchConcurrency,
    );
    await promisePool.start();
  }

  private async fetchMatch(region: string, id: string): Promise<void> {
    if(await this.matchDatabase.checkMatch(region, id)) {
      return;
    }
    const matchInfo = await this.requester.getMatchInfo(region, id);
    // tslint:disable-next-line:no-any
    const infoParsed: any = JSON.parse(matchInfo);
    // tslint:disable-next-line:typedef
    const urlParsed = (infoParsed.included.find((e) => e.type === 'asset').attributes.URL);
    const matchTelemetry = await this.requester.getMatchTelemetry(urlParsed);
    console.time(`parsing ${id}`);
    const parsedTelemetry = JSON.parse(matchTelemetry)
    console.timeEnd(`parsing ${id}`);
    await this.matchDatabase.addMatch(id, infoParsed, parsedTelemetry);
  }

  private* generatePromises(
    idDatabase: IdDatabase,
    failsDatabase: IdDatabase,
    region: string,
  ): IterableIterator<Promise<void>> {
    for (const id of idDatabase.ids) {
      if (this.exit) {
        break;
      }
      if (!failsDatabase.ids.has(id)) {
        yield this.fetchMatch(region, id).catch(() => {
          failsDatabase.addToDatabase(new Set<string>([id]));
          failsDatabase.persistDatabase();
          console.error(
            `error fetching ${region} ${id}`,
          );
        });
      } else {
        yield Promise.resolve();
      }
    }
  }
}
