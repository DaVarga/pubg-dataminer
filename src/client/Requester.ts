import * as https from "https";
import * as url from "url";

export class Requester {
  constructor(private apiKey?: string) {
  }

  public async getMatchIds(region: string, startDate: Date): Promise<string> {
    const options: https.RequestOptions = {
      headers: {
        accept: 'application/vnd.api+json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      host: 'api.playbattlegrounds.com',
      port: 443,
      method: 'GET',
      path: `/shards/${region}/samples?filter[createdAt-start]=${startDate.toISOString()}`,
    };
    return this.request(options);
  }

  public async getMatchInfo(region: string, matchId: string): Promise<string> {
    const options: https.RequestOptions = {
      headers: {
        accept: 'application/vnd.api+json',
      },
      host: 'api.playbattlegrounds.com',
      port: 443,
      method: 'GET',
      path: `/shards/${region}/matches/${matchId}`,
    };
    return this.request(options);
  }

  public async getMatchTelemetry(apiUrl: string): Promise<string> {
    const options: https.RequestOptions = {
      headers: {
        accept: 'application/vnd.api+json',
      },
      host: url.parse(apiUrl).host,
      port: 443,
      method: 'GET',
      path: url.parse(apiUrl).path,
    };
    return this.request(options);
  }

  private async request(options: https.RequestOptions): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      https.get(options, (res: any) => {
        let data: string = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            console.error(`ERROR: ${res.statusCode}`);
            console.error(`BODY: ${data}`);
            reject(res.statusCode);
          }
        });
      }).on('error', (e: any) => {
        reject(e);
      });
    })
  }
}
