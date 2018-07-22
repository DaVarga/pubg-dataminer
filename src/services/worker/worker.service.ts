import * as process from 'process';
import { Service } from 'typedi';
import { ApiRequester } from '../shared/api-request.service';
import { MessageTelemetryFetch } from '../../types/message-telemetry-fetch';
import { MatchDatabase } from '../shared/match-database.service';
import { MessageWorkerDone } from '../../types/message-worker-done';
import { Mongodb } from '../shared/mongodb.service';

@Service()
export class Worker {

  constructor(
    private requester: ApiRequester,
    private matchDatabase: MatchDatabase,
    private mongodb: Mongodb,
  ) {
  }

  public async init() {
    await this.mongodb.connect();
    process.on('message', msg => this.handleMessage(msg));
    process.send({ready: true});
  }

  private async fetchMatch(region: string, id: string): Promise<void> {
    if (await this.matchDatabase.checkMatch(region, id)) {
      return;
    }
    const matchInfo = await this.requester.getMatchInfo(region, id);
    // tslint:disable-next-line:no-any
    const infoParsed: any = JSON.parse(matchInfo);
    // tslint:disable-next-line:typedef
    const urlParsed = (infoParsed.included.find((e) => e.type === 'asset').attributes.URL);
    const matchTelemetry = await this.requester.getMatchTelemetry(urlParsed);
    console.time(`parsing ${id}`);
    const parsedTelemetry = JSON.parse(matchTelemetry);
    console.timeEnd(`parsing ${id}`);

    console.time(`inserting ${id}`);
    await this.matchDatabase.addMatch(id, infoParsed, parsedTelemetry);
    console.timeEnd(`inserting ${id}`);
  }

  private async handleMessage(msg: MessageTelemetryFetch) {
    try {
      await this.fetchMatch(msg.region, msg.id);
      this.sendResult(true);
    } catch (e) {
      this.sendResult(false, e);
    }

  }

  private sendResult(success: boolean, err?: any) {
    let msg: MessageWorkerDone = {success: success, err: err};
    process.send(msg);
  }

}
