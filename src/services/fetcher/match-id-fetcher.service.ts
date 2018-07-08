import { ApiRequester } from '../api-request/api-request.service';
import { Logger } from '../logger/logger.service';
import { Service } from 'typedi';

@Service()
export class MatchIdFetcherFactory {

  constructor(private apiRequester: ApiRequester, private logger: Logger) {
  }

  create(region: string, date: Date) {
    return new MatchIdFetcher(this.apiRequester, this.logger, region, date);
  }
}

@Service({factory: [MatchIdFetcherFactory, 'create']})
export class MatchIdFetcher {
  private catalog: Set<string> = new Set<string>();
  private currentDate: Date;

  constructor(private apiRequester: ApiRequester, private logger: Logger, private region: string, date: Date) {
    this.currentDate = new Date(date);
  }

  public get data(): Set<string> {
    return this.catalog;
  }

  public async fetch(apiKey: string): Promise<boolean> {
    this.currentDate.setDate(this.currentDate.getDate() - 1);
    if (new Date().valueOf() - this.currentDate.valueOf() > 14*24*60*60*1000) { //exit condition 14days
      this.logger.info(`maximum fetched`);
      return true;
    }

    try {
      let data = await this.apiRequester.getMatchIds(apiKey, this.region, this.currentDate);
      this.getMatchIds(data).forEach((id: string) => this.catalog.add(id));
      this.logger.info(`fetched ${this.catalog.size} match ids for region ${this.region}`);
    } catch (e) {
    }

    return false;
  }

  public reset(date: Date = new Date()) {
    this.currentDate = new Date(date);
    this.catalog.clear();
  }

  private getMatchIds(json: string): string[] {
    // tslint:disable-next-line:no-any
    const obj: any = JSON.parse(json);

    // tslint:disable-next-line:no-any
    return (obj.data.relationships.matches.data as any[]).map((x: any) => x.id) as string[];
  }
}
