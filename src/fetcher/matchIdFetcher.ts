import {Requester} from '../client/Requester';

export class MatchIdFetcher {
  private catalog: Set<string> = new Set<string>();
  private currentDate: Date;
  private reg: string;

  constructor(region: string, date: Date) {
    this.currentDate = new Date(date);
    this.reg = region;
  }

  public get data(): Set<string> {
    return this.catalog;
  }

  public get region(): string {
    return this.reg;
  }

  public async fetch(requester: Requester): Promise<boolean> {
    this.currentDate.setDate(this.currentDate.getDate() - 1);
    if (new Date().valueOf() - this.currentDate.valueOf() > 1209600000) { //exit condition 336h
      console.warn(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] maximum fetched`);
      return true;
    }

    try {
      let data = await requester.getMatchIds(this.region, this.currentDate);
      this.getMatchIds(data).forEach((id: string) => this.catalog.add(id));
      console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] fetched ${this.catalog.size} match ids for region ${this.region}`);
    } catch (e) {
    }

    return false;
  }


  private getMatchIds(json: string): string[] {
    // tslint:disable-next-line:no-any
    const obj: any = JSON.parse(json);

    // tslint:disable-next-line:no-any
    return (obj.data.relationships.matches.data as any[]).map((x: any) => x.id) as string[];
  }
}
