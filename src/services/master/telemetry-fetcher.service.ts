import * as PromisePool from 'es6-promise-pool';
import { ConfigManager } from '../shared/config-manager.service';
import { IdDatabase, IdDatabaseFactory } from './id-database.service';
import { Service } from 'typedi';
import { Mongodb } from '../shared/mongodb.service';
import { WorkerPool } from './worker-pool.service';

@Service()
export class TelemetryFetcher {
  private exit = false;
  private regions: string[];

  constructor(
    private configManager: ConfigManager,
    private workerPool: WorkerPool,
    private mongodb: Mongodb,
    private idDatabaseFactory: IdDatabaseFactory,
  ) {
    this.regions = [...this.configManager.config.regions];
  }

  public async run() {
    await this.mongodb.connect();
    await this.workerPool.init();
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

  private fetchTelemetry(id, region): Promise<void> {
    return this.workerPool.fetchTelemetry(id, region);
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
        yield this.fetchTelemetry(id, region).catch(() => {
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
