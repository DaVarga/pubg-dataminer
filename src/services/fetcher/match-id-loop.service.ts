import { clearInterval } from 'timers';
import { ConfigManager } from '../config/config-manager.service';
import { MatchIdFetcherFactory } from './match-id-fetcher.service';
import { IdDatabaseFactory } from '../database/id-database';
import { Service } from 'typedi';
import { Logger } from '../logger/logger.service';
import { Key } from '../../types/config-file';

@Service()
export class MatchIdLoop {
  private exit: boolean = false;
  private yesterday: Date;
  private regions: string[] = [...this.configManager.config.regions];
  private args: string[] = process.argv.slice(2).filter(arg => this.regions.indexOf(arg) !== -1);

  constructor(
    private configManager: ConfigManager,
    private idDatabaseFactory: IdDatabaseFactory,
    private matchIdFetcherFactory: MatchIdFetcherFactory,
    private logger: Logger,
  ) {
    if (!this.args.length) {
      this.args = this.regions;
    }
  }

  public async run(): Promise<void> {
    if (this.configManager.config.keys.length === 0) {
      this.logger.error('Please add your API keys to the miner-config.json, see README.md for more details.');
      return;
    }

    this.yesterday = this.getStartDate();

    return new Promise<void>(resolve => {
      let keysRunning = 0;
      this.configManager.config.keys.forEach(async k => {
        keysRunning++;
        while (this.regionsLeft()) {
          const region = this.getNextRegion();
          if (!region || this.exit) {
            break;
          }
          await this.fetchRegion(k, region);
          await this.timeout(61000 / k.rpm);
        }
        if(--keysRunning === 0) {
          resolve();
        }
      });
    });
  }

  public stop() {
    this.exit = true;
  }

  private async fetchRegion(k: Key, region: string) {
    return new Promise<void>(async (resolve) => {
      const fetcher = this.matchIdFetcherFactory.create(region, this.yesterday);
      const database = this.idDatabaseFactory.create(region);
      const interval = setInterval(async () => {
        if (this.exit || await fetcher.fetch(k.bearer)) {
          database.addToDatabase(fetcher.data);
          database.persistDatabase();
          clearInterval(interval);
          resolve();
        }
      }, 61000 / k.rpm);
    });
  }

  private getStartDate(): Date {
    let now = new Date();
    now.setDate(now.getDate() - 1);
    return now;
  }

  private getNextRegion(): string {
    return this.args.shift();
  }

  private regionsLeft(): number {
    return this.args.length;
  }

  private async timeout(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }
}
